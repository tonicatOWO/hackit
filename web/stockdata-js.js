const ws = new WebSocket("ws://localhost:8000/ws/btc-price");

let priceData = {
    pastData: [],
    futureData: []
};

// 初始化 WebSocket 連線
ws.onopen = () => console.log("WebSocket 已連線");

// 當 WebSocket 接收到數據時更新圖表
ws.onmessage = (event) => {
    try {
        // 假設 WebSocket 傳送的是單純的數字字符串數組
        const prices = JSON.parse(event.data);

        // 將所有數字字符串轉換為數字
        const numberData = prices.map(price => Number(price));

        // 根據數據長度將其分為歷史數據 (pastData) 和未來數據 (futureData)
        const midPoint = Math.floor(numberData.length / 2);
        priceData.pastData = numberData.slice(0, midPoint);
        priceData.futureData = numberData.slice(midPoint);

        // 更新圖表
        updateStockChart();
    } catch (error) {
        console.error("解析 WebSocket 數據時出錯:", error);
    }
};

ws.onclose = () => console.log("WebSocket 連線已關閉");
ws.onerror = (error) => console.error("WebSocket 發生錯誤:", error);

// 創建與更新圖表
function createStockChart() {
    const ctx = document.getElementById("stockChart").getContext("2d");

    window.stockChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "歷史數據",
                    data: [],
                    borderColor: "#0066ff",
                    backgroundColor: "rgba(0, 102, 255, 0.1)",
                    borderWidth: 4,
                    pointRadius: 0,
                    tension: 0,
                    fill: false,
                },
                {
                    label: "未來趨勢",
                    data: [],
                    borderColor: "#ff3333",
                    backgroundColor: "rgba(255, 51, 51, 0.1)",
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0,
                    fill: false,
                    borderDash: [5, 5],
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: "#e0e0e0" },
                },
                tooltip: {
                    backgroundColor: "rgba(30, 30, 30, 0.9)",
                    titleColor: "#f0f0f0",
                    bodyColor: "#f0f0f0",
                },
            },
            scales: {
                x: { display: false },
                y: { display: false },
            },
            animation: { duration: 1500 },
        },
    });
}

// 更新圖表數據
function updateStockChart() {
    if (!window.stockChart) return;

    const pastData = priceData.pastData;
    const futureData = priceData.futureData;
    const combinedData = [...pastData, ...futureData];

    // 根據歷史數據和未來數據的總長度生成時間標籤
    const labels = combinedData.map((_, i) => {
        const secondsFromNow = i - (pastData.length - 1);
        return secondsFromNow < 0 ? `${Math.abs(secondsFromNow)}秒前` : secondsFromNow === 0 ? "現在" : `${secondsFromNow}秒後`;
    });

    window.stockChart.data.labels = labels;
    window.stockChart.data.datasets[0].data = [...pastData, null];
    window.stockChart.data.datasets[1].data = Array(pastData.length).fill(null).concat(futureData);
    window.stockChart.update();
}

// 初始化圖表
window.onload = createStockChart;