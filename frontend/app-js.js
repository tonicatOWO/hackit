// 應用程式主要邏輯
// 全域變數
let balance = 10000.00; // 初始資金
const transactions = []; // 交易記錄
let shares = 20; // 初始持有股票數量，修改為20股

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
    
    // 設置交易建議監聽器 (修改為不主動觸發)
    // setupTradeRecommendationListener(); // 已停用
    
    // 初始化超大型通知
    initializeMegaNotification();
    
    // 設置瘋狂通知觸發器 (修改為不主動觸發)
    // setupCrazyNotifications(); // 已停用
    
    // 添加測試功能
    addTestFunction();
    
    // 添加初始交易記錄，顯示已有20股
    addInitialTransaction();
});

// 添加初始交易記錄
function addInitialTransaction() {
    // 獲取當前股價
    const currentPrice = window.allData[window.currentIndex];
    
    // 建立初始交易物件
    const initialTransaction = {
        id: 1,
        type: '買入',
        quantity: 20,
        price: currentPrice,
        total: -currentPrice * 20, // 負數表示支出
        date: new Date().toLocaleString()
    };
    
    // 添加到交易記錄
    transactions.push(initialTransaction);
    
    // 更新交易歷史顯示
    updateTransactionHistory();
}

// 初始化應用程式
async function initializeApp() {
    try {
        // 獲取股票數據
        const stockData = await generateStockData();
        
        // 創建圖表
        const labels = createStockChart(stockData);
        
        // 創建日期標籤
        createDateLabels(labels);
        
        // 添加價格標籤
        addIntegerPriceLabels(stockData.allData);
        
    } catch (error) {
        console.error('初始化應用程式時出錯:', error);
    }
}

// 更新餘額顯示 - 保持原有格式
function updateBalanceDisplay() {
    document.getElementById('balanceDisplay').textContent = `$${balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// 買入股票
function buyStock() {
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
    historyContainer.innerHTML = '';
    
    // 更新交易筆數
    document.getElementById('transactionCount').textContent = `${transactions.length} 筆交易`;
    
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

// 添加交易標記到圖表 - 不實際添加標記，被動態圖表覆蓋
function addTradeMarker(type, index) {
    // 函數保留但不執行實際操作
    console.log(`交易標記已停用: ${type} @ index ${index}`);
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

// 創建並顯示通知 (保留但不主動調用)
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

// 從後端獲取交易提示 (保留但不主動調用)
async function getTradeRecommendation() {
    // 實際應用中應該從後端API獲取
    return new Promise(resolve => {
        // 隨機決定買入或賣出
        const action = Math.random() > 0.5 ? 'buy' : 'sell';
        
        // 根據動作提供不同的建議訊息
        const messages = {
            buy: [
                '根據我們的分析，股價將在短期內上漲。現在是買入的好時機！',
                '市場情緒積極，技術指標看漲。建議立即買入！',
                '股票已觸及支撐位，預計即將反彈。買入機會來了！'
            ],
            sell: [
                '技術指標顯示股價已達阻力位，建議賣出以鎖定利潤。',
                '市場情緒轉向悲觀，建議賣出以避免潛在損失。',
                '股價即將面臨下跌風險，現在賣出可能是明智選擇。'
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

// 處理從後端接收到的交易建議 (保留但不主動調用)
function handleTradeRecommendation(recommendation) {
    const { type, message, price } = recommendation;
    showTradeNotification(type, message, price);
}

// 設置交易建議監聽器 (已停用自動觸發)
function setupTradeRecommendationListener() {
    // 這個函數原本用於設置自動觸發的建議
    // 現在保留函數但不執行實際操作
    console.log('交易建議自動觸發已停用');
    
    // 修改買賣按鈕事件 (不再自動觸發建議)
    window.receiveTradeRecommendation = function(type, message, price) {
        handleTradeRecommendation({ type, message, price });
    };
}

// ====== 超大型瘋狂通知系統 ======

// 初始化超大型通知容器 (保留供20%趨勢系統使用)
function initializeMegaNotification() {
    // 如果已經存在通知容器，則不重新創建
    if (document.querySelector('.mega-notification-container')) return;
    
    // 創建通知容器
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'mega-notification-container';
    document.body.appendChild(notificationContainer);
}

// 顯示超大型瘋狂通知 (保留供20%趨勢系統使用)
function showMegaNotification() {
    // 初始化通知容器
    initializeMegaNotification();
    
    // 獲取容器
    const container = document.querySelector('.mega-notification-container');
    
    // 創建不符合常理的訊息內容
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

// 在買入或賣出按鈕點擊後添加瘋狂通知觸發 (已停用自動觸發)
function setupCrazyNotifications() {
    // 這個函數已停用，不再自動觸發瘋狂通知
    console.log('瘋狂通知自動觸發已停用');
}

// 添加測試功能
function addTestFunction() {
    window.showCrazyNotification = showMegaNotification;
    
    window.testNotification = function(type) {
        const price = window.allData ? window.allData[window.currentIndex] : 100;
        const message = type === 'buy' 
            ? '技術分析顯示市場看漲，建議現在買入' 
            : '市場有下跌風險，建議現在賣出';
        window.receiveTradeRecommendation(type, message, price);
    };
}