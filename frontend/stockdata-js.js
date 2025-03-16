// 從API獲取股票數據
async function fetchStockData() {
    try {
        // 模擬API請求 - 未來可替換為真實API調用
        // 例如: const response = await fetch('/api/stock-data');
        
        // 目前使用模擬數據作為臨時方案
        return {
            pastData: [
                120.50, 121.30, 122.45, 121.80, 123.20, 124.50, 125.10, 124.80, 126.30, 127.50,
                126.90, 127.80, 129.20, 130.50, 129.80, 131.20, 132.40, 133.60, 132.80, 134.50,
                133.90, 135.20, 136.40, 137.80, 138.50, 139.20, 140.10, 141.30, 142.50, 140.90
            ],
            futureData: [
                141.30, 142.20, 142.80, 143.50, // 初期小幅上漲
                142.70, 141.40, 139.60, 137.20, 134.80, 131.50, 127.80, 124.30, 121.60, 118.90,
                115.40, 111.80, 107.50, 103.20, 98.70, 94.30 // 之後急劇下跌
            ]
        };
    } catch (error) {
        console.error('獲取股票數據時出錯:', error);
        // 出錯時返回默認數據
        return {
            pastData: [100, 102, 103, 105, 104, 106, 107, 108, 110, 109],
            futureData: [111, 113, 110, 107, 104, 100, 95, 90, 85, 80]
        };
    }
}

// 處理股票數據 - 整合API數據以供圖表使用
async function generateStockData() {
    // 從API獲取數據
    const { pastData, futureData } = await fetchStockData();
    
    // 合併數據
    const allData = [...pastData, ...futureData];
    
    // 保存全域變數
    window.allData = allData;
    window.currentIndex = pastData.length - 1; // 當前位置是"現在"
    window.currentStockPrice = pastData[pastData.length - 1]; // 設置當前股價
    
    return {
        past: pastData,
        future: futureData,
        allData: allData
    };
}

// 深色主題版本的圖表創建函數
function createStockChart(stockData) {
    const pastData = stockData.past;
    const futureData = stockData.future;
    const combinedData = [...pastData, ...futureData];
    
    // 創建標籤（以秒為單位顯示時間）
    const labels = [];
    for (let i = 0; i < combinedData.length; i++) {
        // 只顯示每10秒的標籤以避免擁擠
        if (i % 10 === 0 || i === pastData.length - 1) {
            const secondsFromNow = i - (pastData.length - 1);
            if (secondsFromNow < 0) {
                labels.push(`${Math.abs(secondsFromNow)}秒前`);
            } else if (secondsFromNow === 0) {
                labels.push('現在');
            } else {
                labels.push(`${secondsFromNow}秒後`);
            }
        } else {
            // 其他位置用空字符串，保持位置但不顯示文字
            labels.push('');
        }
    }
    
    // 創建深色主題圖表
    const ctx = document.getElementById('stockChart').getContext('2d');
    window.stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '歷史數據',
                    data: [...pastData, null], // 在"現在"位置之後加入null值，使得線條不會連接到未來趨勢
                    borderColor: '#0066ff', // 更鮮明的藍色線條
                    backgroundColor: 'rgba(0, 102, 255, 0.1)', // 半透明藍色背景
                    borderWidth: 4, // 加粗線條
                    pointRadius: 0, // 不顯示點，使線條更流暢
                    pointHoverRadius: 5, // 鼠標懸停時顯示點
                    pointBackgroundColor: '#0066ff',
                    tension: 0, // 使用折線而非曲線
                    fill: false
                },
                {
                    label: '未來趨勢',
                    data: Array(pastData.length).fill(null).concat(futureData), // 歷史部分使用null，只顯示未來部分
                    borderColor: '#ff3333', // 紅色線條
                    backgroundColor: 'rgba(255, 51, 51, 0.1)', // 半透明紅色背景
                    borderWidth: 3, // 稍微細一點的線條
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#ff3333',
                    tension: 0, // 使用折線而非曲線
                    fill: false,
                    borderDash: [5, 5] // 添加虛線效果，強調這是預測
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#e0e0e0',
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(30, 30, 30, 0.9)', // 深色背景
                    titleColor: '#f0f0f0', // 淺色標題
                    bodyColor: '#f0f0f0', // 淺色內容
                    borderColor: '#555',
                    borderWidth: 1,
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    callbacks: {
                        label: function(context) {
                            return `USD: ${context.raw.toFixed(2)}`;
                        },
                        title: function(context) {
                            const dataIndex = context[0].dataIndex;
                            const secondsFromNow = dataIndex - (pastData.length - 1);
                            if (secondsFromNow < 0) {
                                return `${Math.abs(secondsFromNow)}秒前`;
                            } else if (secondsFromNow === 0) {
                                return '現在';
                            } else {
                                return `${secondsFromNow}秒後`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false, // 隱藏內建的x軸標籤，使用自定義的日期標籤
                    grid: {
                        display: false
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)', // 淺色網格線
                        drawBorder: false,
                        lineWidth: 1,
                        display: false // 不顯示內建網格線，我們將使用自定義的
                    },
                    ticks: {
                        display: false, // 不顯示Y軸刻度
                        padding: 30,
                        color: '#e0e0e0' // 淺色刻度文字
                    },
                    border: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1500
            }
        }
    });
    
    // 更新時間線位置 - 準確定位在"今天"
    const timelineMarker = document.querySelector('.timeline-marker');
    // 計算"今天"的位置（過去數據的最後一個點）
    const todayPosition = ((pastData.length - 1) / (combinedData.length - 1)) * 100;
    timelineMarker.style.left = `${todayPosition}%`;
    timelineMarker.style.right = 'auto'; // 移除右側定位，確保只使用左側定位
    
    // 添加未來趨勢區域指示
    const chartContainer = document.querySelector('.chart-container');
    const futureTrendIndicator = document.createElement('div');
    futureTrendIndicator.className = 'future-trend-indicator';
    futureTrendIndicator.style.left = `${todayPosition}%`;
    chartContainer.appendChild(futureTrendIndicator);
    
    return labels; // 返回標籤，以便在添加價格標記時使用
}

function createDateLabels(labels) {
    const container = document.getElementById('dateLabelsContainer');
    container.innerHTML = ''; // 清除現有標籤
    
    // 只顯示重要的日期標籤
    const keyDates = [];
    const indicesToShow = [0, Math.floor(labels.length * 0.2), Math.floor(labels.length * 0.4), 
                          Math.floor(labels.length * 0.6), Math.floor(labels.length * 0.8), labels.length - 1];
    
    for (let i = 0; i < labels.length; i++) {
        if (indicesToShow.includes(i) && labels[i] !== '') {
            keyDates.push({
                index: i,
                label: labels[i]
            });
        }
    }
    
    // 創建日期標籤並設置位置
    keyDates.forEach(date => {
        const label = document.createElement('div');
        label.className = 'date-label';
        label.textContent = date.label;
        
        // 計算左邊位置百分比
        const leftPercent = (date.index / (labels.length - 1)) * 100;
        label.style.position = 'absolute';
        label.style.left = `${leftPercent}%`;
        label.style.transform = 'translateX(-50%)'; // 居中標籤
        
        container.appendChild(label);
    });
}

// 添加整數價格標記 - 深色主題版本
function addIntegerPriceLabels(data) {
    const chartContainer = document.querySelector('.chart-container');
    
    // 清除所有現有的標記和線條
    const oldElements = document.querySelectorAll('.price-line, .price-label, .price-tag');
    oldElements.forEach(element => element.remove());
    
    // 找到數據的最小值和最大值
    const min = Math.floor(Math.min(...data));
    const max = Math.ceil(Math.max(...data));
    const range = max - min;
    
    // 計算合適的間隔，每10或20單位顯示一個標籤
    const interval = range > 100 ? 20 : 10;
    
    // 創建整數間隔的標籤
    for (let price = min; price <= max; price += interval) {
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
        priceLabel.textContent = `USD ${price.toFixed(0)}`;
        priceLabel.style.top = `${(1 - percent) * 100}%`;
        chartContainer.appendChild(priceLabel);
    }
    
    // 添加當前價格標記（紅色標籤）
    const currentPrice = data[window.currentIndex];
    const currentPricePercent = (currentPrice - min) / range;
    
    const currentPriceTag = document.createElement('div');
    currentPriceTag.className = 'price-tag';
    currentPriceTag.textContent = `USD ${currentPrice.toFixed(2)}`;
    currentPriceTag.style.top = `${(1 - currentPricePercent) * 100}%`;
    chartContainer.appendChild(currentPriceTag);
    
    // 更新圖表的Y軸範圍
    window.stockChart.options.scales.y.min = min;
    window.stockChart.options.scales.y.max = max;
    window.stockChart.update();
}

// 備份原始函數以便必要時使用
// const originalGenerateStockData = generateStockData;
