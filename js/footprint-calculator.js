// Carbon Footprint Calculator - 碳足迹计算核心功能

class CarbonFootprintCalculator {
    constructor() {
        // 定义排放因子（每单位活动的碳排放量，单位：kg CO₂e）
        this.emissionFactors = {
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
                train: 0.035,
                plane_domestic: 0.255,
                plane_international: 0.195
            },
            energy: {
                electricity: 0.583,
                natural_gas: 2.2,
                coal: 3.5,
                oil: 2.8
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
        
        // 初始化用户记录和统计数据
        this.userRecords = [];
        this.userTotalCarbon = 0;
    }
    
    // 计算单个活动的碳排放量
    calculateActivityEmission(activityType, activity, amount) {
        try {
            // 获取对应活动类型的排放因子
            const factor = this.emissionFactors[activityType] && this.emissionFactors[activityType][activity];
            if (typeof factor !== 'number') {
                throw new Error(`未找到活动类型 ${activityType} 的排放因子: ${activity}`);
            }
            
            // 计算排放量 = 活动量 * 排放因子
            return amount * factor;
        } catch (error) {
            console.error('计算活动排放量时出错:', error);
            // 返回一个默认值以避免计算中断
            return 0;
        }
    }
    
    // 比较两个选项的碳排放量
    compareEmissions(option1, option2) {
        try {
            // 计算两个选项的碳排放量
            const emission1 = this.calculateActivityEmission(option1.type, option1.item, option1.amount);
            const emission2 = this.calculateActivityEmission(option2.type, option2.item, option2.amount);
            
            // 返回比较结果
            return {
                option1: { ...option1, emission: emission1 },
                option2: { ...option2, emission: emission2 },
                difference: Math.abs(emission1 - emission2),
                savings: Math.max(emission1, emission2) - Math.min(emission1, emission2),
                lowerOption: emission1 < emission2 ? 'option1' : 'option2'
            };
        } catch (error) {
            console.error('比较碳排放量时出错:', error);
            // 返回默认结果以避免计算中断
            return {
                option1: { ...option1, emission: 0 },
                option2: { ...option2, emission: 0 },
                difference: 0,
                savings: 0,
                lowerOption: 'option1'
            };
        }
    }
    
    // 获取排放系数信息
    getEmissionFactors(category) {
        return this.emissionFactors[category] || {};
    }
    
    // 获取单位信息
    getUnit(type) {
        const unitMap = {
            transportation: 'kg/km',
            energy: 'kg/kWh',
            diet: 'kg/kg'
        };
        return unitMap[type] || 'kg';
    }
    
    // 获取活动描述
    getActivityDescription(type, activity) {
        const descriptions = {
            transportation: {
                walking: '步行是零碳排放的出行方式',
                cycling: '骑自行车是环保的出行选择',
                bus: '乘坐公交车比私家车更环保',
                subway: '地铁是城市中最环保的公共交通之一',
                taxi: '出租车碳排放较高',
                car_small: '小型汽车的碳排放量相对较低',
                car_medium: '中型汽车的碳排放量中等',
                car_large: '大型汽车的碳排放量较高',
                motorcycle: '摩托车的碳排放量相对较高',
                train: '乘坐火车比飞机更环保',
                plane_domestic: '国内航班的碳排放量较高',
                plane_international: '国际航班的碳排放量较高'
            },
            diet: {
                beef: '牛肉的碳足迹非常高，主要来自肠道发酵和饲料生产',
                pork: '猪肉的碳足迹较高',
                chicken: '鸡肉的碳足迹比牛肉和猪肉低',
                eggs: '鸡蛋的碳足迹相对较低',
                milk: '牛奶的碳足迹中等',
                rice: '大米生产需要大量水资源和能源',
                wheat: '小麦的碳足迹相对较低',
                vegetables: '蔬菜的碳足迹通常很低',
                fruits: '水果的碳足迹通常很低',
                grains: '谷物的碳足迹相对较低'
            }
        };
        return descriptions[type] && descriptions[type][activity] || '未知活动';
    }
    
    // 获取碳减排建议
    getCarbonReductionTips(carbonAmount, activityType) {
        const tips = [];
        
        // 根据碳排放量提供不同级别的建议
        if (carbonAmount > 10) {
            tips.push('您的选择产生了较高的碳排放量，考虑以下建议:');
        } else if (carbonAmount > 2) {
            tips.push('您的选择产生了中等水平的碳排放量，以下是一些优化建议:');
        } else {
            tips.push('您的选择已经相对环保，继续保持！');
        }
        
        // 根据活动类型提供具体建议
        if (activityType === 'transportation') {
            tips.push('尽可能选择步行或骑自行车进行短途出行');
            tips.push('使用公共交通工具，如公交车或地铁');
            tips.push('如果必须开车，考虑拼车或选择小型汽车');
            tips.push('对于长途旅行，考虑乘坐火车而非飞机');
        } else if (activityType === 'diet') {
            tips.push('减少红肉（特别是牛肉）的消费频率');
            tips.push('增加植物性食品在饮食中的比例');
            tips.push('选择本地生产的食物，减少运输碳足迹');
            tips.push('减少食物浪费，合理规划采购和烹饪');
        } else {
            tips.push('选择更环保的选项可以显著减少碳排放');
            tips.push('考虑活动的频率和规模，减少不必要的消费');
        }
        
        return tips;
    }
    
    // 计算等效需要种植的树木数量（假设一棵树一年吸收21.77公斤CO2）
    calculateEquivalentTrees(carbonAmount) {
        const treeAbsorptionRate = 21.77; // 一棵树一年吸收的CO2量（kg）
        return carbonAmount / treeAbsorptionRate;
    }
    
    // 初始化计算器
    init() {
        console.log('碳足迹计算器初始化完成');
        // 绑定计算按钮事件
        this.bindCalculateButton();
    }
    
    // 绑定计算按钮事件
    bindCalculateButton() {
        try {
            const calculateBtn = document.getElementById('calculate-btn');
            if (calculateBtn) {
                calculateBtn.addEventListener('click', () => {
                    console.log('计算按钮被点击');
                    // 这里通常会调用页面上的计算方法
                    // 具体实现由页面逻辑处理
                });
            }
        } catch (error) {
            console.error('绑定计算按钮事件时出错:', error);
        }
    }
    
    // 保存记录
    saveRecord(record) {
        return new Promise((resolve, reject) => {
            try {
                // 获取存储键
                const STORAGE_KEYS = window.STORAGE_KEYS || {};
                const RECORDS_KEY = STORAGE_KEYS.USER_RECORDS || 'carbon_footprint_records';
                
                // 获取现有记录
                const utils = window.utils || {};
                const existingRecords = utils.storage?.get(RECORDS_KEY) || [];
                
                // 确保记录有ID和时间戳
                if (!record.id) {
                    record.id = utils.generateId ? utils.generateId() : Date.now().toString();
                }
                if (!record.timestamp) {
                    record.timestamp = new Date().toISOString();
                }
                
                // 添加新记录
                existingRecords.unshift(record);
                
                // 限制记录数量
                if (existingRecords.length > 100) {
                    existingRecords.splice(100);
                }
                
                // 保存回存储
                if (utils.storage?.set(RECORDS_KEY, existingRecords)) {
                    // 更新用户总碳足迹
                    this.updateUserTotalCarbon();
                    resolve(record);
                } else {
                    reject(new Error('保存记录失败'));
                }
            } catch (error) {
                console.error('保存记录时出错:', error);
                reject(error);
            }
        });
    }
    
    // 更新用户总碳足迹
    updateUserTotalCarbon() {
        try {
            const STORAGE_KEYS = window.STORAGE_KEYS || {};
            const RECORDS_KEY = STORAGE_KEYS.USER_RECORDS || 'carbon_footprint_records';
            const utils = window.utils || {};
            
            // 获取所有记录
            const records = utils.storage?.get(RECORDS_KEY) || [];
            
            // 计算总碳足迹
            let totalCarbon = 0;
            records.forEach(record => {
                if (record.totalEmission) {
                    totalCarbon += record.totalEmission;
                }
            });
            
            this.userTotalCarbon = totalCarbon;
            console.log('更新用户总碳足迹:', totalCarbon);
            
            // 可选：更新班级排名
            this.updateClassRanking();
        } catch (error) {
            console.error('更新用户总碳足迹时出错:', error);
        }
    }
    
    // 更新班级排名
    updateClassRanking() {
        try {
            // 这里可以实现班级排名逻辑
            // 例如：保存用户总碳足迹到班级排名数据中
            console.log('班级排名更新逻辑');
        } catch (error) {
            console.error('更新班级排名时出错:', error);
        }
    }
    
    // 获取用户碳足迹统计
    getUserStatistics() {
        try {
            const STORAGE_KEYS = window.STORAGE_KEYS || {};
            const RECORDS_KEY = STORAGE_KEYS.USER_RECORDS || 'carbon_footprint_records';
            const utils = window.utils || {};
            
            // 获取所有记录
            const records = utils.storage?.get(RECORDS_KEY) || [];
            
            // 计算统计数据
            const stats = {
                totalRecords: records.length,
                totalCarbonSaved: 0,
                totalTreesSaved: 0,
                breakdownByType: {}
            };
            
            records.forEach(record => {
                if (record.savings) {
                    stats.totalCarbonSaved += record.savings;
                    stats.totalTreesSaved += this.calculateEquivalentTrees(record.savings);
                }
                
                // 按活动类型统计
                const activityType = record.activityType || 'unknown';
                if (!stats.breakdownByType[activityType]) {
                    stats.breakdownByType[activityType] = 0;
                }
                stats.breakdownByType[activityType] += record.totalEmission || 0;
            });
            
            return stats;
        } catch (error) {
            console.error('获取用户统计数据时出错:', error);
            return {
                totalRecords: 0,
                totalCarbonSaved: 0,
                totalTreesSaved: 0,
                breakdownByType: {}
            };
        }
    }
}

// 创建全局计算器实例
(function() {
    // 确保window对象存在
    if (typeof window !== 'undefined') {
        // 防止重复创建
        if (!window.carbonCalculator) {
            // 创建新的计算器实例
            window.carbonCalculator = new CarbonFootprintCalculator();
            console.log('碳足迹计算器全局实例已创建');
            
            // 尝试初始化
            try {
                window.carbonCalculator.init();
            } catch (error) {
                console.error('计算器初始化失败，但不影响核心功能:', error);
            }
        }
    }
})();
