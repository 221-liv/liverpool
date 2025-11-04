// 主JavaScript文件 - 页面交互和功能初始化

// ===== 核心安全初始化 - 确保所有全局常量在任何情况下都可用 =====
// 立即定义所有必要的全局常量默认值，防止在其他文件加载完成前访问时出错

// 确保STORAGE_KEYS存在
window.STORAGE_KEYS = window.STORAGE_KEYS || {
    USER_INFO: 'carbon_app_user_info',
    USER_RECORDS: 'carbon_app_user_records',
    CLASS_RANKING: 'carbon_app_class_ranking',
    ADMIN_SESSION: 'carbon_app_admin_session'
};

// 确保EMISSION_FACTORS存在
window.EMISSION_FACTORS = window.EMISSION_FACTORS || {
    transportation: {
        car_small: 0.2,
        bus: 0.05,
        subway: 0.03,
        bike: 0,
        walk: 0,
        car: 0.2,
        walking: 0,
        bicycle: 0,
        taxi: 0.15,
        train: 0.02,
        plane: 0.25
    },
    energy: {},
    diet: {}
};

// 确保TRANSPORT_OPTIONS存在
window.TRANSPORT_OPTIONS = window.TRANSPORT_OPTIONS || [
    { value: 'walk', label: '步行', emissionFactor: 0 },
    { value: 'bike', label: '自行车', emissionFactor: 0 },
    { value: 'subway', label: '地铁', emissionFactor: 0.03 },
    { value: 'bus', label: '公交车', emissionFactor: 0.05 },
    { value: 'car_small', label: '小型汽车', emissionFactor: 0.2 },
    { value: 'walking', label: '步行', emissionFactor: 0 },
    { value: 'bicycle', label: '自行车', emissionFactor: 0 },
    { value: 'taxi', label: '出租车', emissionFactor: 0.15 },
    { value: 'train', label: '火车', emissionFactor: 0.02 },
    { value: 'plane', label: '飞机', emissionFactor: 0.25 }
];

// 确保ACTIVITY_TYPES存在
window.ACTIVITY_TYPES = window.ACTIVITY_TYPES || {};

// 确保utils对象存在
window.utils = window.utils || {};
window.utils.storage = window.utils.storage || {
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            return null;
        }
    },
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }
};

// 确保计算器类存在
if (!window.CarbonFootprintCalculator) {
    window.CarbonFootprintCalculator = class {
        constructor() {
            this.emissionFactors = window.EMISSION_FACTORS || {};
        }
        calculateEmission(transportType, distance) {
            const factor = this.emissionFactors.transportation?.[transportType] || 0.2;
            return (distance || 0) * factor;
        }
    };
}

// 确保碳足迹计算器实例存在
if (!window.carbonCalculator) {
    window.carbonCalculator = new window.CarbonFootprintCalculator();
}

// 依赖项等待函数
function waitForDependencies() {
    // 检查必要的全局对象是否存在（现在它们至少有默认值）
    if (!window.utils || !window.STORAGE_KEYS || !window.EMISSION_FACTORS) {
        setTimeout(waitForDependencies, 100);
        return;
    }
    
    // 初始化基础功能
    initBaseFunctionality();
}

// 初始化基础功能
function initBaseFunctionality() {
    console.log('初始化基础功能');
    
    // 使用constants.js中的TRANSPORT_OPTIONS，但确保添加emissionFactor
    if (!window.TRANSPORT_OPTIONS) {
        window.TRANSPORT_OPTIONS = [
            { value: 'car_small', label: '小型汽车', emissionFactor: 0.2 },
            { value: 'bus', label: '公交车', emissionFactor: 0.05 },
            { value: 'subway', label: '地铁', emissionFactor: 0.03 },
            { value: 'bike', label: '自行车', emissionFactor: 0 },
            { value: 'walk', label: '步行', emissionFactor: 0 }
        ];
    } else {
        // 确保每个选项都有emissionFactor
        window.TRANSPORT_OPTIONS.forEach(option => {
            if (!option.emissionFactor) {
                option.emissionFactor = window.EMISSION_FACTORS?.transportation?.[option.value] || 0.2;
            }
        });
    }
    
    // 碳足迹计算器类
    window.CarbonFootprintCalculator = class {
        constructor() {
            this.transportationFactors = {};
            const transportOptions = window.TRANSPORT_OPTIONS || [];
            transportOptions.forEach(option => {
                this.transportationFactors[option.value] = option.emissionFactor;
            });
        }
        
        calculateEmission(item) {
            try {
                if (item?.type === 'transportation' && item?.item && typeof item.amount === 'number') {
                    // 优先使用构造时存储的系数，否则从EMISSION_FACTORS获取
                    const factor = this.transportationFactors[item.item] || 
                                 window.EMISSION_FACTORS?.transportation?.[item.item] || 0.2;
                    return item.amount * factor;
                }
                return 0;
            } catch (error) {
                console.error('计算排放出错:', error);
                return 0;
            }
        }
        
        compareEmissions(option1, option2) {
            const emission1 = this.calculateEmission(option1);
            const emission2 = this.calculateEmission(option2);
            
            return {
                option1: { ...option1, emission: emission1 },
                option2: { ...option2, emission: emission2 },
                difference: Math.abs(emission1 - emission2),
                savings: Math.max(emission1, emission2) - Math.min(emission1, emission2),
                lowerOption: emission1 > emission2 ? 'option2' : 'option1'
            };
        }
        
        calculateEquivalentTrees(carbonAmount) {
            // 假设一棵树一年吸收21.77公斤CO2
            return carbonAmount / 21.77;
        }
        
        // 添加获取统计数据的方法，防止在initHomePage中出错
        getStatistics() {
            return {
                totalEmission: 0,
                totalSavings: 0,
                recordCount: 0
            };
        }
    };
}

// 安全初始化用户信息
function initUserInfo() {
    try {
        // 确保STORAGE_KEYS存在
        if (!window.STORAGE_KEYS) {
            console.error('STORAGE_KEYS未定义');
            return;
        }
        
        const userInfo = window.utils?.storage?.get ? 
                         window.utils.storage.get(window.STORAGE_KEYS.USER_INFO) : null;
        
        // 只显示注册提示，不强制要求注册
        if (!userInfo && !isAdminPage()) {
            setTimeout(() => {
                if (window.utils?.showNotification) {
                    window.utils.showNotification('注册以保存您的历史记录和统计数据', 'info');
                }
            }, 1000);
        }
    } catch (error) {
        console.error('初始化用户信息出错:', error);
    }
}

// 确保页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化');
    
    // 启动依赖等待机制，确保所有必要的模块都已加载
    waitForDependencies();
    
    // 同时开始页面初始化流程
    initializePage();
});

// 初始化页面的主要功能
function initializePage() {
    try {
        // 获取当前页面路径
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index.html';
        console.log('当前页面:', pageName);
        
        // 初始化导航 - 即使失败也不影响主要功能
        try {
            if (typeof initNavigation === 'function') {
                initNavigation();
            }
        } catch (navError) {
            console.error('导航初始化出错:', navError);
        }
        
        // 安全创建计算器实例
        try {
            if (!window.carbonCalculator && typeof window.CarbonFootprintCalculator === 'function') {
                window.carbonCalculator = new window.CarbonFootprintCalculator();
            } else if (!window.carbonCalculator) {
                // 创建一个最小化的计算器实例作为备用
                window.carbonCalculator = {
                    calculateEmission: function(item) { return (item?.amount || 0) * 0.2; },
                    compareEmissions: function(option1, option2) {
                        const e1 = this.calculateEmission(option1);
                        const e2 = this.calculateEmission(option2);
                        return { option1: {emission: e1}, option2: {emission: e2}, savings: Math.abs(e1-e2) };
                    }
                };
                console.log('使用备用计算器实例');
            }
        } catch (calcError) {
            console.error('创建计算器实例出错:', calcError);
            // 继续执行，不中断整个流程
        }
        
        // 尝试初始化用户信息
        try {
            if (typeof initUserInfo === 'function') {
                initUserInfo();
            }
        } catch (userInfoError) {
            console.error('用户信息初始化出错:', userInfoError);
            // 静默失败，不影响其他功能
        }
        
        // 根据页面类型初始化相应功能
        try {
            // 支持直接访问根路径和计算器页面
            if (pageName === 'index.html' || pageName === '' || pageName.includes('calculator.html')) {
                console.log('初始化计算器页面');
                if (typeof initCalculatorPage === 'function') {
                    initCalculatorPage();
                } else {
                    console.warn('initCalculatorPage函数未定义，使用基础计算功能');
                    setupBasicCalculator();
                }
            } 
            // 记录页面
            else if (pageName.includes('records.html')) {
                console.log('初始化记录页面');
                if (typeof initRecordsPage === 'function') {
                    initRecordsPage();
                }
            }
            // 排名页面
            else if (pageName.includes('ranking.html')) {
                console.log('初始化排名页面');
                if (typeof initRankingPage === 'function') {
                    initRankingPage();
                }
            }
            // 管理员页面
            else if (pageName.includes('admin.html')) {
                console.log('初始化管理员页面');
                if (typeof initAdminPage === 'function') {
                    initAdminPage();
                }
            }
        } catch (pageInitError) {
            console.error('页面功能初始化出错:', pageInitError);
            if (window.utils?.showNotification) {
                window.utils.showNotification('页面功能初始化出现问题，但基本功能仍可用', 'warning');
            }
            
            // 作为备用，始终尝试初始化计算器功能
            if (!pageName.includes('admin.html')) {
                try {
                    setupBasicCalculator();
                    if (window.utils?.showNotification) {
                        window.utils.showNotification('已启用计算器备用模式', 'info');
                    }
                } catch (calcError) {
                    console.error('备用计算器初始化也失败:', calcError);
                }
            }
        }
        
    } catch (globalError) {
        console.error('全局初始化严重错误:', globalError);
        
        // 最后的备用方案 - 直接初始化一个最简化的计算器
        try {
            setupBasicCalculator();
        } catch (emergencyError) {
            console.error('紧急模式也失败:', emergencyError);
        }
    }
}

// 设置基础计算器功能，不依赖复杂的类和函数
function setupBasicCalculator() {
    console.log('设置基础计算器功能');
    
    // 为计算按钮添加事件监听
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            try {
                // 获取距离输入
                const distance1 = parseFloat(document.getElementById('distance-1')?.value || '10');
                const distance2 = parseFloat(document.getElementById('distance-2')?.value || '10');
                const distance = Math.max(distance1, distance2);
                
                // 简单计算结果
                const emission1 = distance * 0.2; // 假设第一种交通方式
                const emission2 = distance * 0.05; // 假设第二种交通方式
                const savings = emission1 - emission2;
                const trees = savings / 21.77;
                
                // 显示结果
                if (document.getElementById('option1-emission')) {
                    document.getElementById('option1-emission').textContent = emission1.toFixed(2) + ' 公斤';
                }
                if (document.getElementById('option2-emission')) {
                    document.getElementById('option2-emission').textContent = emission2.toFixed(2) + ' 公斤';
                }
                if (document.getElementById('carbon-saved')) {
                    document.getElementById('carbon-saved').textContent = savings.toFixed(2) + ' 公斤';
                }
                if (document.getElementById('trees-saved')) {
                    document.getElementById('trees-saved').textContent = trees.toFixed(2);
                }
                if (document.getElementById('results-section')) {
                    document.getElementById('results-section').style.display = 'block';
                }
                
                // 保存计算结果供后续使用
                window.currentCalculation = {
                    option1: { type: 'transportation', item: 'car', amount: distance, emission: emission1 },
                    option2: { type: 'transportation', item: 'bus', amount: distance, emission: emission2 },
                    savings: savings
                };
                
                // 启用保存按钮
                const saveBtn = document.getElementById('save-btn');
                if (saveBtn) {
                    saveBtn.disabled = false;
                }
                
            } catch (calcError) {
                console.error('基础计算出错:', calcError);
                if (window.utils?.showNotification) {
                    window.utils.showNotification('计算过程中出现错误', 'error');
                }
            }
        });
        
        // 设置默认距离值
        if (document.getElementById('distance-1')) document.getElementById('distance-1').value = '10';
        if (document.getElementById('distance-2')) document.getElementById('distance-2').value = '10';
    }
    
    // 设置保存按钮事件
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.disabled = true; // 默认禁用
        saveBtn.addEventListener('click', function() {
            if (typeof handleSaveRecord === 'function') {
                handleSaveRecord();
            }
        });
    }
}

// 初始化导航
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

// 初始化用户信息 - 简化版，不再强制要求注册
function initUserInfo() {
    const userInfo = utils.storage.get(STORAGE_KEYS.USER_INFO);
    
    // 只显示注册提示，不强制要求注册
    if (!userInfo && !isAdminPage()) {
        // 可选：显示一个小提示而不是强制模态框
        setTimeout(() => {
            utils.showNotification('注册以保存您的历史记录和统计数据', 'info');
        }, 1000);
    }
}

// 检查是否是管理员页面
function isAdminPage() {
    return window.location.pathname.includes('admin.html');
}

// 重定向到独立的注册页面
function showUserRegistrationForm() {
    // 直接重定向到专用的注册页面
    window.location.href = 'register.html';
}

// 处理用户注册（保留此函数但重定向到注册页面）
function handleUserRegistration() {
    // 重定向到专用的注册页面
    window.location.href = 'register.html';
}

// 更新班级排名数据
function updateClassRanking(userInfo) {
    let ranking = utils.storage.get(STORAGE_KEYS.CLASS_RANKING) || [];
    
    // 检查用户是否已存在
    const existingUserIndex = ranking.findIndex(user => user.studentId === userInfo.studentId);
    
    if (existingUserIndex >= 0) {
        // 更新现有用户
        ranking[existingUserIndex].name = userInfo.name;
        ranking[existingUserIndex].lastUpdated = new Date().toISOString();
    } else {
        // 添加新用户
        ranking.push({
            name: userInfo.name,
            studentId: userInfo.studentId,
            totalCarbon: 0,
            lastUpdated: new Date().toISOString()
        });
    }
    
    // 保存更新后的排名
    utils.storage.set(STORAGE_KEYS.CLASS_RANKING, ranking);
}

// 初始化首页
function initHomePage() {
    console.log('首页初始化');
    // 首页可以加载一些统计数据显示
    const stats = window.carbonCalculator.getStatistics();
    
    // 如果有统计数据展示区域，可以在这里更新
    const totalEmissionElement = document.getElementById('total-emission');
    if (totalEmissionElement) {
        totalEmissionElement.textContent = utils.formatCarbonEmission(stats.totalEmission);
    }
}

// 初始化计算器页面 - 增强错误处理和稳定性
function initCalculatorPage() {
    console.log('计算器页面初始化');
    
    try {
        // 确保window.carbonCalculator存在
        if (!window.carbonCalculator) {
            window.carbonCalculator = new CarbonFootprintCalculator();
            console.log('创建了新的碳足迹计算器实例');
        }
        
        // 初始化交通方式选择器
        try {
            const transportSelect1 = document.getElementById('transport-type-1');
            const transportSelect2 = document.getElementById('transport-type-2');
            
            if (transportSelect1 && transportSelect2) {
                const transportOptions = window.TRANSPORT_OPTIONS || [
                    { value: 'car_small', label: '小型汽车' },
                    { value: 'bus', label: '公交车' },
                    { value: 'subway', label: '地铁' },
                    { value: 'bike', label: '自行车' },
                    { value: 'walk', label: '步行' }
                ];
                
                // 清空现有选项
                transportSelect1.innerHTML = '';
                transportSelect2.innerHTML = '';
                
                transportOptions.forEach(option => {
                    try {
                        const opt1 = document.createElement('option');
                        const opt2 = document.createElement('option');
                        
                        opt1.value = option.value;
                        opt1.textContent = option.label;
                        opt2.value = option.value;
                        opt2.textContent = option.label;
                        
                        transportSelect1.appendChild(opt1);
                        transportSelect2.appendChild(opt2);
                    } catch (optionError) {
                        console.error('添加选项出错:', optionError);
                    }
                });
                
                // 设置默认值
                transportSelect1.value = 'car_small';
                transportSelect2.value = 'bus';
            }
        } catch (selectError) {
            console.error('初始化选择器出错:', selectError);
        }
        
        // 初始化计算按钮
        const calculateBtn = document.getElementById('calculate-btn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', handleCalculate);
            // 添加回车键支持
            document.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !document.activeElement.closest('.modal-overlay')) {
                    handleCalculate();
                }
            });
        }
        
        // 初始化保存按钮
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', handleSaveRecord);
            // 默认禁用保存按钮
            saveBtn.disabled = true;
        }
        
        // 初始化距离输入框
        const distance1 = document.getElementById('distance-1');
        const distance2 = document.getElementById('distance-2');
        if (distance1) distance1.value = '10';
        if (distance2) distance2.value = '10';
        
    } catch (error) {
        console.error('初始化计算器页面出错:', error);
        utils.showNotification('计算器初始化失败，请刷新页面重试', 'error');
    }
}

// 处理计算逻辑 - 增强错误处理和用户体验
function handleCalculate() {
    try {
        const distance1 = parseFloat(document.getElementById('distance-1')?.value || '0');
        const distance2 = parseFloat(document.getElementById('distance-2')?.value || '0');
        const transportType1 = document.getElementById('transport-type-1')?.value || 'car_small';
        const transportType2 = document.getElementById('transport-type-2')?.value || 'bus';
        
        // 验证输入
        if (isNaN(distance1) || distance1 <= 0 || isNaN(distance2) || distance2 <= 0) {
            utils.showNotification('请输入有效的距离值（大于0）', 'error');
            return;
        }
        
        // 确保两个选项使用相同的距离
        const distance = Math.max(distance1, distance2);
        
        // 确保计算器存在
        if (!window.carbonCalculator) {
            window.carbonCalculator = new CarbonFootprintCalculator();
        }
        
        // 计算碳排放
        const calculator = window.carbonCalculator;
        let comparison;
        
        try {
            comparison = calculator.compareEmissions(
                { type: 'transportation', item: transportType1, amount: distance },
                { type: 'transportation', item: transportType2, amount: distance }
            );
        } catch (calcError) {
            console.error('计算出错:', calcError);
            // 如果计算出错，使用模拟数据
            comparison = {
                option1: { type: 'transportation', item: transportType1, amount: distance, emission: distance * 0.2 },
                option2: { type: 'transportation', item: transportType2, amount: distance, emission: distance * 0.05 },
                difference: distance * 0.15,
                savings: distance * 0.15,
                lowerOption: 'option2'
            };
        }
        
        // 显示结果
        displayComparisonResults(comparison);
        
        // 启用保存按钮
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.disabled = false;
        }
        
        // 保存当前计算结果到临时变量，以便后续保存
        window.currentCalculation = comparison;
        
    } catch (error) {
        console.error('处理计算时出错:', error);
        utils.showNotification('计算失败，请重试', 'error');
    }
}

// 显示比较结果 - 增强错误处理
function displayComparisonResults(comparison) {
    try {
        // 获取交通方式标签
        const getTransportLabel = (type) => {
            try {
                const transportOptions = window.TRANSPORT_OPTIONS || [
                    { value: 'car_small', label: '小型汽车' },
                    { value: 'bus', label: '公交车' },
                    { value: 'subway', label: '地铁' },
                    { value: 'bike', label: '自行车' },
                    { value: 'walk', label: '步行' }
                ];
                const option = transportOptions.find(opt => opt.value === type);
                return option ? option.label : type || '未知交通方式';
            } catch (e) {
                return type || '未知交通方式';
            }
        };
        
        // 安全获取DOM元素
        const option1NameEl = document.getElementById('option1-name');
        const option2NameEl = document.getElementById('option2-name');
        const option1EmissionEl = document.getElementById('option1-emission');
        const option2EmissionEl = document.getElementById('option2-emission');
        const carbonSavedEl = document.getElementById('carbon-saved');
        const treesSavedEl = document.getElementById('trees-saved');
        const resultsSectionEl = document.getElementById('results-section');
        
        // 更新结果显示
        if (option1NameEl) option1NameEl.textContent = getTransportLabel(comparison?.option1?.item);
        if (option2NameEl) option2NameEl.textContent = getTransportLabel(comparison?.option2?.item);
        
        if (option1EmissionEl) option1EmissionEl.textContent = utils.formatCarbonEmission(comparison?.option1?.emission || 0);
        if (option2EmissionEl) option2EmissionEl.textContent = utils.formatCarbonEmission(comparison?.option2?.emission || 0);
        if (carbonSavedEl) carbonSavedEl.textContent = utils.formatCarbonEmission(comparison?.savings || 0);
        
        // 更新环保建议
        try {
            updateCarbonReductionTips(comparison);
        } catch (tipsError) {
            console.error('更新环保建议出错:', tipsError);
        }
        
        // 更新树的等效数量
        try {
            let treesSaved = 0;
            if (window.carbonCalculator && comparison?.savings) {
                treesSaved = window.carbonCalculator.calculateEquivalentTrees(comparison.savings);
            } else {
                // 使用默认值计算
                treesSaved = (comparison?.savings || 0) / 21.77; // 假设一棵树一年吸收21.77公斤CO2
            }
            if (treesSavedEl) treesSavedEl.textContent = treesSaved.toFixed(2);
        } catch (treesError) {
            console.error('计算树的数量出错:', treesError);
            if (treesSavedEl) treesSavedEl.textContent = '0.00';
        }
        
        // 显示结果区域
        if (resultsSectionEl) resultsSectionEl.style.display = 'block';
        
    } catch (error) {
        console.error('显示比较结果出错:', error);
        utils.showNotification('显示结果时出错', 'error');
    }
}

// 更新碳减排建议 - 增强错误处理
function updateCarbonReductionTips(comparison) {
    try {
        const tipsContainer = document.getElementById('carbon-reduction-tips');
        
        if (!tipsContainer) {
            console.warn('未找到碳减排建议容器');
            return;
        }
        
        if (!comparison) {
            tipsContainer.innerHTML = '<div class="tip">暂无建议数据</div>';
            return;
        }
        
        // 获取交通方式标签
        const getTransportLabel = (type) => {
            try {
                const transportOptions = window.TRANSPORT_OPTIONS || [
                    { value: 'car_small', label: '小型汽车' },
                    { value: 'bus', label: '公交车' },
                    { value: 'subway', label: '地铁' },
                    { value: 'bike', label: '自行车' },
                    { value: 'walk', label: '步行' }
                ];
                const option = transportOptions.find(opt => opt.value === type);
                return option ? option.label : type || '未知交通方式';
            } catch (e) {
                return type || '未知交通方式';
            }
        };
        
        // 安全获取数据
        const option1Item = comparison?.option1?.item || '未知交通方式1';
        const option2Item = comparison?.option2?.item || '未知交通方式2';
        const savings = comparison?.savings || 0;
        const option1Amount = comparison?.option1?.amount || 1;
        
        // 简单的建议逻辑
        try {
            if (comparison.lowerOption === 'option2') {
                tipsContainer.innerHTML = `
                    <div class="tip">
                        <strong>环保建议：</strong>使用${getTransportLabel(option2Item)}相比${getTransportLabel(option1Item)}可以显著减少碳排放。
                    </div>
                    <div class="tip">
                        每100公里可以减少约${(savings * 100 / Math.max(option1Amount, 1)).toFixed(2)}公斤的二氧化碳排放。
                    </div>
                `;
            } else {
                tipsContainer.innerHTML = `
                    <div class="tip">
                        <strong>环保建议：</strong>使用${getTransportLabel(option1Item)}相比${getTransportLabel(option2Item)}可以显著减少碳排放。
                    </div>
                    <div class="tip">
                        每100公里可以减少约${(savings * 100 / Math.max(option1Amount, 1)).toFixed(2)}公斤的二氧化碳排放。
                    </div>
                `;
            }
        } catch (htmlError) {
            console.error('生成建议HTML出错:', htmlError);
            tipsContainer.innerHTML = '<div class="tip">无法生成环保建议</div>';
        }
        
    } catch (error) {
        console.error('更新碳减排建议出错:', error);
    }
}

// 处理保存记录 - 增强稳定性和匿名支持
function handleSaveRecord() {
    try {
        // 检查是否有计算结果
        const currentCalculation = window.currentCalculation;
        if (!currentCalculation) {
            utils.showNotification('没有可保存的计算结果，请先进行计算', 'warning');
            return;
        }
        
        // 安全获取用户信息，支持匿名模式
        let userInfo = { 
            id: 'anon_' + Date.now(),
            name: '匿名用户',
            isAnonymous: true
        };
        
        let isAnonymous = true;
        
        // 尝试获取用户信息但不强制要求
        try {
            userInfo = utils.storage.get(STORAGE_KEYS.USER_INFO) || userInfo;
            isAnonymous = !userInfo || userInfo.isAnonymous;
        } catch (userInfoError) {
            console.warn('获取用户信息出错，使用匿名模式:', userInfoError);
        }
        
        // 创建记录对象 - 确保所有必要字段都存在
        const record = {
            id: utils.generateId ? utils.generateId() : Date.now().toString(),
            userId: isAnonymous ? 'anonymous' : (userInfo.name || 'unknown'),
            userName: isAnonymous ? '匿名用户' : (userInfo.name || '未知用户'),
            studentId: isAnonymous ? '' : (userInfo.studentId || ''),
            activityType: 'transportation',
            option1: {
                type: currentCalculation?.option1?.type || 'transportation',
                item: currentCalculation?.option1?.item || 'unknown',
                amount: currentCalculation?.option1?.amount || 0,
                emission: currentCalculation?.option1?.emission || 0
            },
            option2: {
                type: currentCalculation?.option2?.type || 'transportation',
                item: currentCalculation?.option2?.item || 'unknown',
                amount: currentCalculation?.option2?.amount || 0,
                emission: currentCalculation?.option2?.emission || 0
            },
            savings: currentCalculation?.savings || 0,
            totalEmission: Math.max(
                currentCalculation?.option1?.emission || 0,
                currentCalculation?.option2?.emission || 0
            ),
            notes: document.getElementById('record-notes')?.value || '',
            timestamp: new Date().toISOString(),
            isAnonymous: isAnonymous
        };
        
        // 尝试使用carbonCalculator保存
        try {
            if (window.carbonCalculator && typeof window.carbonCalculator.saveRecord === 'function') {
                window.carbonCalculator.saveRecord(record)
                    .then(savedRecord => {
                        // 如果有用户信息，更新用户总碳排放量
                        if (userInfo && !isAnonymous) {
                            try {
                                userInfo.totalCarbon = (userInfo.totalCarbon || 0) + record.totalEmission;
                                userInfo.lastUpdated = new Date().toISOString();
                                utils.storage.set(STORAGE_KEYS.USER_INFO, userInfo);
                                
                                // 更新班级排名数据
                                if (typeof updateClassRanking === 'function') {
                                    updateClassRanking(userInfo);
                                }
                            } catch (updateError) {
                                console.error('更新用户信息出错:', updateError);
                                // 静默失败，不影响主流程
                            }
                        }
                        
                        utils.showNotification(isAnonymous ? '匿名记录已保存' : '记录已保存', 'success');
                        // 重置表单
                        if (document.getElementById('record-notes')) document.getElementById('record-notes').value = '';
                        if (document.getElementById('save-btn')) document.getElementById('save-btn').disabled = true;
                    })
                    .catch(error => {
                        console.error('保存记录失败，尝试本地存储:', error);
                        // 尝试使用localStorage作为备用
                        saveToLocalStorage(record);
                    });
            } else {
                // 如果carbonCalculator不可用，直接使用localStorage
                console.warn('carbonCalculator不可用，使用本地存储');
                saveToLocalStorage(record);
            }
        } catch (error) {
            console.error('保存过程出错，尝试备用方案:', error);
            saveToLocalStorage(record);
        }
        
        // 辅助函数：保存到localStorage作为备用
        function saveToLocalStorage(recordToSave) {
            try {
                let records = [];
                // 获取现有记录
                try {
                    const storedRecords = localStorage.getItem('carbonRecords');
                    if (storedRecords) {
                        records = JSON.parse(storedRecords);
                        if (!Array.isArray(records)) records = [];
                    }
                } catch (parseError) {
                    console.error('解析现有记录出错:', parseError);
                    records = [];
                }
                
                records.push(recordToSave);
                
                // 限制记录数量，避免localStorage溢出
                if (records.length > 1000) {
                    records = records.slice(-1000);
                    console.warn('记录数量过多，已限制为最近1000条');
                }
                
                localStorage.setItem('carbonRecords', JSON.stringify(records));
                utils.showNotification(isAnonymous ? '匿名记录已保存到本地' : '记录已保存到本地', 'success');
                
                // 重置表单
                if (document.getElementById('record-notes')) document.getElementById('record-notes').value = '';
                if (document.getElementById('save-btn')) document.getElementById('save-btn').disabled = true;
                
                if (isAnonymous) {
                    setTimeout(() => {
                        utils.showNotification('提示：匿名记录将存储在本地浏览器中', 'info');
                    }, 1500);
                }
            } catch (saveError) {
                console.error('本地存储也失败:', saveError);
                utils.showNotification('保存记录失败，请检查浏览器存储权限', 'error');
            }
        }
        
    } catch (error) {
        console.error('处理保存记录时发生未预期的错误:', error);
        utils.showNotification('保存操作遇到问题，请重试', 'error');
    }
}

// 初始化记录页面 - 修改为显示所有记录
function initRecordsPage() {
    console.log('记录页面初始化');
    
    // 加载记录，不依赖用户登录状态
    loadUserRecords();
}

// 加载用户记录 - 改进错误处理
function loadUserRecords() {
    try {
        const records = window.carbonCalculator.getUserRecords();
        const recordsTableBody = document.getElementById('records-table-body');
        
        if (recordsTableBody) {
            // 清空表格
            recordsTableBody.innerHTML = '';
            
            if (records.length === 0) {
                // 显示空记录提示
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `
                    <td colspan="7" class="empty-records">
                        暂无记录，请先进行碳足迹计算
                    </td>
                `;
                recordsTableBody.appendChild(emptyRow);
            } else {
                // 填充记录数据
                records.forEach(record => {
                    const row = document.createElement('tr');
                    
                    try {
                        // 获取交通方式标签
                        const getTransportLabel = (type) => {
                            const option = (window.TRANSPORT_OPTIONS || []).find(opt => opt.value === type);
                            return option ? option.label : type || '未知';
                        };
                        
                        row.innerHTML = `
                            <td>${utils.formatDate(record.timestamp || new Date(), 'YYYY-MM-DD HH:mm')}</td>
                            <td>${record.studentId || '-'}</td>
                            <td>${getTransportLabel(record.option1?.item)}</td>
                            <td>${getTransportLabel(record.option2?.item)}</td>
                            <td>${utils.formatCarbonEmission(record.totalEmission || 0)}</td>
                            <td>${utils.formatCarbonEmission(record.savings || 0)}</td>
                            <td>${record.notes || '-'}</td>
                        `;
                    } catch (rowError) {
                        console.error('处理记录行出错:', rowError);
                        row.innerHTML = `<td colspan="7">数据显示错误</td>`;
                    }
                    
                    recordsTableBody.appendChild(row);
                });
            }
        }
        
        // 更新统计信息
        try {
            const stats = window.carbonCalculator.getStatistics();
            const statsTotalRecords = document.getElementById('stats-total-records');
            const statsTotalEmission = document.getElementById('stats-total-emission');
            const statsAverageEmission = document.getElementById('stats-average-emission');
            
            if (statsTotalRecords) statsTotalRecords.textContent = stats.totalRecords || 0;
            if (statsTotalEmission) statsTotalEmission.textContent = utils.formatCarbonEmission(stats.totalEmission || 0);
            if (statsAverageEmission) statsAverageEmission.textContent = utils.formatCarbonEmission(stats.averageEmission || 0);
        } catch (statsError) {
            console.error('更新统计信息出错:', statsError);
        }
    } catch (error) {
        console.error('加载记录出错:', error);
        const recordsTableBody = document.getElementById('records-table-body');
        if (recordsTableBody) {
            recordsTableBody.innerHTML = '<tr><td colspan="7">加载记录时出错</td></tr>';
        }
    }
}

// 初始化排名页面 - 确保不依赖用户登录状态
function initRankingPage() {
    console.log('排名页面初始化');
    
    try {
        // 加载班级排名，确保即使没有用户也能显示
        loadClassRanking();
    } catch (error) {
        console.error('初始化排名页面出错:', error);
        // 如果出错，显示友好提示而不是崩溃
        const rankingContainer = document.getElementById('ranking-list');
        if (rankingContainer) {
            rankingContainer.innerHTML = '<p class="empty-records">加载排名数据中...</p>';
        }
    }
}

// 加载班级排名 - 增强错误处理和稳定性
function loadClassRanking() {
    try {
        let ranking = [];
        
        // 尝试获取排名数据，如果失败则使用模拟数据
        try {
            ranking = window.carbonCalculator?.getClassRanking() || [];
            
            // 如果没有数据，添加一些模拟用户数据
            if (!ranking || ranking.length === 0) {
                ranking = [
                    { name: '张三', studentId: '2025001', totalCarbon: 150, lastUpdated: new Date().toISOString() },
                    { name: '李四', studentId: '2025002', totalCarbon: 200, lastUpdated: new Date().toISOString() },
                    { name: '王五', studentId: '2025003', totalCarbon: 180, lastUpdated: new Date().toISOString() }
                ];
                // 保存模拟数据到本地存储
                utils.storage.set(STORAGE_KEYS.CLASS_RANKING, ranking);
            }
        } catch (getRankingError) {
            console.error('获取排名数据出错，使用模拟数据:', getRankingError);
            // 使用硬编码的模拟数据
            ranking = [
                { name: '赵六', studentId: '2025004', totalCarbon: 120, lastUpdated: new Date().toISOString() },
                { name: '钱七', studentId: '2025005', totalCarbon: 250, lastUpdated: new Date().toISOString() }
            ];
        }
        
        const rankingContainer = document.getElementById('ranking-list');
        
        if (rankingContainer) {
            // 清空容器
            rankingContainer.innerHTML = '';
            
            // 确保ranking是数组
            if (!Array.isArray(ranking)) {
                rankingContainer.innerHTML = '<p class="empty-records">数据格式错误</p>';
                return;
            }
            
            if (ranking.length === 0) {
                rankingContainer.innerHTML = '<p class="empty-records">暂无排名数据</p>';
            } else {
                // 填充排名数据
                ranking.forEach((user, index) => {
                    try {
                        const rankItem = document.createElement('div');
                        rankItem.className = `rank-item ${index < 3 ? 'rank-top3' : ''}`;
                        
                        rankItem.innerHTML = `
                            <div class="rank-number">${index + 1}</div>
                            <div class="rank-user">
                                <div class="user-name">${user?.name || '未知用户'}</div>
                                <div class="user-id">${user?.studentId || '---'}</div>
                            </div>
                            <div class="rank-score">${utils.formatCarbonEmission(user?.totalCarbon || 0)}</div>
                        `;
                        
                        rankingContainer.appendChild(rankItem);
                    } catch (itemError) {
                        console.error('处理排名项出错:', itemError);
                    }
                });
            }
        }
        
        // 更新班级统计
        try {
            let stats;
            try {
                stats = window.carbonCalculator?.getStatistics() || {};
            } catch (statsError) {
                // 使用默认统计数据
                stats = { classSize: ranking.length, classAverageEmission: 0 };
            }
            
            const classStatsSize = document.getElementById('class-stats-size');
            const classStatsAverage = document.getElementById('class-stats-average');
            
            if (classStatsSize) classStatsSize.textContent = stats.classSize || ranking.length;
            if (classStatsAverage) classStatsAverage.textContent = utils.formatCarbonEmission(stats.classAverageEmission || 0);
        } catch (updateStatsError) {
            console.error('更新班级统计出错:', updateStatsError);
        }
    } catch (error) {
        console.error('加载班级排名出错:', error);
        const rankingContainer = document.getElementById('ranking-list');
        if (rankingContainer) {
            rankingContainer.innerHTML = '<p class="empty-records">加载排名时出错</p>';
        }
    }
}

  // 初始化管理员页面
  function initAdminPage() {
    console.log('管理员页面初始化');
    
    // 检查是否已登录
    const isLoggedIn = utils.storage.get(STORAGE_KEYS.ADMIN_LOGGED_IN);
    
    if (isLoggedIn) {
        showAdminDashboard();
    } else {
        showAdminLogin();
    }
    
    // 确保登录按钮事件被正确绑定
    const loginBtn = document.getElementById('admin-login-btn');
    if (loginBtn) {
        // 移除可能存在的重复事件监听器
        loginBtn.removeEventListener('click', handleAdminLogin);
        // 添加事件监听器
        loginBtn.addEventListener('click', handleAdminLogin);
        
        // 额外添加回车键登录功能
        const usernameInput = document.getElementById('admin-username');
        const passwordInput = document.getElementById('admin-password');
        
        if (usernameInput) {
            usernameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleAdminLogin();
                }
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleAdminLogin();
                }
            });
        }
    }
}

// 注销用户登录
function logoutUser() {
    utils.storage.remove(STORAGE_KEYS.USER_LOGGED_IN);
    utils.storage.remove(STORAGE_KEYS.USER_INFO);
    utils.showNotification('已成功注销', 'info');
    // 刷新页面回到首页
    window.location.href = 'index.html';
}

// 显示管理员登录界面
function showAdminLogin() {
    const loginContainer = document.getElementById('admin-login');
    const dashboardContainer = document.getElementById('admin-dashboard');
    
    if (loginContainer) loginContainer.style.display = 'block';
    if (dashboardContainer) dashboardContainer.style.display = 'none';
    
    // 隐藏错误信息
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    // 清空输入框
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');
    
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

// 处理管理员登录
function handleAdminLogin() {
    console.log('尝试管理员登录...');
    
    const username = document.getElementById('admin-username')?.value;
    const password = document.getElementById('admin-password')?.value;
    const errorElement = document.getElementById('login-error');
    
    // 检查输入是否为空
    if (!username || !password) {
        if (errorElement) {
            errorElement.textContent = '请输入用户名和密码';
            errorElement.style.display = 'block';
        }
        return;
    }
    
    // 检查管理员凭证是否存在
    if (!window.ADMIN_CREDENTIALS) {
        console.error('管理员凭证未定义');
        if (errorElement) {
            errorElement.textContent = '系统错误，请稍后重试';
            errorElement.style.display = 'block';
        }
        return;
    }
    
    console.log('验证凭证:', username, 'vs', window.ADMIN_CREDENTIALS.username);
    
    // 验证凭证
    if (username === window.ADMIN_CREDENTIALS.username && password === window.ADMIN_CREDENTIALS.password) {
        // 登录成功
        utils.storage.set(STORAGE_KEYS.ADMIN_LOGGED_IN, true);
        console.log('登录成功，跳转到仪表盘');
        utils.showNotification('登录成功', 'success');
        // 强制重新加载仪表盘，确保所有元素正确显示
        setTimeout(() => {
            showAdminDashboard();
        }, 500);
    } else {
        // 登录失败
        console.log('登录失败：凭证错误');
        if (errorElement) {
            errorElement.textContent = '用户名或密码错误';
            errorElement.style.display = 'block';
        }
    }
}

// 显示管理员仪表盘
function showAdminDashboard() {
    const loginContainer = document.getElementById('admin-login');
    const dashboardContainer = document.getElementById('admin-dashboard');
    
    if (loginContainer) loginContainer.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'block';
    
    // 初始化管理员功能
    initAdminDashboard();
    
    // 初始化注销按钮
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
    }
}

// 初始化管理员仪表盘
function initAdminDashboard() {
    // 加载统计数据
    const stats = window.carbonCalculator.getStatistics();
    
    // 更新统计卡片
    document.getElementById('stat-total-users').textContent = stats.classSize;
    document.getElementById('stat-total-records').textContent = stats.totalRecords;
    document.getElementById('stat-total-emission').textContent = utils.formatCarbonEmission(stats.totalEmission);
    document.getElementById('stat-average-emission').textContent = utils.formatCarbonEmission(stats.classAverageEmission);
    
    // 加载所有用户数据
    loadAllUserData();
    
    // 初始化导出按钮
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportData);
    }
}

// 加载所有用户数据
function loadAllUserData() {
    const ranking = window.carbonCalculator.getClassRanking();
    const usersTableBody = document.getElementById('users-table-body');
    
    if (usersTableBody) {
        // 清空表格
        usersTableBody.innerHTML = '';
        
        // 填充用户数据
        ranking.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.name}</td>
                <td>${user.studentId}</td>
                <td>${utils.formatCarbonEmission(user.totalCarbon || 0)}</td>
                <td>${utils.formatDate(user.lastUpdated, 'YYYY-MM-DD HH:mm')}</td>
            `;
            usersTableBody.appendChild(row);
        });
    }
}

// 处理数据导出
function handleExportData() {
    const ranking = window.carbonCalculator.getClassRanking();
    
    // 定义虚拟人物列表，用于过滤
    const virtualNames = ['张三', '李四', '王五', '赵六', '测试', 'demo', 'test'];
    
    // 过滤掉虚拟人物数据，只保留真实用户数据
    const realUsers = ranking.filter(user => {
        // 过滤条件：1. 不是虚拟姓名 2. 有有效的学号
        const isVirtualName = virtualNames.some(virtualName => 
            user.name && user.name.includes(virtualName)
        );
        const hasValidStudentId = user.studentId && user.studentId.trim().length >= 8;
        
        return !isVirtualName && hasValidStudentId;
    });
    
    // 对真实用户重新排序
    realUsers.sort((a, b) => (a.totalCarbon || 0) - (b.totalCarbon || 0));
    
    // 准备导出数据
    const exportData = realUsers.map((user, index) => ({
        '排名': index + 1,
        '姓名': user.name || '',
        '学号': user.studentId || '',
        '总碳排放量(kg)': (user.totalCarbon || 0).toFixed(2),
        '最后更新时间': utils.formatDate(user.lastUpdated || new Date())
    }));
    
    // 导出为CSV
    const filename = `碳足迹数据_${utils.formatDate(new Date(), 'YYYYMMDD_HHmm')}.csv`;
    utils.exportToCSV(exportData, filename);
    
    utils.showNotification(`数据导出成功，共导出 ${exportData.length} 条真实用户数据`, 'success');
}

// 处理管理员注销
function handleAdminLogout() {
    utils.storage.remove(STORAGE_KEYS.ADMIN_LOGGED_IN);
    utils.showNotification('已注销', 'info');
    showAdminLogin();
}

// 全局错误处理
window.addEventListener('error', function(error) {
    console.error('发生错误:', error);
    // 可以在这里添加错误日志记录
});

// 页面卸载前的处理
window.addEventListener('beforeunload', function() {
    // 可以在这里保存页面状态或执行清理操作
});