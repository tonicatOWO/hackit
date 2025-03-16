import asyncio
import json
import websockets
import threading
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List

# 創建 FastAPI 應用
app = FastAPI()

# 啟用 CORS
# :app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Binance WebSocket URL
BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@ticker"

# 保存最近的數據
recent_prices = []
MAX_DATA_POINTS = 50  # 保存最多 20 筆價格數據
price_queue = asyncio.Queue()

# WebSocket 連接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"新客戶端連接。當前連接數: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"客戶端斷開連接。當前連接數: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"發送消息時出錯: {e}")
                disconnected.append(connection)
        
        # 移除斷開的連接
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

manager = ConnectionManager()

# Binance WebSocket 處理函數（運行在單獨的線程中）
def binance_ws_worker():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(binance_price_task())

# 背景任務：連接 Binance WebSocket 並獲取價格
async def binance_price_task():
    print("開始從 Binance 獲取比特幣價格...")
    while True:
        try:
            async with websockets.connect(BINANCE_WS_URL) as websocket:
                print("已連接到 Binance WebSocket")
                while True:
                    response = await websocket.recv()
                    ticker_data = json.loads(response)
                    price = float(ticker_data["c"])  # 當前價格/收盤價

                    # 保存到最近價格列表
                    recent_prices.append(price)
                    if len(recent_prices) > MAX_DATA_POINTS:
                        recent_prices.pop(0)
                    
                    # 將數據放入隊列
                    await price_queue.put(json.dumps(recent_prices))
                    await asyncio.sleep(1)  # 控制更新頻率
        
        except Exception as e:
            print(f"連接錯誤: {e}")
            print("3 秒後重試...")
            await asyncio.sleep(3)

# WebSocket 端點
@app.websocket("/ws/btc-price")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        if recent_prices:
            await websocket.send_text(json.dumps(recent_prices))
        
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# 定期廣播數據
async def broadcast_task():
    while True:
        data = await price_queue.get()
        await manager.broadcast(data)

# 啟動時開始背景任務
@app.on_event("startup")
def startup_event():
    executor = ThreadPoolExecutor(max_workers=1)
    executor.submit(binance_ws_worker)
    asyncio.create_task(broadcast_task())

# 主函數
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)