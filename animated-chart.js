// 動態股票圖表功能

// 設置動畫更新間隔（毫秒）
const UPDATE_INTERVAL = 1000; // 每秒更新一次

// 全局變數
let animationTimer;
let isAnimating = false;
let currentPriceIndex;
let dynamicStockData = []; // 存儲動態生成的股票數據

// 初始化動態股票圖表
function initializeAnimatedChart() {
    // 確保已經初始化了股票圖表
    if (!window.stockChart || !window.allData) {
        console.error('股票圖表尚未初始化');
        return;
    }
    
    // 保存原始數據用於參考
    const originalData = [...window.allData];
    
    // 設置當前索引位置（從過去數據的最後一個點開始）
    currentPriceIndex = window.currentIndex;
    
    // 生成額外的動態數據點（基於原有數據的趨勢）
    generateDynamicStockData(originalData);
    
    // 添加開始/暫停動畫按鈕
    addAnimationControls();
    
    // 自動開始動畫
    startChartAnimation();
}

// 生成動態的股票數據
function generateDynamicStockData(originalData) {
    // 取得最後一個價格作為起始點
    const lastPrice = originalData[originalData.length - 1];
    
    // 複製原始數據
    dynamicStockData = [...originalData];
    
    // 生成50個額外的價格點用於動態顯示
    let currentPrice = lastPrice;
    const volatility = 0.5; // 波動性
    
    // 確保已有的趨勢能夠繼續（計算過去的價格變動趨勢）
    const trend = calculatePriceTrend(originalData);
    
    for (let i = 0; i < 50; i++) {
        // 生成隨機變動（-volatility 到 +volatility）
        const randomChange = (Math.random() * 2 - 1) * volatility;
        
        // 應用趨勢因子（使價格變動遵循整體趨勢）
        const trendFactor = trend * 0.2;
        
        // 計算新價格（考慮隨機變動和趨勢）
        currentPrice = Math.max(0.01, currentPrice + randomChange + trendFactor);
        
        // 添加到數據數組
        dynamicStockData.push(parseFloat(currentPrice.toFixed(2)));
    }
    
    // 更新全局變數以使用新數據
    window.allData = dynamicStockData;
}

// 計算價格趨勢（正值表示上升趨勢，負值表示下降趨勢）
function calculatePriceTrend(data) {
    const samplesCount = Math.min(10, data.length);
    const recentPrices = data.slice(-samplesCount);
    
    // 如果數據不足，返回 0（無趨勢）
    if (recentPrices.length < 2) return 0;
    
    // 計算平均價格變動
    let totalChange = 0;
    for (let i = 1; i < recentPrices.length; i++) {
        totalChange += recentPrices[i] - recentPrices[i - 1];
    }
    
    return totalChange / (recentPrices.length - 1);
}

// 持續產生新的數據點
function generateNewDataPoint() {
    // 取得最後一個價格
    const lastPrice = dynamicStockData[dynamicStockData.length - 1];
    
    // 生成隨機變動（-0.5 到 +0.5）
    const randomChange = (Math.random() * 2 - 1) * 0.5;
    
    // 計算趨勢
    const trend = calculatePriceTrend(dynamicStockData.slice(-10)) * 0.3;
    
    // 計算新價格
    const newPrice = Math.max(0.01, lastPrice + randomChange + trend);
    const formattedPrice = parseFloat(newPrice.toFixed(2));
    
    // 添加到數據數組
    dynamicStockData.push(formattedPrice);
    
    // 更新全局變數
    window.allData = dynamicStockData;
    
    return formattedPrice;
}

// 添加動畫控制按鈕
function addAnimationControls() {
    const chartContainer = document.querySelector('.chart-section');
    
    // 創建按鈕容器
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'animation-controls';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'center';
    controlsContainer.style.marginTop = '10px';
    
    // 創建播放/暫停按鈕
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggleAnimationBtn';
    toggleButton.className = 'btn';
    toggleButton.textContent = '暫停';
    toggleButton.style.backgroundColor = '#333';
    toggleButton.style.color = 'white';
    toggleButton.style.padding = '5px 15px';
    toggleButton.style.borderRadius = '20px';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '14px';
    toggleButton.style.margin = '0 5px';
    
    // 添加按鈕事件
    toggleButton.addEventListener('click', toggleChartAnimation);
    
    // 創建重置按鈕
    const resetButton = document.createElement('button');
    resetButton.id = 'resetAnimationBtn';
    resetButton.className = 'btn';
    resetButton.textContent = '重置';
    resetButton.style.backgroundColor = '#333';
    resetButton.style.color = 'white';
    resetButton.style.padding = '5px 15px';
    resetButton.style.borderRadius = '20px';
    resetButton.style.border = 'none';
    resetButton.style.cursor = 'pointer';
    resetButton.style.fontSize = '14px';
    resetButton.style.margin = '0 5px';
    
    // 添加重置按鈕事件
    resetButton.addEventListener('click', resetChartAnimation);
    
    // 將按鈕添加到容器
    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(toggleButton);
    
    // 將容器添加到圖表區域
    chartContainer.appendChild(controlsContainer);
}

// 開始圖表動畫
function startChartAnimation() {
    if (isAnimating) return;
    
    isAnimating = true;
    updateToggleButtonState();
    
    // 設置定時更新
    animationTimer = setInterval(() => {
        updateChartData();
    }, UPDATE_INTERVAL);
}

// 暫停圖表動畫
function stopChartAnimation() {
    if (!isAnimating) return;
    
    isAnimating = false;
    updateToggleButtonState();
    
    // 清除定時器
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }
}

// 切換動畫狀態
function toggleChartAnimation() {
    if (isAnimating) {
        stopChartAnimation();
    } else {
        startChartAnimation();
    }
}

// 重置圖表動畫
function resetChartAnimation() {
    // 停止當前動畫
    stopChartAnimation();
    
    // 重置索引到初始位置
    currentPriceIndex = window.currentIndex;
    
    // 重新生成動態數據
    generateDynamicStockData([...window.allData.slice(0, window.currentIndex + 1)]);
    
    // 更新圖表數據
    updateChartDisplay();
    
    // 重新開始動畫
    startChartAnimation();
}

// 更新按鈕狀態
function updateToggleButtonState() {
    const toggleButton = document.getElementById('toggleAnimationBtn');
    if (toggleButton) {
        toggleButton.textContent = isAnimating ? '暫停' : '播放';
    }
}

// 更新圖表數據
function updateChartData() {
    // 如果接近數據末尾，生成新的數據點
    if (currentPriceIndex >= window.allData.length - 5) {
        generateNewDataPoint();
    }
    
    // 移動到下一個數據點
    currentPriceIndex++;
    
    // 更新圖表顯示
    updateChartDisplay();
}

// 更新圖表顯示
function updateChartDisplay() {
    // 獲取當前價格
    const currentPrice = window.allData[currentPriceIndex];
    
    // 更新全局變數 - 這是關鍵的一步，同步更新買賣系統使用的價格
    window.currentStockPrice = currentPrice;
    
    // 關鍵修正：更新app-js.js中用於交易的價格變數
    updateTradeSystemPrice(currentPrice);
    
    // 更新"現在"的位置指示器
    updateTimelinePosition();
    
    // 更新價格標籤
    updatePriceTag(currentPrice);
    
    // 更新圖表顯示範圍
    updateChartVisibleRange();
    
    // 添加價格變動效果
    addPriceChangeEffect(currentPrice);
}

// 更新交易系統使用的價格變數
function updateTradeSystemPrice(price) {
    // 從全局作用域中找到所需的變數並更新
    window.currentIndex = currentPriceIndex;
    
    // 這是買賣功能中使用的價格，確保與圖表顯示的價格一致
    if (typeof window.buyStock === 'function' && typeof window.sellStock === 'function') {
        // 設置買賣操作的當前價格
        window.currentStockPrice = price;
    }
}

// 更新時間線位置
function updateTimelinePosition() {
    const timelineMarker = document.querySelector('.timeline-marker');
    
    // 計算新位置（百分比）
    const totalPoints = window.allData.length;
    const visiblePoints = 50; // 顯示的數據點數量
    const startPoint = Math.max(0, currentPriceIndex - 30); // 前30個點
    const endPoint = Math.min(totalPoints - 1, startPoint + visiblePoints); // 總共顯示50個點
    
    const newPosition = ((currentPriceIndex - startPoint) / (endPoint - startPoint)) * 100;
    
    // 更新時間線位置
    timelineMarker.style.left = `${newPosition}%`;
    
    // 更新未來趨勢區域指示器位置
    const futureTrendIndicator = document.querySelector('.future-trend-indicator');
    if (futureTrendIndicator) {
        futureTrendIndicator.style.left = `${newPosition}%`;
    }
}

// 更新價格標籤
function updatePriceTag(price) {
    // 移除舊的價格標籤
    const oldPriceTag = document.querySelector('.price-tag');
    if (oldPriceTag) {
        oldPriceTag.remove();
    }
    
    // 創建新的價格標籤
    const chartContainer = document.querySelector('.chart-container');
    
    // 計算顯示範圍內的最小最大值
    const visiblePoints = 50; // 與updateTimelinePosition保持一致
    const startPoint = Math.max(0, currentPriceIndex - 30);
    const endPoint = Math.min(window.allData.length - 1, startPoint + visiblePoints);
    const visibleData = window.allData.slice(startPoint, endPoint + 1);
    
    const min = Math.floor(Math.min(...visibleData.filter(val => val !== null)));
    const max = Math.ceil(Math.max(...visibleData.filter(val => val !== null)));
    const range = max - min || 1; // 防止除以零
    
    // 計算價格對應的位置百分比
    const pricePercent = (price - min) / range;
    
    // 創建價格標籤
    const priceTag = document.createElement('div');
    priceTag.className = 'price-tag';
    priceTag.textContent = `USD ${price.toFixed(2)}`;
    priceTag.style.top = `${(1 - pricePercent) * 100}%`;
    
    // 添加到圖表容器
    chartContainer.appendChild(priceTag);
}

// 更新圖表可見範圍
function updateChartVisibleRange() {
    // 計算顯示範圍
    const visiblePoints = 50; // 總共顯示的點數
    const startPoint = Math.max(0, currentPriceIndex - 30); // 前30個點
    const endPoint = Math.min(window.allData.length - 1, startPoint + visiblePoints); // 總共顯示50個點
    
    // 獲取可見數據
    const visibleData = window.allData.slice(startPoint, endPoint + 1);
    
    // 分割為過去和未來數據
    const pastEndIndex = Math.min(currentPriceIndex - startPoint, visibleData.length);
    const pastData = visibleData.slice(0, pastEndIndex + 1);
    const futureData = visibleData.slice(pastEndIndex + 1);
    
    // 更新 X 軸標籤
    const newLabels = [];
    for (let i = 0; i < visibleData.length; i++) {
        const secondsFromNow = i - pastEndIndex;
        if (secondsFromNow < 0) {
            newLabels.push(`${Math.abs(secondsFromNow)}秒前`);
        } else if (secondsFromNow === 0) {
            newLabels.push('現在');
        } else {
            newLabels.push(`${secondsFromNow}秒後`);
        }
    }
    
    // 更新圖表標籤
    window.stockChart.data.labels = newLabels;
    
    // 更新圖表數據
    window.stockChart.data.datasets[0].data = [
        ...pastData, 
        ...Array(futureData.length).fill(null)
    ];
    
    window.stockChart.data.datasets[1].data = [
        ...Array(pastData.length).fill(null),
        ...futureData
    ];
    
    // 更新圖表 Y 軸範圍
    const min = Math.floor(Math.min(...visibleData.filter(val => val !== null)));
    const max = Math.ceil(Math.max(...visibleData.filter(val => val !== null)));
    const padding = (max - min) * 0.1; // 添加10%的填充
    
    window.stockChart.options.scales.y.min = min - padding;
    window.stockChart.options.scales.y.max = max + padding;
    
    // 更新圖表
    window.stockChart.update();
    
    // 更新價格線
    updatePriceLines(min - padding, max + padding);
}

// 更新價格線
function updatePriceLines(min, max) {
    // 清除所有現有的標記和線條
    const oldElements = document.querySelectorAll('.price-line, .price-label');
    oldElements.forEach(element => element.remove());
    
    const chartContainer = document.querySelector('.chart-container');
    const range = max - min;
    
    // 計算合適的間隔，每10或20單位顯示一個標籤
    const interval = range > 100 ? 20 : (range > 50 ? 10 : 5);
    
    // 創建整數間隔的標籤
    for (let price = Math.ceil(min / interval) * interval; price <= max; price += interval) {
        // 計算價格對應的位置百分比
        const percent = (price - min) / range;
        
        // 水平線
        const line = document.createElement('div');
        line.className = 'price-line';
        line.style.top = `${(1 - percent) * 100}%`;
        chartContainer.appendChild(line);
        
        // 價格標籤
        const priceLabel = document.createElement('div');
        priceLabel.className = 'price-label';
        priceLabel.textContent = `USD ${price.toFixed(2)}`;
        priceLabel.style.top = `${(1 - percent) * 100}%`;
        chartContainer.appendChild(priceLabel);
    }
}

// 添加價格變動效果
function addPriceChangeEffect(currentPrice) {
    // 計算與前一個價格的差異
    const previousIndex = Math.max(0, currentPriceIndex - 1);
    const previousPrice = window.allData[previousIndex];
    const priceDifference = currentPrice - previousPrice;
    
    // 根據價格變動更新UI效果
    if (Math.abs(priceDifference) > 0.01) {
        // 價格標籤顏色變化
        const priceTag = document.querySelector('.price-tag');
        if (priceTag) {
            // 重置原有樣式
            priceTag.classList.remove('price-up', 'price-down');
            
            if (priceDifference > 0) {
                // 價格上漲
                priceTag.style.backgroundColor = '#4caf50';
                priceTag.classList.add('price-up');
            } else if (priceDifference < 0) {
                // 價格下跌
                priceTag.style.backgroundColor = '#f44336';
                priceTag.classList.add('price-down');
            }
            
            // 2秒後恢復原始顏色
            setTimeout(() => {
                if (priceTag && priceTag.parentNode) { // 確保元素仍然存在
                    priceTag.style.backgroundColor = '#0066ff';
                }
            }, 2000);
        }
    }
}

// 添加動畫樣式
function addAnimationStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* 動畫效果樣式 */
        .price-tag.price-up {
            animation: price-up 0.5s ease-out;
        }
        
        .price-tag.price-down {
            animation: price-down 0.5s ease-out;
        }
        
        @keyframes price-up {
            0% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-50%) scale(1.2); }
            100% { transform: translateY(-50%) scale(1); }
        }
        
        @keyframes price-down {
            0% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-50%) scale(1.2); }
            100% { transform: translateY(-50%) scale(1); }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// 修正原始買賣功能
function patchBuySellFunctions() {
    if (typeof window.buyStock === 'function' && typeof window.sellStock === 'function') {
        // 保存原始買賣函數
        const originalBuyStock = window.buyStock;
        const originalSellStock = window.sellStock;
        
        // 重新定義買入函數
        window.buyStock = function() {
            // 在執行原始買入函數前，確保使用當前價格
            window.currentStockPrice = window.allData[currentPriceIndex];
            // 調用原始函數
            originalBuyStock();
        };
        
        // 重新定義賣出函數
        window.sellStock = function() {
            // 在執行原始賣出函數前，確保使用當前價格
            window.currentStockPrice = window.allData[currentPriceIndex];
            // 調用原始函數
            originalSellStock();
        };
        
        console.log('已修正買賣功能以使用最新價格');
    }
}

// 在頁面載入時添加樣式
document.addEventListener('DOMContentLoaded', addAnimationStyles);

// 在應用程式初始化後調用此函數
document.addEventListener('DOMContentLoaded', function() {
    // 給應用程式一點時間初始化
    setTimeout(() => {
        initializeAnimatedChart();
        patchBuySellFunctions(); // 修正買賣功能
    }, 1000); // 延遲1秒以確保圖表已完全初始化
});