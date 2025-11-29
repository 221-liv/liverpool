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

// ===== 自动导入用户数据功能 =====
(function autoImportUsers() {
    // 只有在非登录页面才执行，避免重复导入
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('register.html')) {
        return;
    }
    
    try {
        console.log('🔄 开始自动导入用户数据...');
        
        // 15名学生用户数据
        const students = [
            { name: "胡昊杨", studentId: "17252404" },
            { name: "冒鈺城", studentId: "17250514" },
            { name: "刘钊源", studentId: "17250082" },
            { name: "刘彦钊", studentId: "17253321" },
            { name: "张晨", studentId: "17253334" },
            { name: "金扬颖", studentId: "15245793" },
            { name: "张宇欣", studentId: "17255887" },
            { name: "吕彦博", studentId: "17251502" },
            { name: "谢浩然", studentId: "17251546" },
            { name: "夏雨璨", studentId: "17251531" },
            { name: "宁佳佳", studentId: "17255417" },
            { name: "赵雅星", studentId: "17255893" },
            { name: "唐于杰", studentId: "17253344" },
            { name: "何剑飞", studentId: "17253299" },
            { name: "周宇翔", studentId: "17254248" }
        ];
        
        // 获取或创建全局用户列表
        let allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        let classUsers = JSON.parse(localStorage.getItem('classUsers') || '[]');
        let addedCount = 0;
        
        // 导入每个用户
        students.forEach(student => {
            // 检查用户是否已存在（多种存储方式都检查）
            const existsInAllUsers = allUsers.some(u => u.studentId === student.studentId);
            const existsInClassUsers = classUsers.some(u => u.studentId === student.studentId);
            const userRecordKey = `${window.STORAGE_KEYS.USER_RECORDS}_${student.studentId}`;
            const hasUserRecord = localStorage.getItem(userRecordKey) !== null;
            
            if (!existsInAllUsers && !existsInClassUsers && !hasUserRecord) {
                // 添加到所有可能用到的存储位置
                allUsers.push({
                    name: student.name,
                    studentId: student.studentId,
                    createdAt: new Date().toISOString()
                });
                
                classUsers.push({
                    name: student.name,
                    studentId: student.studentId
                });
                
                // 为用户创建记录存储空间
                localStorage.setItem(userRecordKey, JSON.stringify([]));
                
                // 同时为用户创建单独的信息存储
                localStorage.setItem(`${window.STORAGE_KEYS.USER_INFO}_${student.studentId}`, JSON.stringify({
                    name: student.name,
                    studentId: student.studentId
                }));
                
                addedCount++;
                console.log(`✅ 已导入用户: ${student.name} (${student.studentId})`);
            }
        });
        
        // 保存更新后的用户列表
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        localStorage.setItem('classUsers', JSON.stringify(classUsers));
        
        // 更新排名数据
        updateClassRanking();
        
        if (addedCount > 0) {
            console.log(`✅ 成功导入 ${addedCount} 个新用户！`);
        } else {
            console.log(`ℹ️ 用户数据已存在，无需重新导入`);
        }
    } catch (error) {
        console.error('❌ 用户数据导入出错:', error.message);
    }
    
    // 更新班级排名数据函数
    function updateClassRanking() {
        try {
            let rankingData = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.CLASS_RANKING) || '{}');
            const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
            
            allUsers.forEach(user => {
                if (!rankingData[user.studentId]) {
                    rankingData[user.studentId] = {
                        name: user.name,
                        studentId: user.studentId,
                        totalEmission: 0,
                        totalSavings: 0,
                        recordCount: 0,
                        lastUpdated: new Date().toISOString()
                    };
                }
            });
            
            localStorage.setItem(window.STORAGE_KEYS.CLASS_RANKING, JSON.stringify(rankingData));
        } catch (error) {
            console.error('❌ 更新排名数据失败:', error.message);
        }
    }
})(); // 立即执行函数

// 页面加载和初始化已完成
// 以下是窗口级别的错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('未捕获的错误:', { message, source, lineno, colno, error });
    return true; // 防止默认处理
};

// 监听Promise错误
window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
    event.preventDefault();
});

// 确保TRANSPORT_OPTIONS存在
if (!window.TRANSPORT_OPTIONS) {
    window.TRANSPORT_OPTIONS = [];
}

// 确保DIET_OPTIONS存在
if (!window.DIET_OPTIONS) {
    window.DIET_OPTIONS = [];
}

// 创建降级计算器实现
function createFallbackCalculator() {
    return {
        compareEmissions: function(option1, option2) {
            const getEmissionFactor = function(type, item) {
                const factors = {
                    transportation: {
                        walking: 0,
                        cycling: 0,
                        bus: 0.089,
                        subway: 0.041,
                        taxi: 0.159,
                        car_small: 0.122,
                        car_medium: 0.172,
                        car_large: 0.221,
                        motorcycle: 0.091,
                        train: 0.041,          // 修正为0.041(高铁/动车)
                        plane_domestic: 0.255,
                        plane_international: 0.195
                    },
                    diet: {
                        beef: 27.0,
                        pork: 12.0,
                        chicken: 6.0,
                        eggs: 4.8,
                        milk: 3.0,
                        rice: 3.0,
                        wheat: 2.5,
                        tomato: 1.75,
                        lettuce: 0.75,
                        broccoli: 2.8,
                        carrot: 1.1,
                        apple: 0.8,
                        banana: 0.7,
                        vegetables: 2.0,
                        fruits: 1.1,
                        grains: 2.7
                    }
                };
                return factors[type] && factors[type][item] ? factors[type][item] : 0;
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
        },
        getCarbonReductionTips: function(carbonAmount) {
            const tips = [];
            if (carbonAmount > 10) {
                tips.push('选择更环保的选项可以显著减少碳排放');
                tips.push('考虑使用公共交通或植物性食品');
            } else {
                tips.push('您的选择已经很环保，继续保持！');
            }
            return tips;
        },
        calculateEquivalentTrees: function(carbonAmount) {
            return carbonAmount / 21.77; // 一棵树一年吸收约21.77公斤CO2
        }
    };
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
        console.log('设置事件监听器...');
        
        // 计算按钮事件
        const calculateBtn = document.getElementById('calculate-btn');
        if (calculateBtn) {
            console.log('找到计算按钮，绑定点击事件');
            calculateBtn.addEventListener('click', () => {
                console.log('计算按钮被点击，当前标签:', this.currentTab);
                this.handleCalculate();
            });
        } else {
            console.error('未找到计算按钮 #calculate-btn');
        }

        // 保存记录按钮事件
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', this.handleSaveRecord.bind(this));
        }

        // 监听食品类型变化，显示牛肉碳足迹构成分析
        const foodType1 = document.getElementById('food-type-1');
        const foodType2 = document.getElementById('food-type-2');

        if (foodType1 && foodType2) {
            const checkBeef = () => {
                const hasBeef = foodType1.value === 'beef' || foodType2.value === 'beef';
                const beefBreakdown = document.getElementById('beef-breakdown');
                if (beefBreakdown && hasBeef) {
                    beefBreakdown.style.display = 'block';
                    this.showBeefBreakdown();
                }
            };

            foodType1.addEventListener('change', checkBeef);
            foodType2.addEventListener('change', checkBeef);
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
            entericFermentation: '肠道发酵',
            feedProduction: '饲料生产',
            manureManagement: '粪便管理',
            farmEnergyUse: '农场能源使用',
            processing: '加工处理',
            transportation: '运输配送',
            retail: '零售环节',
            other: '其他'
        };

        // 创建柱状图可视化
        let html = '';
        for (const [key, value] of Object.entries(breakdown)) {
            html += `
                <div class="breakdown-item">
                    <div class="breakdown-label">${labels[key]} (${value}%)</div>
                    <div class="breakdown-bar-container">
                        <div class="breakdown-bar" style="width: ${value}%;">
                            <span class="breakdown-value">${value}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
        breakdownChart.innerHTML = html;
    }
    
    // 检查是否选择了牛肉并显示分析
    checkAndShowBeefBreakdown(option1Item, option2Item) {
        const beefBreakdown = document.getElementById('beef-breakdown');
        if (!beefBreakdown) return;
        
        const hasBeef = option1Item === 'beef' || option2Item === 'beef';
        
        if (hasBeef) {
            beefBreakdown.style.display = 'block';
            this.showBeefBreakdown();
        } else {
            beefBreakdown.style.display = 'none';
        }
    }
}

// 扩展Calculator类的原型方法
Calculator.prototype.handleCalculate = function() {
    console.log('===== 开始计算 =====');
    console.log('当前标签:', this.currentTab);
    
    // 创建降级计算器实现
    const createFallbackCalculator = () => {
        console.log('使用降级计算器');
        return {
            compareEmissions: function(option1, option2) {
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
            },
            getCarbonReductionTips: function(carbonAmount, activityType) {
                const tips = [];
                if (carbonAmount > 10) {
                    tips.push('选择更环保的选项可以显著减少碳排放');
                    tips.push('考虑使用公共交通或植物性食品');
                } else {
                    tips.push('您的选择已经很环保，继续保持！');
                }
                return tips;
            },
            calculateEquivalentTrees: function(carbonAmount) {
                return carbonAmount / 21.77; // 一棵树一年吸收约21.77公斤CO2
            }
        };
    };
    
    try {
        let option1, option2;

        if (this.currentTab === 'transport') {
            console.log('处理交通方式计算');
            // 获取交通方式计算数据
            const transportType1 = document.getElementById('transport-type-1')?.value;
            const distance1 = parseFloat(document.getElementById('distance-1')?.value) || 0;
            const transportType2 = document.getElementById('transport-type-2')?.value;
            const distance2 = parseFloat(document.getElementById('distance-2')?.value) || 0;

            console.log('交通选项1:', transportType1, distance1);
            console.log('交通选项2:', transportType2, distance2);

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
            console.log('处理食品消费计算');
            // 获取食品消费计算数据
            const foodType1 = document.getElementById('food-type-1')?.value;
            const foodAmount1 = parseFloat(document.getElementById('food-amount-1')?.value) || 0;
            const foodType2 = document.getElementById('food-type-2')?.value;
            const foodAmount2 = parseFloat(document.getElementById('food-amount-2')?.value) || 0;

            console.log('食品选项1:', foodType1, foodAmount1);
            console.log('食品选项2:', foodType2, foodAmount2);

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

        // 尝试使用主要计算方法，失败则使用降级方案
        let comparisonResult;
        try {
            const calculator = window.carbonCalculator || createFallbackCalculator();
            console.log('使用计算器:', calculator ? '主计算器' : '降级计算器');
            comparisonResult = calculator.compareEmissions(option1, option2);
            console.log('计算结果:', comparisonResult);
        } catch (calcError) {
            console.warn('主要计算方法失败，使用降级方案:', calcError);
            // 使用全局的降级计算器实现
            comparisonResult = createFallbackCalculator().compareEmissions(option1, option2);
        }
        
        // 显示结果
        console.log('准备显示结果');
        this.displayComparisonResults(comparisonResult);
        console.log('===== 计算完成 =====');

    } catch (error) {
        console.error('计算过程中出错:', error);
        console.error('错误堆栈:', error.stack);
        // 使用降级计算函数作为最后的备用方案
        try {
            const resultsSection = document.getElementById('results-section');
            if (resultsSection) {
                resultsSection.style.display = 'block';
                resultsSection.innerHTML = `
                    <div class="fallback-message" style="background: #ffebee; padding: 20px; border-radius: 8px;">
                        <h3 style="color: #c62828;">计算出现错误</h3>
                        <p>错误信息: ${error.message}</p>
                        <p>请刷新页面重试，或查看控制台了解详情。</p>
                    </div>
                `;
            }
        } catch (fallbackError) {
            alert('计算过程中出现错误: ' + error.message);
        }
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
        return window.utils?.formatCarbonEmission(amount) || (amount.toFixed(2) + ' kg CO₂e');
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
        document.getElementById('trees-saved').textContent = treesSaved.toFixed(2) + ' 棵';
    }

    // 如果是食品计算且选择了牛肉，显示牛肉碳足迹构成分析
    if (this.currentTab === 'food') {
        this.checkAndShowBeefBreakdown(result.option1.item, result.option2.item);
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
        const notesElement = document.getElementById('record-notes');
        const notes = notesElement ? notesElement.value || '' : '';

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
        console.log('准备保存记录:', record);

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
        // 安全地获取window.utils和window.STORAGE_KEYS
        const utils = window.utils || {};
        const STORAGE_KEYS = window.STORAGE_KEYS || { USER_RECORDS: 'carbon_footprint_records' };
        
        // 获取现有记录
        const records = utils.storage?.get(STORAGE_KEYS.USER_RECORDS) || [];
        console.log('现有记录数量:', records.length);
        
        // 添加ID
        record.id = utils.generateId ? utils.generateId() : Date.now().toString();
        
        // 添加到记录列表
        records.unshift(record);
        console.log('添加记录后数量:', records.length);
        
        // 限制记录数量
        if (records.length > 100) {
            records.splice(100);
            console.log('已限制记录数量为100条');
        }
        
        // 保存回localStorage
        const saved = utils.storage?.set(STORAGE_KEYS.USER_RECORDS, records);
        console.log('记录保存状态:', saved);
        
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

// 初始化页面
function initializePage() {
    try {
        // 确保基本常量已定义
        ensureConstantsDefined();
        
        console.log('页面初始化开始，当前路径:', window.location.pathname);
        console.log('当前URL:', window.location.href);
        
        // 检查当前是否为计算器页面（更宽松的检查）
        const isCalculatorPage = window.location.pathname.includes('calculator') || 
                                 document.getElementById('calculate-btn') !== null;
        
        if (isCalculatorPage) {
            console.log('✅ 检测到计算器页面，开始初始化...');
            
            // 绝对不执行任何登录检查
            console.log('计算器页面以访客模式运行，无需登录');
            
            // 初始化计算器（多种降级方案）
            initCalculatorWithFallback();
        } else {
            // 对于其他页面，可以保留原有的初始化逻辑
            console.log('非计算器页面，执行标准初始化');
        }
    } catch (error) {
        console.error('页面初始化失败:', error);
    }
}

// 确保常量已定义
function ensureConstantsDefined() {
    // 定义交通选项
    if (!window.TRANSPORT_OPTIONS || window.TRANSPORT_OPTIONS.length === 0) {
        window.TRANSPORT_OPTIONS = [
            { value: 'walking', label: '步行' },
            { value: 'cycling', label: '骑自行车' },
            { value: 'subway', label: '地铁/轻轨' },
            { value: 'bus', label: '公交车' },
            { value: 'train', label: '高铁/动车' },
            { value: 'motorcycle', label: '摩托车' },
            { value: 'car_small', label: '小型汽车(1.0-1.6L)' },
            { value: 'taxi', label: '出租车' },
            { value: 'car_medium', label: '中型汽车(1.6-2.5L)' },
            { value: 'car_large', label: '大型汽车/SUV(2.5L+)' },
            { value: 'plane_international', label: '国际航班' },
            { value: 'plane_domestic', label: '国内航班' }
        ];
    }

    // 定义饮食选项
    if (!window.DIET_OPTIONS || window.DIET_OPTIONS.length === 0) {
        window.DIET_OPTIONS = [
            { value: 'beef', label: '牛肉' },
            { value: 'pork', label: '猪肉' },
            { value: 'chicken', label: '鸡肉' },
            { value: 'eggs', label: '鸡蛋' },
            { value: 'milk', label: '牛奶' },
            { value: 'rice', label: '大米' },
            { value: 'wheat', label: '小麦' },
            { value: 'vegetables', label: '蔬菜' },
            { value: 'fruits', label: '水果' },
            { value: 'grains', label: '谷物' }
        ];
    }

    // 定义排放因子
    if (!window.EMISSION_FACTORS) {
        window.EMISSION_FACTORS = {
            transportation: {
                walking: 0,
                cycling: 0,
                bus: 0.089,
                subway: 0.041,
                taxi: 0.159,
                car_small: 0.122,
                car_medium: 0.172,
                car_large: 0.221,
                motorcycle: 0.091,
                train: 0.041,          // 修正为0.041(高铁/动车)
                plane_domestic: 0.255,
                plane_international: 0.195
            },
            diet: {
                beef: 27.0,
                pork: 12.0,
                chicken: 6.0,
                eggs: 4.8,
                milk: 3.0,
                rice: 3.0,
                wheat: 2.5,
                vegetables: 2.0,
                fruits: 1.1,
                grains: 2.7
            }
        };
    }

    // 定义牛肉排放构成
    if (!window.BEEF_EMISSION_BREAKDOWN) {
        window.BEEF_EMISSION_BREAKDOWN = {
            entericFermentation: 40,
            feedProduction: 26,
            manureManagement: 10,
            farmEnergyUse: 7,
            processing: 4,
            transportation: 5,
            retail: 3,
            other: 5
        };
    }
}

// 使用降级方案初始化计算器
function initCalculatorWithFallback() {
    try {
        // 创建并初始化计算器实例
        const calculator = new Calculator();
        calculator.init();
        console.log('计算器初始化成功');
    } catch (error) {
        console.error('计算器初始化失败:', error);
        // 显示降级模式消息
        try {
            const resultsSection = document.getElementById('results-section');
            if (resultsSection) {
                resultsSection.style.display = 'block';
                resultsSection.innerHTML = `
                    <div class="fallback-message">
                        <h3>降级模式已启用</h3>
                        <p>计算器正在使用备用功能，请刷新页面或检查您的网络连接。</p>
                    </div>
                `;
            }
        } catch (fallbackError) {
            console.error('无法显示降级模式消息:', fallbackError);
        }
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initializePage);
