// 應用程式主要邏輯
// 全域變數
let balance = 10000.00; // 初始資金
const transactions = []; // 交易記錄
let shares = 0; // 持有股票數量

// 頁面載入完成後執行初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化應用程式
    await initializeApp();
    
    // 設置按鈕監聽事件
    document.getElementById('buyBtn').addEventListener('click', buyStock);
    document.getElementById('sellBtn').addEventListener('click', sellStock);
    
    // 更新餘額顯示
    updateBalanceDisplay();
    
    // 初始化通知系統
    initializeNotifications();
    
    // 設置交易建議監聽器
    setupTradeRecommendationListener();
    
    // 初始化超大型通知
    initializeMegaNotification();
    
    // 設置瘋狂通知觸發器
    setupCrazyNotifications();
    
    // 添加測試功能
    addTestFunction();
});

// 初始化應用程式
async function initializeApp() {
    try {
        // 獲取股票數據
        const stockData = await generateStockData();
        
        // 檢查是否已經有創建好的圖表（可能由 WebSocket 功能創建）
        if (!window.stockChart) {
            // 如果沒有圖表，使用我們的 stockData 創建
            const labels = createStockChart(stockData);
            
            // 創建日期標籤
            if (typeof createDateLabels === 'function') {
                createDateLabels(labels);
            }
            
            // 添加價格標籤
            if (typeof addIntegerPriceLabels === 'function') {
                addIntegerPriceLabels(stockData.allData);
            }
        } else {
            // 圖表已經存在，確保我們的全局變量正確設置
            console.log("圖表已經由 WebSocket 功能創建，進行協調...");
            
            // 確保全局變量已正確設置
            if (!window.allData) window.allData = stockData.allData;
            if (window.currentIndex === undefined) window.currentIndex = stockData.past.length - 1;
            if (!window.currentStockPrice) window.currentStockPrice = stockData.past[stockData.past.length - 1];
        }
        
    } catch (error) {
        console.error('初始化應用程式時出錯:', error);
    }
}

// 更新餘額顯示 - 保持原有格式
function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balanceDisplay');
    if (balanceElement) {
        balanceElement.textContent = `$${balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
}

// 買入股票
function buyStock() {
    // 確保我們有當前股價
    if (!window.allData || window.currentIndex === undefined) {
        console.error("無法獲取當前股價");
        alert("無法獲取當前股價，請稍後再試");
        return;
    }
    
    // 獲取當前股價
    const currentPrice = window.allData[window.currentIndex];
    
    // 確認餘額足夠
    if (balance >= currentPrice) {
        // 扣除費用
        balance -= currentPrice;
        // 增加股票數量
        shares += 1;
        
        // 添加交易記錄
        addTransaction('買入', 1, currentPrice);
        
        // 添加買入標記到圖表
        addTradeMarker('buy', window.currentIndex);
        
        // 更新餘額顯示
        updateBalanceDisplay();
    } else {
        alert('餘額不足以購買股票！');
    }
}

// 賣出股票
function sellStock() {
    // 確認有股票可以賣出
    if (shares > 0) {
        // 確保我們有當前股價
        if (!window.allData || window.currentIndex === undefined) {
            console.error("無法獲取當前股價");
            alert("無法獲取當前股價，請稍後再試");
            return;
        }
        
        // 獲取當前股價
        const currentPrice = window.allData[window.currentIndex];
        
        // 增加餘額
        balance += currentPrice;
        // 減少股票數量
        shares -= 1;
        
        // 添加交易記錄
        addTransaction('賣出', 1, currentPrice);
        
        // 添加賣出標記到圖表
        addTradeMarker('sell', window.currentIndex);
        
        // 更新餘額顯示
        updateBalanceDisplay();
    } else {
        alert('沒有股票可以賣出！');
    }
}

// 添加交易記錄
function addTransaction(type, quantity, price) {
    // 建立交易物件
    const transaction = {
        id: transactions.length + 1,
        type: type,
        quantity: quantity,
        price: price,
        total: type === '買入' ? -price * quantity : price * quantity,
        date: new Date().toLocaleString()
    };
    
    // 添加到交易記錄
    transactions.unshift(transaction);
    
    // 更新交易歷史顯示
    updateTransactionHistory();
}

// 更新交易歷史顯示
function updateTransactionHistory() {
    const historyContainer = document.getElementById('transactionHistory');
    if (!historyContainer) {
        console.error("找不到交易歷史容器");
        return;
    }
    
    historyContainer.innerHTML = '';
    
    // 更新交易筆數
    const countElement = document.getElementById('transactionCount');
    if (countElement) {
        countElement.textContent = `${transactions.length} 筆交易`;
    }
    
    // 添加交易記錄項目
    transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = `history-item ${transaction.type === '買入' ? 'buy' : 'sell'}`;
        
        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-type">${transaction.type}</div>
                <div class="transaction-date">${transaction.date}</div>
            </div>
            <div class="transaction-amount ${transaction.type === '買入' ? 'negative' : 'positive'}">
                ${transaction.type === '買入' ? '-' : '+'}$${Math.abs(transaction.total).toFixed(2)}
            </div>
        `;
        
        historyContainer.appendChild(item);
    });
    
    // 如果沒有交易記錄，顯示提示
    if (transactions.length === 0) {
        const noRecords = document.createElement('div');
        noRecords.className = 'no-records';
        noRecords.textContent = '尚無交易記錄';
        historyContainer.appendChild(noRecords);
    }
}

// 添加交易標記到圖表
function addTradeMarker(type, index) {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) {
        console.error("找不到圖表容器");
        return;
    }
    
    // 確保我們有全局數據
    if (!window.allData) {
        console.error("找不到全局數據");
        return;
    }
    
    // 找到數據的最小值和最大值
    const filteredData = window.allData.filter(val => val !== null);
    const min = Math.floor(Math.min(...filteredData));
    const max = Math.ceil(Math.max(...filteredData));
    const range = max - min;
    
    // 獲取當前價格和位置百分比
    const price = window.allData[index];
    if (price === undefined || price === null) {
        console.error("找不到指定索引的價格數據");
        return;
    }
    
    const pricePercent = (price - min) / range;
    const xPercent = (index / (window.allData.length - 1)) * 100;
    
    // 創建標記元素
    const marker = document.createElement('div');
    marker.className = `trade-marker ${type}`;
    marker.style.left = `${xPercent}%`;
    marker.style.top = `${(1 - pricePercent) * 100}%`;
    marker.title = `${type === 'buy' ? '買入' : '賣出'} @ USD ${price.toFixed(2)}`;
    
    chartContainer.appendChild(marker);
}

// ====== 交易通知系統 ======

// 初始化通知容器
function initializeNotifications() {
    // 如果已經存在通知容器，則不重新創建
    if (document.querySelector('.notification-container')) return;
    
    // 創建通知容器
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
}

// 創建並顯示通知
function showTradeNotification(type, message, price) {
    // 初始化通知容器
    initializeNotifications();
    
    // 獲取容器
    const container = document.querySelector('.notification-container');
    
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type.toLowerCase()}`;
    
    // 設置通知圖標
    const icon = type.toLowerCase() === 'buy' ? '📈' : '📉';
    
    // 設置通知內容
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${type === 'buy' ? '買入建議' : '賣出建議'}</div>
            <div class="notification-message">${message}</div>
            <div class="notification-price">價格: $${price.toFixed(2)}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // 添加到容器
    container.appendChild(notification);
    
    // 添加關閉按鈕事件
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            notification.remove();
        }, 500);
    });
    
    // 延遲一點再顯示，讓CSS動畫效果更明顯
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 設置自動關閉計時器
    setTimeout(() => {
        // 檢查通知是否還存在
        if (notification.parentNode) {
            notification.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }
    }, 8000); // 8秒後自動消失
}

// 從後端獲取交易提示
async function getTradeRecommendation() {
    // 確保我們有當前股價
    if (!window.currentStockPrice && (!window.allData || window.currentIndex === undefined)) {
        console.warn("無法獲取當前股價，使用默認值");
        return {
            action: Math.random() > 0.5 ? 'buy' : 'sell',
            message: "根據技術分析，這可能是一個交易機會。",
            price: 84000.00 // 默認比特幣價格
        };
    }
    
    // 實際應用中應該從後端API獲取
    return new Promise(resolve => {
        // 隨機決定買入或賣出
        const action = Math.random() > 0.5 ? 'buy' : 'sell';
        
        // 根據動作提供不同的建議訊息
        const messages = {
            buy: [
                '根據我們的分析，比特幣價格將在短期內上漲。現在是買入的好時機！',
                '市場情緒積極，技術指標看漲。建議立即買入！',
                '比特幣已觸及支撐位，預計即將反彈。買入機會來了！'
            ],
            sell: [
                '技術指標顯示比特幣價格已達阻力位，建議賣出以鎖定利潤。',
                '市場情緒轉向悲觀，建議賣出以避免潛在損失。',
                '比特幣價格即將面臨下跌風險，現在賣出可能是明智選擇。'
            ]
        };
        
        // 隨機選擇一條訊息
        const message = messages[action][Math.floor(Math.random() * messages[action].length)];
        
        resolve({
            action: action,
            message: message,
            price: window.currentStockPrice || window.allData[window.currentIndex]
        });
    });
}

// 處理從後端接收到的交易建議
function handleTradeRecommendation(recommendation) {
    const { type, message, price } = recommendation;
    showTradeNotification(type, message, price);
}

// 設置交易建議監聽器
function setupTradeRecommendationListener() {
    // 模擬接收到交易建議的事件
    window.receiveTradeRecommendation = function(type, message, price) {
        handleTradeRecommendation({ type, message, price });
    };
    
    // 修改買賣按鈕事件
    const buyButton = document.getElementById('buyBtn');
    const sellButton = document.getElementById('sellBtn');
    
    if (buyButton) {
        // 添加新的點擊事件
        buyButton.addEventListener('click', async function() {
            // 20毫秒後顯示交易提示
            setTimeout(async () => {
                const recommendation = await getTradeRecommendation();
                showTradeNotification(recommendation.action, recommendation.message, recommendation.price);
            }, 20);
        });
    }
    
    if (sellButton) {
        // 添加新的點擊事件
        sellButton.addEventListener('click', async function() {
            // 20毫秒後顯示交易提示
            setTimeout(async () => {
                const recommendation = await getTradeRecommendation();
                showTradeNotification(recommendation.action, recommendation.message, recommendation.price);
            }, 20);
        });
    }
}

// ====== 超大型瘋狂通知系統 ======

// 初始化超大型通知容器
function initializeMegaNotification() {
    // 如果已經存在通知容器，則不重新創建
    if (document.querySelector('.mega-notification-container')) return;
    
    // 創建通知容器
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'mega-notification-container';
    document.body.appendChild(notificationContainer);
}

// 顯示超大型瘋狂通知
function showMegaNotification() {
    // 初始化通知容器
    initializeMegaNotification();
    
    // 獲取容器
    const container = document.querySelector('.mega-notification-container');
    
    // 創建不符合常理的訊息內容
    const crazyMessages = [
        "你的比特幣正被外星人監控中！",
        "警告：你的投資決策正影響平行宇宙的經濟！",
        "檢測到時間旅行者正在購買比特幣！",
        "加密貨幣AI已經開始產生自我意識！快逃！",
        "當你看比特幣時，比特幣也在看著你！",
        "你的交易數據正被用於訓練超級AI！",
        "比特幣因為量子糾纏正與世界金融系統同步波動！",
        "神秘的加密貨幣預言家表示比特幣將在週五消失！",
        "警告：這只是現實模擬中的虛擬資產！"
    ];
    
    // 隨機選擇一個瘋狂訊息
    const randomMessage = crazyMessages[Math.floor(Math.random() * crazyMessages.length)];
    
    // 隨機選擇一個瘋狂表情符號
    const crazyEmojis = ["👽", "🤖", "👁️", "🌌", "🔮", "⚡", "🧠", "🛸", "🌀", "🤯"];
    const randomEmoji = crazyEmojis[Math.floor(Math.random() * crazyEmojis.length)];
    
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = 'mega-notification';
    
    // 設置通知內容
    notification.innerHTML = `
        <div class="mega-notification-icon">${randomEmoji}</div>
        <div class="mega-notification-title">注意！非常規警報！</div>
        <div class="mega-notification-message">${randomMessage}</div>
        <div class="mega-notification-detail">AI信心指數: ${Math.floor(Math.random() * 300)}%</div>
        <button class="mega-notification-close">我已了解宇宙的奧秘</button>
    `;
    
    // 添加到容器
    container.appendChild(notification);
    
    // 添加聲音效果 (如果需要)
    playNotificationSound();
    
    // 添加關閉按鈕事件
    const closeButton = notification.querySelector('.mega-notification-close');
    closeButton.addEventListener('click', () => {
        notification.style.transform = 'translateX(-110%)';
        setTimeout(() => {
            notification.remove();
        }, 700);
    });
    
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
}

// 播放通知聲音
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 創建振盪器
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 設置頻率和類型
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
        
        // 設置音量並逐漸減小
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
        
        // 播放然後停止
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
    } catch (e) {
        console.log('無法播放音效:', e);
    }
}

// 在買入或賣出按鈕點擊後添加瘋狂通知觸發
function setupCrazyNotifications() {
    const buyBtn = document.getElementById('buyBtn');
    const sellBtn = document.getElementById('sellBtn');
    
    if (buyBtn) {
        // 為買入按鈕添加新的事件處理
        buyBtn.addEventListener('click', function() {
            // 50%的機率觸發瘋狂通知
            if (Math.random() > 0.5) {
                setTimeout(() => {
                    showMegaNotification();
                }, 2000);
            }
        });
    }
    
    if (sellBtn) {
        // 為賣出按鈕添加新的事件處理
        sellBtn.addEventListener('click', function() {
            // 50%的機率觸發瘋狂通知
            if (Math.random() > 0.5) {
                setTimeout(() => {
                    showMegaNotification();
                }, 2000);
            }
        });
    }
}

// 添加測試功能
function addTestFunction() {
    window.showCrazyNotification = showMegaNotification;
    
    window.testNotification = function(type) {
        let price = 84000.00; // 默認價格
        
        if (window.allData && window.currentIndex !== undefined) {
            price = window.allData[window.currentIndex];
        } else if (window.currentStockPrice) {
            price = window.currentStockPrice;
        }
        
        const message = type === 'buy'
            ? '技術分析顯示市場看漲，建議現在買入'
            : '市場有下跌風險，建議現在賣出';
        window.receiveTradeRecommendation(type, message, price);
    };
}

