// 簡易20%趨勢提示系統 - 使用原有的瘋狂通知 (邏輯修正版)

// 全局變數
let lastPrice = null;       // 上次檢查的價格
const THRESHOLD = 20;       // 價格變化閾值 (20%)
let checkerTimer = null;    // 定時器

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待其他腳本載入
    setTimeout(() => {
        console.log("初始化20%趨勢提示系統");
        startTrendMonitor();
    }, 2000);
});

// 開始監測趨勢
function startTrendMonitor() {
    // 確保只有一個定時器在運行
    if (checkerTimer) {
        clearInterval(checkerTimer);
    }
    
    // 獲取初始價格
    if (window.allData && window.currentIndex !== undefined) {
        lastPrice = window.allData[window.currentIndex];
        console.log(`設置初始參考價格: $${lastPrice.toFixed(2)}`);
    }
    
    // 設置定時檢查
    checkerTimer = setInterval(checkPriceChange, 1000);
}

// 檢查價格變化
function checkPriceChange() {
    // 確保數據存在
    if (!window.allData || window.currentIndex === undefined) return;
    
    // 獲取當前價格
    const currentPrice = window.allData[window.currentIndex];
    
    // 如果還沒有設置初始價格，就設置它
    if (lastPrice === null) {
        lastPrice = currentPrice;
        return;
    }
    
    // 計算價格變化百分比
    const changePercent = ((currentPrice - lastPrice) / lastPrice) * 100;
    
    // 如果變化超過閾值，則觸發通知
    if (Math.abs(changePercent) >= THRESHOLD) {
        console.log(`檢測到價格變化 ${changePercent.toFixed(2)}%`);
        
        // 邏輯修正：
        // 上升超過20%，建議買入（趨勢可能會繼續上升）
        if (changePercent >= THRESHOLD) {
            triggerCrazyNotification('buy', Math.abs(changePercent), currentPrice);
        } 
        // 下跌超過20%，建議賣出（趨勢可能會繼續下跌）
        else if (changePercent <= -THRESHOLD) {
            triggerCrazyNotification('sell', Math.abs(changePercent), currentPrice);
        }
        
        // 重置參考價格
        lastPrice = currentPrice;
    }
}

// 觸發瘋狂通知
function triggerCrazyNotification(type, changePercent, price) {
    // 檢查原始的瘋狂通知函數是否存在
    if (typeof window.showMegaNotification === 'function') {
        // 保存原始函數
        const originalMegaNotification = window.showMegaNotification;
        
        // 替換為我們的版本
        window.showMegaNotification = function() {
            // 恢復原始函數
            window.showMegaNotification = originalMegaNotification;
            
            // 初始化超大型通知容器
            if (typeof window.initializeMegaNotification === 'function') {
                window.initializeMegaNotification();
            } else {
                initMegaNotificationContainer();
            }
            
            // 獲取容器
            const container = document.querySelector('.mega-notification-container');
            
            // 創建不符合常理的訊息內容 (保留原有的瘋狂元素)
            const crazyMessages = [
                "你的股票正被外星人監控中！",
                "警告：你的投資決策正影響平行宇宙的經濟！",
                "檢測到時間旅行者正在購買此股票！",
                "股票AI已經開始產生自我意識！快逃！",
                "當你看股票時，股票也在看著你！",
                "你的交易數據正被用於訓練超級AI！",
                "這支股票因為量子糾纏正與比特幣同步波動！",
                "神秘的股市預言家表示這支股票將在週五消失！",
                "警告：這支股票可能是現實模擬中的虛擬資產！"
            ];
            
            // 隨機選擇一個瘋狂訊息作為副標題
            const randomMessage = crazyMessages[Math.floor(Math.random() * crazyMessages.length)];
            
            // 選擇適合的表情符號
            const emojis = type === 'buy' ? ["🚀", "💰", "📈", "💸", "🤑"] : ["📉", "🛑", "⚠️", "💼", "🔻"];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            
            // 創建提示訊息 (邏輯已修正)
            let mainMessage = "";
            if (type === 'buy') {
                mainMessage = `股價已上漲超過${changePercent.toFixed(1)}%！趨勢向上，建議買入！`;
            } else {
                mainMessage = `股價已下跌超過${changePercent.toFixed(1)}%！趨勢向下，建議賣出！`;
            }
            
            // 創建通知元素
            const notification = document.createElement('div');
            notification.className = 'mega-notification';
            notification.setAttribute('data-action-type', type); // 添加屬性以便識別通知類型
            
            // 設置通知內容 - 添加行動按鈕以支援強制操作
            notification.innerHTML = `
                <div class="mega-notification-icon">${randomEmoji}</div>
                <div class="mega-notification-title">${type === 'buy' ? '買入時機到來！' : '賣出時機到來！'}</div>
                <div class="mega-notification-subtitle">${randomMessage}</div>
                <div class="mega-notification-message">${mainMessage}</div>
                <div class="mega-notification-price">當前價格: $${price.toFixed(2)}</div>
                <div class="mega-notification-detail">AI信心指數: ${Math.floor(Math.random() * 300)}%</div>
                <div class="mega-notification-buttons">
                    <button class="mega-notification-action ${type}">${type === 'buy' ? '立即買入' : '立即賣出'}</button>
                    <button class="mega-notification-close">我已了解宇宙的奧秘</button>
                </div>
            `;
            
            // 添加到容器
            container.appendChild(notification);
            
            // 添加聲音效果 (如果需要)
            if (typeof window.playNotificationSound === 'function') {
                window.playNotificationSound();
            }
            
            // 添加關閉按鈕事件
            const closeButton = notification.querySelector('.mega-notification-close');
            closeButton.addEventListener('click', () => {
                notification.style.transform = 'translateX(-110%)';
                setTimeout(() => {
                    notification.remove();
                }, 700);
            });
            
            // 添加操作按鈕事件
            const actionButton = notification.querySelector('.mega-notification-action');
            if (actionButton) {
                actionButton.addEventListener('click', () => {
                    // 執行相應的買入或賣出操作
                    if (type === 'buy' && typeof window.buyStock === 'function') {
                        window.buyStock();
                    } else if (type === 'sell' && typeof window.sellStock === 'function') {
                        window.sellStock();
                    }
                    
                    // 關閉通知
                    notification.style.transform = 'translateX(-110%)';
                    setTimeout(() => {
                        notification.remove();
                    }, 700);
                });
            }
            
            // 延遲一點再顯示，讓CSS動畫效果更明顯
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            // 設置自動關閉計時器
            setTimeout(() => {
                // 檢查通知是否還存在
                if (notification.parentNode) {
                    notification.style.transform = 'translateX(-110%)';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 700);
                }
            }, 10000); // 10秒後自動消失
        };
        
        // 調用修改後的函數
        window.showMegaNotification();
        
    } else if (typeof window.showCrazyNotification === 'function') {
        // 如果找不到showMegaNotification但找到showCrazyNotification，使用它
        window.showCrazyNotification();
    } else {
        console.error("找不到瘋狂通知函數");
        
        // 備用方案：創建簡單的通知
        alert(`${type === 'buy' ? '買入' : '賣出'}建議: 股價變化 ${changePercent.toFixed(1)}%`);
    }
}

// 初始化通知容器（備用）
function initMegaNotificationContainer() {
    // 如果已經存在通知容器，則不重新創建
    if (document.querySelector('.mega-notification-container')) return;
    
    // 創建通知容器
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'mega-notification-container';
    document.body.appendChild(notificationContainer);
}

// 添加自定義樣式（確保通知顯示正確）
function addCustomStyles() {
    // 檢查樣式是否已存在
    if (document.getElementById('trend-alert-styles')) return;
    
    // 創建樣式元素
    const styleElement = document.createElement('style');
    styleElement.id = 'trend-alert-styles';
    
    // 添加樣式規則
    styleElement.textContent = `
        /* 基本容器樣式 */
        .mega-notification-container {
            position: fixed;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2000;
            width: 100%;
            pointer-events: none;
        }
        
        /* 通知樣式 */
        .mega-notification {
            background-color: rgba(30, 30, 30, 0.9);
            color: white;
            padding: 30px;
            margin: 0 auto;
            border-radius: 15px;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
            transform: translateX(-110%);
            transition: transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
            width: 80%;
            max-width: 1000px;
            pointer-events: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            overflow: hidden;
            border: 8px solid #ff00ff;
        }
        
        /* 通知顯示動畫 */
        .mega-notification.show {
            transform: translateX(0);
        }
        
        /* 通知內部元素樣式 */
        .mega-notification-subtitle {
            font-size: 24px;
            color: #cccccc;
            margin: 10px 0 20px 0;
            font-style: italic;
        }
        
        /* 按鈕容器 */
        .mega-notification-buttons {
            display: flex;
            gap: 20px;
            margin-top: 25px;
        }
        
        /* 操作按鈕 */
        .mega-notification-action {
            background: #ff00ff;
            border: none;
            color: white;
            font-size: 24px;
            padding: 10px 30px;
            border-radius: 50px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        /* 買入按鈕 */
        .mega-notification-action.buy {
            background-color: #4caf50;
        }
        
        /* 賣出按鈕 */
        .mega-notification-action.sell {
            background-color: #f44336;
        }
        
        /* 按鈕懸停效果 */
        .mega-notification-action:hover {
            transform: scale(1.1);
        }
        
        /* 關閉按鈕 */
        .mega-notification-close {
            background: #555;
            border: none;
            color: white;
            font-size: 18px;
            padding: 10px 20px;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .mega-notification-close:hover {
            background: #777;
        }
    `;
    
    // 添加到文檔
    document.head.appendChild(styleElement);
}

// 在頁面載入時添加樣式
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addCustomStyles, 2000);
});

// 將函數公開到全局作用域，以便其他腳本使用
window.triggerCrazyNotification = triggerCrazyNotification;