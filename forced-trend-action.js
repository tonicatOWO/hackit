// 強制買賣操作 - 按鈕放大和消失效果 (邏輯修正版)
// 這個檔案可以替換 forced-trend-action.js

// 全局變數
let isActionRequired = false;   // 是否需要強制操作
let requiredAction = null;      // 需要執行的操作類型 ('buy' 或 'sell')
let growthInterval = null;      // 按鈕放大的定時器
let growthFactor = 1.0;         // 按鈕放大系數
let buttonMovementTimer = null; // 按鈕移動定時器
const MAX_GROWTH = 50;          // 最大放大倍數
const GROWTH_SPEED = 0.03;      // 放大速度

// 在頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待其他腳本載入
    setTimeout(() => {
        console.log("初始化強制操作功能 - 極限版 (邏輯修正版)");
        setupForcedAction();
    }, 2500);
});

// 設置強制操作功能
function setupForcedAction() {
    // 確保原始的趨勢通知函數已經被定義
    if (typeof window.triggerCrazyNotification !== 'function') {
        console.error("找不到triggerCrazyNotification函數，無法設置強制操作");
        return;
    }
    
    // 保存原始的函數
    const originalTriggerCrazyNotification = window.triggerCrazyNotification;
    
    // 替換為我們的增強版本
    window.triggerCrazyNotification = function(type, changePercent, price) {
        // 設置強制操作標誌
        isActionRequired = true;
        requiredAction = type;
        growthFactor = 1.0;
        
        // 開始極端強制操作效果
        startExtremeForceEffect(type);
        
        // 調用原始函數，顯示通知
        originalTriggerCrazyNotification(type, changePercent, price);
    };
    
    console.log("已設置極端強制操作效果");
    
    // 修改買賣按鈕事件
    modifyButtonsForExtremeForce();
}

// 開始極端強制操作效果
function startExtremeForceEffect(recommendedType) {
    // 立即應用初始效果
    applyExtremeButtonEffects(recommendedType);
    
    // 啟動按鈕增長動畫
    startButtonGrowthAnimation(recommendedType);
    
    // 啟動非推薦按鈕的移動/消失效果
    startNonRecommendedButtonEffect(recommendedType);
}

// 應用按鈕效果
function applyExtremeButtonEffects(recommendedType) {
    const buyBtn = document.getElementById('buyBtn');
    const sellBtn = document.getElementById('sellBtn');
    
    if (recommendedType === 'buy') {
        // 如果建議買入，禁用賣出按鈕並添加特效
        if (sellBtn) {
            sellBtn.disabled = true;
            sellBtn.classList.add('non-recommended-btn');
            sellBtn.title = "系統建議買入！賣出按鈕已失效";
            
            // 完全禁用賣出按鈕的功能
            sellBtn.onclick = function(e) {
                // 阻止任何點擊事件
                e.preventDefault();
                e.stopPropagation();
                
                // 讓按鈕逃離
                enhanceNonRecommendedButtonMovement();
                
                return false;
            };
        }
        
        // 標記買入按鈕為推薦操作
        if (buyBtn) {
            buyBtn.classList.add('extreme-recommended-btn');
            buyBtn.title = "系統強烈建議買入！按鈕會不斷變大";
        }
    } else {
        // 如果建議賣出，禁用買入按鈕並添加特效
        if (buyBtn) {
            buyBtn.disabled = true;
            buyBtn.classList.add('non-recommended-btn');
            buyBtn.title = "系統建議賣出！買入按鈕已失效";
            
            // 完全禁用買入按鈕的功能
            buyBtn.onclick = function(e) {
                // 阻止任何點擊事件
                e.preventDefault();
                e.stopPropagation();
                
                // 讓按鈕逃離
                enhanceNonRecommendedButtonMovement();
                
                return false;
            };
        }
        
        // 標記賣出按鈕為推薦操作
        if (sellBtn) {
            sellBtn.classList.add('extreme-recommended-btn');
            sellBtn.title = "系統強烈建議賣出！按鈕會不斷變大";
        }
    }
}

// 啟動推薦按鈕增長動畫
function startButtonGrowthAnimation(recommendedType) {
    // 停止現有的定時器
    if (growthInterval) {
        clearInterval(growthInterval);
    }
    
    // 確定目標按鈕
    const targetBtn = document.getElementById(recommendedType === 'buy' ? 'buyBtn' : 'sellBtn');
    
    if (!targetBtn) return;
    
    // 設置初始大小和位置
    targetBtn.style.transform = 'scale(1)';
    targetBtn.style.position = 'relative';
    targetBtn.style.zIndex = '9999';
    
    // 啟動增長動畫
    growthInterval = setInterval(() => {
        // 增加放大係數
        growthFactor += GROWTH_SPEED;
        
        // 應用新的放大效果
        targetBtn.style.transform = `scale(${growthFactor})`;
        
        // 調整按鈕位置，使其保持中心對齊
        const containerWidth = document.querySelector('.buttons-container').offsetWidth;
        const containerHeight = document.querySelector('.buttons-container').offsetHeight;
        
        // 添加脈動效果
        const pulseEffect = Math.sin(Date.now() / 200) * 0.1 + 1;
        targetBtn.style.transform = `scale(${growthFactor * pulseEffect})`;
        
        // 如果按鈕太大，移動到畫面中央
        if (growthFactor > 5) {
            targetBtn.style.position = 'fixed';
            targetBtn.style.top = '50%';
            targetBtn.style.left = '50%';
            targetBtn.style.transform = `scale(${growthFactor * pulseEffect}) translate(-50%, -50%)`;
        }
        
        // 如果增長達到最大值，停止動畫
        if (growthFactor >= MAX_GROWTH) {
            clearInterval(growthInterval);
            
            // 觸發滿屏效果
            triggerFullscreenButtonEffect(targetBtn, recommendedType);
        }
    }, 100);
}

// 啟動非推薦按鈕的移動/消失效果
function startNonRecommendedButtonEffect(recommendedType) {
    // 確定非推薦按鈕
    const nonRecommendedBtn = document.getElementById(recommendedType === 'buy' ? 'sellBtn' : 'buyBtn');
    
    if (!nonRecommendedBtn) return;
    
    // 停止現有的定時器
    if (buttonMovementTimer) {
        clearInterval(buttonMovementTimer);
    }
    
    // 設置按鈕可移動
    nonRecommendedBtn.style.position = 'relative';
    nonRecommendedBtn.style.transition = 'all 0.3s ease-out';
    
    // 設置隨機移動效果
    buttonMovementTimer = setInterval(() => {
        // 移動按鈕到隨機位置
        const randomX = Math.floor(Math.random() * 200 - 100);
        const randomY = Math.floor(Math.random() * 200 - 100);
        
        nonRecommendedBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
        
        // 隨機改變透明度
        const randomOpacity = Math.random() * 0.7 + 0.3;
        nonRecommendedBtn.style.opacity = randomOpacity;
        
        // 每隔一段時間讓按鈕完全消失一下
        if (Math.random() < 0.2) {
            nonRecommendedBtn.style.opacity = '0';
            nonRecommendedBtn.style.transform = 'translate(1000px, 0)';
            
            // 短暫延遲後再出現
            setTimeout(() => {
                const newX = Math.floor(Math.random() * 200 - 100);
                const newY = Math.floor(Math.random() * 200 - 100);
                nonRecommendedBtn.style.transform = `translate(${newX}px, ${newY}px)`;
                nonRecommendedBtn.style.opacity = '0.7';
            }, 1000);
        }
    }, 1500);
}

// 觸發滿屏按鈕效果
function triggerFullscreenButtonEffect(button, type) {
    // 創建一個新的全屏元素
    const fullscreenElement = document.createElement('div');
    fullscreenElement.className = 'fullscreen-button-effect';
    fullscreenElement.style.backgroundColor = type === 'buy' ? '#4caf50' : '#f44336';
    
    // 添加文字
    const textElement = document.createElement('div');
    textElement.className = 'fullscreen-text';
    textElement.textContent = type === 'buy' ? '立即買入！！！' : '立即賣出！！！';
    fullscreenElement.appendChild(textElement);
    
    // 添加操作按鈕
    const actionButton = document.createElement('button');
    actionButton.className = 'fullscreen-action-button';
    actionButton.textContent = type === 'buy' ? '確認買入' : '確認賣出';
    actionButton.onclick = function() {
        // 執行買入或賣出操作
        if (type === 'buy' && typeof window.buyStock === 'function') {
            window.buyStock();
        } else if (type === 'sell' && typeof window.sellStock === 'function') {
            window.sellStock();
        }
        
        // 移除全屏效果
        document.body.removeChild(fullscreenElement);
        
        // 重置所有效果
        resetAllEffects();
    };
    fullscreenElement.appendChild(actionButton);
    
    // 添加到頁面
    document.body.appendChild(fullscreenElement);
    
    // 添加點擊事件 - 只有點擊操作按鈕才能關閉
    fullscreenElement.addEventListener('click', function(e) {
        // 防止點擊事件冒泡
        e.stopPropagation();
    });
}

// 重置所有效果
function resetAllEffects() {
    // 重置標誌
    isActionRequired = false;
    requiredAction = null;
    growthFactor = 1.0;
    
    // 清除定時器
    if (growthInterval) {
        clearInterval(growthInterval);
        growthInterval = null;
    }
    
    if (buttonMovementTimer) {
        clearInterval(buttonMovementTimer);
        buttonMovementTimer = null;
    }
    
    // 重置買賣按鈕
    const buyBtn = document.getElementById('buyBtn');
    const sellBtn = document.getElementById('sellBtn');
    
    if (buyBtn) {
        buyBtn.disabled = false;
        buyBtn.classList.remove('non-recommended-btn', 'extreme-recommended-btn');
        buyBtn.style.transform = '';
        buyBtn.style.position = '';
        buyBtn.style.top = '';
        buyBtn.style.left = '';
        buyBtn.style.opacity = '';
        buyBtn.style.transition = '';
        buyBtn.style.zIndex = '';
        buyBtn.title = '';
        
        // 恢復原始點擊事件
        buyBtn.onclick = function() {
            if (typeof window.buyStock === 'function') {
                window.buyStock();
            }
        };
    }
    
    if (sellBtn) {
        sellBtn.disabled = false;
        sellBtn.classList.remove('non-recommended-btn', 'extreme-recommended-btn');
        sellBtn.style.transform = '';
        sellBtn.style.position = '';
        sellBtn.style.top = '';
        sellBtn.style.left = '';
        sellBtn.style.opacity = '';
        sellBtn.style.transition = '';
        sellBtn.style.zIndex = '';
        sellBtn.title = '';
        
        // 恢復原始點擊事件
        sellBtn.onclick = function() {
            if (typeof window.sellStock === 'function') {
                window.sellStock();
            }
        };
    }
    
    console.log('已重置所有強制效果');
}

// 增強非推薦按鈕的移動效果
function enhanceNonRecommendedButtonMovement() {
    const nonRecommendedBtn = document.getElementById(requiredAction === 'buy' ? 'sellBtn' : 'buyBtn');
    
    if (!nonRecommendedBtn) return;
    
    // 使按鈕立即消失
    nonRecommendedBtn.style.transition = 'all 0.5s ease-out';
    nonRecommendedBtn.style.transform = 'translate(2000px, 0)';
    nonRecommendedBtn.style.opacity = '0';
    
    // 隨機時間後再出現
    setTimeout(() => {
        const randomX = Math.floor(Math.random() * 300 - 150);
        const randomY = Math.floor(Math.random() * 300 - 150);
        nonRecommendedBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
        nonRecommendedBtn.style.opacity = '0.7';
    }, Math.random() * 2000 + 1000);
}

// 修改買賣按鈕，添加強制效果處理
function modifyButtonsForExtremeForce() {
    const buyBtn = document.getElementById('buyBtn');
    const sellBtn = document.getElementById('sellBtn');
    
    if (buyBtn) {
        // 保存原始點擊事件
        const originalBuyClick = buyBtn.onclick;
        
        // 設置新的點擊事件
        buyBtn.onclick = function(e) {
            // 如果需要強制操作
            if (isActionRequired) {
                // 如果要求買入且當前是買入按鈕，執行操作並重置效果
                if (requiredAction === 'buy') {
                    // 執行原始買入操作
                    if (originalBuyClick) originalBuyClick.call(this, e);
                    
                    // 重置效果
                    resetAllEffects();
                } else {
                    // 否則阻止點擊 (因為這是賣出建議，但用戶點了買入)
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 增強非推薦按鈕的移動效果
                    enhanceNonRecommendedButtonMovement();
                    
                    return false;
                }
            } else if (originalBuyClick) {
                // 如果沒有強制操作，正常執行買入
                originalBuyClick.call(this, e);
            }
        };
    }
    
    if (sellBtn) {
        // 保存原始點擊事件
        const originalSellClick = sellBtn.onclick;
        
        // 設置新的點擊事件
        sellBtn.onclick = function(e) {
            // 如果需要強制操作
            if (isActionRequired) {
                // 如果要求賣出且當前是賣出按鈕，執行操作並重置效果
                if (requiredAction === 'sell') {
                    // 執行原始賣出操作
                    if (originalSellClick) originalSellClick.call(this, e);
                    
                    // 重置效果
                    resetAllEffects();
                } else {
                    // 否則阻止點擊 (因為這是買入建議，但用戶點了賣出)
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 增強非推薦按鈕的移動效果
                    enhanceNonRecommendedButtonMovement();
                    
                    return false;
                }
            } else if (originalSellClick) {
                // 如果沒有強制操作，正常執行賣出
                originalSellClick.call(this, e);
            }
        };
    }
}

// 監聽瘋狂通知關閉事件，以重置效果
function listenForNotificationClose() {
    // 使用 MutationObserver 監聽 DOM 變化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // 檢查是否有元素從 DOM 中移除
            if (mutation.removedNodes.length > 0) {
                Array.from(mutation.removedNodes).forEach(node => {
                    // 檢查移除的元素是否為瘋狂通知
                    if (node.classList && node.classList.contains('mega-notification')) {
                        // 不要在通知關閉時重置效果
                        // 只有在用戶執行了正確操作後才重置
                    }
                });
            }
        });
    });
    
    // 開始監聽通知容器的變化
    const container = document.querySelector('.mega-notification-container');
    if (container) {
        observer.observe(container, { childList: true });
    }
}

// 添加樣式
function addExtremeForceStyles() {
    // 檢查樣式是否已存在
    if (document.getElementById('extreme-force-styles')) return;
    
    // 創建樣式元素
    const styleElement = document.createElement('style');
    styleElement.id = 'extreme-force-styles';
    
    
    
    // 添加到文檔
    document.head.appendChild(styleElement);
}

// 在頁面載入時添加樣式並開始監聽通知關閉事件
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addExtremeForceStyles();
        listenForNotificationClose();
    }, 3000);
});