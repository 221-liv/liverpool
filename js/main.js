// 主JavaScript文件 - 页面交互和功能初始化

// 立即定义所有必要的全局常量默认值，防止在其他文件加载完成前访问时出错
if (!window.STORAGE_KEYS) {
    window.STORAGE_KEYS = {
        USER_RECORDS: 'carbon_footprint_records',
        USER_INFO: 'user_info',
        CLASS_RANKING: 'class_carbon_ranking',
        ADMIN_LOGGED_IN: 'admin_logged_in',
        USER_LOGGED_IN: 'user_logged_in'
    };
}

// 继续添加Calculator类的方法
Calculator.prototype.handleCalculate = function() {
    const calculator = window.carbonCalculator || new (function() {
        // 降级的计算器实现
        this.compareEmissions = function(option1, option2) {
            // 使用常量中的排放系数进行计算
            const getEmissionFactor = (type, item) => {
                if (type === 'transportation') {
                    return window.EMISSION_FACTORS?.transportation?.[item] || 0.1;
                } else if (type === 'diet') {
                    return window.EMISSION_FACTORS?.diet?.[item] || 1.0;
                }
                return 0.1;
            };

            const emission1 = option1.amount * getEmissionFactor(option1.type, option1.item);
            const emission2 = option2.amount * getEmissionFactor(option2.type, option2.item);

            return {
                option1: { ...option1, emission: emission1 },
                option2: { ...option2, emission: emission2 },
                difference: Math.abs(emission1 - emission2),
                savings: Math.max(emission1, emission2) - Math.min(emission1, emission2),
                lowerOption: emission1 < emission2 ? 'option1' : 'option2'
            };
        };

        this.getCarbonReductionTips = function(carbonAmount) {
            const tips = [];
            if (carbonAmount > 10) {
                tips.push('选择更环保的选项可以显著减少碳排放');
                tips.push('考虑使用公共交通或植物性食品');
            } else {
                tips.push('您的选择已经很环保，继续保持！');
            }
            return tips;
        };

        this.calculateEquivalentTrees = function(carbonAmount) {
            return carbonAmount / 21.77; // 一棵树一年吸收约21.77公斤CO2
        };
    })();

    try {
        let option1, option2;

        if (this.currentTab === 'transport') {
            // 获取交通方式计算数据
            const transportType1 = document.getElementById('transport-type-1').value;
            const distance1 = parseFloat(document.getElementById('distance-1').value) || 0;
            const transportType2 = document.getElementById('transport-type-2').value;
            const distance2 = parseFloat(document.getElementById('distance-2').value) || 0;

            option1 = {
                type: 'transportation',
                item: transportType1,
                amount: distance1
            };

            option2 = {
                type: 'transportation',
                item: transportType2,
                amount: distance2
            };
        } else {
            // 获取食品消费计算数据
            const foodType1 = document.getElementById('food-type-1').value;
            const foodAmount1 = parseFloat(document.getElementById('food-amount-1').value) || 0;
            const foodType2 = document.getElementById('food-type-2').value;
            const foodAmount2 = parseFloat(document.getElementById('food-amount-2').value) || 0;

            option1 = {
                type: 'diet',
                item: foodType1,
                amount: foodAmount1
            };

            option2 = {
                type: 'diet',
                item: foodType2,
                amount: foodAmount2
            };
        }

        // 计算碳足迹并比较
        const comparisonResult = calculator.compareEmissions(option1, option2);
        
        // 显示结果
        this.displayComparisonResults(comparisonResult);

    } catch (error) {
        console.error('计算过程中出错:', error);
        alert('计算过程中出现错误，请检查输入后重试。');
    }
};

Calculator.prototype.displayComparisonResults = function(result) {
    // 显示结果区域
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }

    // 获取选项标签
    const getOptionLabel = (option) => {
        if (option.type === 'transportation') {
            const transportOption = this.transportOptions.find(opt => opt.value === option.item);
            return transportOption ? transportOption.label : option.item;
        } else {
            const dietOption = this.dietOptions.find(opt => opt.value === option.item);
            return dietOption ? dietOption.label : option.item;
        }
    };

    // 更新结果显示
    if (document.getElementById('option1-name')) {
        document.getElementById('option1-name').textContent = getOptionLabel(result.option1);
    }
    if (document.getElementById('option2-name')) {
        document.getElementById('option2-name').textContent = getOptionLabel(result.option2);
    }

    // 格式化碳排放量显示
    const formatEmission = (amount) => {
        return window.utils?.formatCarbonEmission(amount) || (amount.toFixed(2) + ' kg');
    };

    if (document.getElementById('option1-emission')) {
        document.getElementById('option1-emission').textContent = formatEmission(result.option1.emission);
    }
    if (document.getElementById('option2-emission')) {
        document.getElementById('option2-emission').textContent = formatEmission(result.option2.emission);
    }
    if (document.getElementById('carbon-saved')) {
        document.getElementById('carbon-saved').textContent = formatEmission(result.savings);
    }

    // 计算相当于种植多少棵树
    const calculator = window.carbonCalculator;
    const treesSaved = calculator ? calculator.calculateEquivalentTrees(result.savings) : (result.savings / 21.77);
    if (document.getElementById('trees-saved')) {
        document.getElementById('trees-saved').textContent = treesSaved.toFixed(2);
    }

    // 显示环保建议
    const reductionTips = calculator ? calculator.getCarbonReductionTips(Math.max(result.option1.emission, result.option2.emission), this.currentTab) : ['选择低碳选项，保护地球环境'];
    const tipsList = document.getElementById('reduction-tips');
    if (tipsList) {
        tipsList.innerHTML = '';
        reductionTips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsList.appendChild(li);
        });
    }

    // 启用保存按钮
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.disabled = false;
    }

    // 保存结果到全局，供保存记录使用
    this.currentResult = result;
};

Calculator.prototype.handleSaveRecord = function() {
    try {
        // 检查是否有计算结果
        if (!this.currentResult) {
            alert('请先进行计算再保存记录');
            return;
        }

        // 获取备注信息
        const notes = document.getElementById('record-notes').value || '';

        // 创建记录对象
        const record = {
            activityType: this.currentTab === 'transport' ? 'transportation' : 'diet',
            option1: this.currentResult.option1,
            option2: this.currentResult.option2,
            savings: this.currentResult.savings,
            totalEmission: Math.min(this.currentResult.option1.emission, this.currentResult.option2.emission),
            notes: notes,
            timestamp: new Date().toISOString()
        };

        // 保存记录
        const calculator = window.carbonCalculator;
        if (calculator && typeof calculator.saveRecord === 'function') {
            calculator.saveRecord(record).then(() => {
                alert('记录保存成功！');
                // 清空备注
                if (document.getElementById('record-notes')) {
                    document.getElementById('record-notes').value = '';
                }
            }).catch(error => {
                console.error('保存记录失败:', error);
                // 降级保存到localStorage
                this.fallbackSaveRecord(record);
            });
        } else {
            // 降级保存到localStorage
            this.fallbackSaveRecord(record);
        }
    } catch (error) {
        console.error('保存记录过程中出错:', error);
        alert('保存记录失败，请重试。');
    }
};

Calculator.prototype.fallbackSaveRecord = function(record) {
    try {
        // 获取现有记录
        const records = window.utils?.storage?.get(STORAGE_KEYS.USER_RECORDS) || [];
        
        // 添加ID
        record.id = window.utils?.generateId() || Date.now().toString();
        
        // 添加到记录列表
        records.unshift(record);
        
        // 限制记录数量
        if (records.length > 100) {
            records.splice(100);
        }
        
        // 保存回localStorage
        const saved = window.utils?.storage?.set(STORAGE_KEYS.USER_RECORDS, records);
        
        if (saved) {
            alert('记录保存成功！');
        } else {
            throw new Error('保存失败');
        }
    } catch (error) {
        console.error('降级保存失败:', error);
        alert('保存记录失败，请重试。');
    }
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    try {
        // 确保Calculator类存在
        if (window.Calculator) {
            const app = new window.Calculator();
            app.init();
        } else {
            // 创建临时的Calculator实例
            const app = new Calculator();
            app.init();
        }
        console.log('计算器初始化完成');
    } catch (error) {
        console.error('计算器初始化失败:', error);
    }
});

// 确保EMISSION_FACTORS存在
if (!window.EMISSION_FACTORS) {
    window.EMISSION_FACTORS = {
        transportation: {},
        energy: {},
        diet: {}
    };
}

// 确保TRANSPORT_OPTIONS存在
if (!window.TRANSPORT_OPTIONS) {
    window.TRANSPORT_OPTIONS = [];
}

// 确保DIET_OPTIONS存在
if (!window.DIET_OPTIONS) {
    window.DIET_OPTIONS = [];
}

// 确保工具函数存在
if (!window.utils) {
    window.utils = {
        storage: {
            get: function(key) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (error) {
                    console.error('Error reading from localStorage:', error);
                    return null;
                }
            },
            set: function(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (error) {
                    console.error('Error writing to localStorage:', error);
                    return false;
                }
            }
        },
        formatCarbonEmission: function(amount) {
            if (amount === 0) return '0 kg';
            if (amount < 1) {
                return (amount * 1000).toFixed(2) + ' g';
            } else if (amount < 1000) {
                return amount.toFixed(2) + ' kg';
            } else {
                return (amount / 1000).toFixed(2) + ' t';
            }
        },
        generateId: function() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
    };
}

// 计算器类
class Calculator {
    constructor() {
        this.transportOptions = window.TRANSPORT_OPTIONS || [];
        this.dietOptions = window.DIET_OPTIONS || [];
        this.currentTab = 'transport'; // 默认为交通方式标签
    }

    // 初始化页面
    init() {
        this.setupTabs();
        this.populateDropdowns();
        this.setupEventListeners();
    }

    // 设置标签切换
    setupTabs() {
        const transportTab = document.getElementById('transport-tab');
        const foodTab = document.getElementById('food-tab');
        const transportSection = document.getElementById('transport-section');
        const foodSection = document.getElementById('food-section');
        const transportKnowledge = document.getElementById('transport-knowledge');
        const foodKnowledge = document.getElementById('food-knowledge');

        if (transportTab && foodTab) {
            transportTab.addEventListener('click', () => {
                this.switchTab('transport');
                if (transportSection) transportSection.style.display = 'block';
                if (foodSection) foodSection.style.display = 'none';
                if (transportKnowledge) transportKnowledge.style.display = 'block';
                if (foodKnowledge) foodKnowledge.style.display = 'none';
                transportTab.classList.add('active');
                foodTab.classList.remove('active');
            });

            foodTab.addEventListener('click', () => {
                this.switchTab('food');
                if (transportSection) transportSection.style.display = 'none';
                if (foodSection) foodSection.style.display = 'block';
                if (transportKnowledge) transportKnowledge.style.display = 'none';
                if (foodKnowledge) foodKnowledge.style.display = 'block';
                foodTab.classList.add('active');
                transportTab.classList.remove('active');
            });
        }
    }

    // 切换标签
    switchTab(tab) {
        this.currentTab = tab;
        // 重置结果显示区域
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
    }

    // 填充下拉选择框
    populateDropdowns() {
        // 填充交通方式下拉框
        this.populateDropdown('transport-type-1', this.transportOptions);
        this.populateDropdown('transport-type-2', this.transportOptions);
        
        // 填充食品类别下拉框
        this.populateDropdown('food-type-1', this.dietOptions);
        this.populateDropdown('food-type-2', this.dietOptions);
    }

    // 填充单个下拉框
    populateDropdown(elementId, options) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            element.appendChild(optionElement);
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 计算按钮事件
        const calculateBtn = document.getElementById('calculate-btn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', this.handleCalculate.bind(this));
        }

        // 保存记录按钮事件
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', this.handleSaveRecord.bind(this));
        }

        // 监听食品类型变化，显示牛肉碳足迹构成分析
        const foodType1 = document.getElementById('food-type-1');
        const foodType2 = document.getElementById('food-type-2');
        const beefBreakdown = document.getElementById('beef-breakdown');

        if (foodType1 && foodType2 && beefBreakdown) {
            const showBeefBreakdown = () => {
                const show = (foodType1.value === 'beef' || foodType2.value === 'beef');
                beefBreakdown.style.display = show ? 'block' : 'none';
                if (show) {
                    this.showBeefBreakdown();
                }
            };

            foodType1.addEventListener('change', showBeefBreakdown);
            foodType2.addEventListener('change', showBeefBreakdown);
        }
    }

    // 显示牛肉碳足迹构成分析
    showBeefBreakdown() {
        const breakdownChart = document.querySelector('.breakdown-chart');
        if (!breakdownChart) return;

        const breakdown = window.BEEF_EMISSION_BREAKDOWN || {
            entericFermentation: 40,
            feedProduction: 26,
            manureManagement: 10,
            farmEnergyUse: 7,
            processing: 4,
            transportation: 5,
            retail: 3,
            other: 5
        };

        const labels = {
            entericFermentation: '肠道发酵 (40%)',
            feedProduction: '饲料生产 (26%)',
            manureManagement: '粪便管理 (10%)',
            farmEnergyUse: '农场能源使用 (7%)',
            processing: '加工处理 (4%)',
            transportation: '运输配送 (5%)',
            retail: '零售环节 (3%)',
            other: '其他 (5%)'
        };

        // 创建简单的可视化
        let html = '<div class="breakdown-bars">';
        for (const [key, value] of Object.entries(breakdown)) {
            html += `
                <div class="breakdown-item">
                    <div class="breakdown-label">${labels[key]}</div>
                    <div class="breakdown-bar" style="width: ${value}%;">
                        <div class="breakdown-value">${value}%</div>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        breakdownChart.innerHTML = html;
    }
};