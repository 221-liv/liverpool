// 碳足迹计算器核心模块

class CarbonFootprintCalculator {
    constructor() {
        // 使用常量文件中的排放系数
        this.emissionFactors = window.EMISSION_FACTORS || {};
    }
    
    // 计算交通活动的碳足迹
    calculateTransportationEmission(transportType, distance) {
        if (!transportType || typeof distance !== 'number' || distance < 0) {
            return 0;
        }
        
        const factor = this.emissionFactors.transportation?.[transportType] || 0;
        return distance * factor;
    }
    
    // 计算能源消耗的碳足迹
    calculateEnergyEmission(energyType, amount) {
        if (!energyType || typeof amount !== 'number' || amount < 0) {
            return 0;
        }
        
        const factor = this.emissionFactors.energy?.[energyType] || 0;
        return amount * factor;
    }
    
    // 计算饮食的碳足迹
    calculateDietEmission(foodType, amount) {
        if (!foodType || typeof amount !== 'number' || amount < 0) {
            return 0;
        }
        
        const factor = this.emissionFactors.diet?.[foodType] || 0;
        return amount * factor;
    }
    
    // 计算单个活动的碳足迹
    calculateActivityEmission(activityType, itemType, amount) {
        switch (activityType) {
            case 'transportation':
                return this.calculateTransportationEmission(itemType, amount);
            case 'energy':
                return this.calculateEnergyEmission(itemType, amount);
            case 'diet':
                return this.calculateDietEmission(itemType, amount);
            default:
                console.warn('未知的活动类型:', activityType);
                return 0;
        }
    }
    
    // 计算多个活动的总碳足迹
    calculateTotalEmission(activities) {
        if (!Array.isArray(activities)) {
            return 0;
        }
        
        return activities.reduce((total, activity) => {
            const { type, item, amount } = activity;
            return total + this.calculateActivityEmission(type, item, amount);
        }, 0);
    }
    
    // 比较两种活动选择的碳足迹差异
    compareEmissions(option1, option2) {
        const emission1 = this.calculateActivityEmission(
            option1.type, 
            option1.item, 
            option1.amount
        );
        
        const emission2 = this.calculateActivityEmission(
            option2.type, 
            option2.item, 
            option2.amount
        );
        
        return {
            option1: {
                ...option1,
                emission: emission1
            },
            option2: {
                ...option2,
                emission: emission2
            },
            difference: Math.abs(emission1 - emission2),
            savings: Math.max(0, Math.max(emission1, emission2) - Math.min(emission1, emission2)),
            lowerOption: emission1 < emission2 ? 'option1' : 'option2'
        };
    }
    
    // 获取活动类型的排放系数说明
    getEmissionFactorInfo(activityType, itemType) {
        const factors = this.emissionFactors[activityType];
        if (!factors || !factors[itemType]) {
            return null;
        }
        
        let unit, description;
        
        switch (activityType) {
            case 'transportation':
                unit = 'kg CO2e/km';
                description = '每公里碳排放系数';
                break;
            case 'energy':
                switch (itemType) {
                    case 'electricity':
                        unit = 'kg CO2e/kWh';
                        break;
                    case 'natural_gas':
                        unit = 'kg CO2e/m³';
                        break;
                    case 'coal':
                        unit = 'kg CO2e/kg';
                        break;
                    case 'gasoline':
                    case 'diesel':
                        unit = 'kg CO2e/L';
                        break;
                    default:
                        unit = 'kg CO2e/单位';
                }
                description = '能源消耗碳排放系数';
                break;
            case 'diet':
                unit = 'kg CO2e/kg';
                description = '食物生产碳排放系数';
                break;
            default:
                unit = 'kg CO2e/单位';
                description = '碳排放系数';
        }
        
        return {
            value: factors[itemType],
            unit,
            description
        };
    }
    
    // 根据碳足迹值提供环保建议
    getCarbonReductionTips(carbonAmount, activityType) {
        const tips = [];
        
        if (carbonAmount > 100) { // 高碳足迹
            switch (activityType) {
                case 'transportation':
                    tips.push('考虑使用公共交通工具替代私家车');
                    tips.push('对于短途出行，尝试步行或骑行');
                    tips.push('合理规划路线，减少不必要的出行');
                    break;
                case 'energy':
                    tips.push('使用节能电器，及时关闭不使用的设备');
                    tips.push('考虑使用可再生能源，如太阳能');
                    tips.push('改善家庭 insulation，减少供暖和制冷需求');
                    break;
                case 'diet':
                    tips.push('减少肉类特别是红肉的摄入');
                    tips.push('选择本地和季节性食物');
                    tips.push('减少食物浪费');
                    break;
            }
        } else if (carbonAmount > 10) { // 中等碳足迹
            tips.push('继续努力，可以进一步优化您的选择');
            tips.push('关注日常小习惯，积少成多');
        } else { // 低碳足迹
            tips.push('做得很好！您的选择对环境非常友好');
            tips.push('分享您的经验，鼓励他人也采取行动');
        }
        
        return tips;
    }
    
    // 估算碳足迹相当于多少棵树一年吸收的量
    calculateEquivalentTrees(carbonAmount) {
        // 假设一棵树一年平均吸收21.77公斤CO2
        const carbonPerTreePerYear = 21.77;
        return carbonAmount / carbonPerTreePerYear;
    }
    
    // 保存计算记录
    saveRecord(record) {
        const calculator = this;
        return new Promise((resolve, reject) => {
            try {
                // 获取现有记录
                const records = utils.storage.get(STORAGE_KEYS.USER_RECORDS) || [];
                
                // 添加新记录
                const newRecord = {
                    id: utils.generateId(),
                    timestamp: new Date().toISOString(),
                    ...record
                };
                
                records.unshift(newRecord);
                
                // 限制记录数量，只保留最新的100条
                if (records.length > 100) {
                    records.splice(100);
                }
                
                // 保存到本地存储
                const saved = utils.storage.set(STORAGE_KEYS.USER_RECORDS, records);
                
                if (saved) {
                    // 更新用户总碳足迹
                    calculator.updateUserTotalCarbon();
                    resolve(newRecord);
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
            const records = utils.storage.get(STORAGE_KEYS.USER_RECORDS) || [];
            const userInfo = utils.storage.get(STORAGE_KEYS.USER_INFO) || {};
            
            // 计算总碳足迹
            const totalCarbon = records.reduce((total, record) => {
                return total + (record.totalEmission || 0);
            }, 0);
            
            // 更新用户信息
            userInfo.totalCarbon = totalCarbon;
            utils.storage.set(STORAGE_KEYS.USER_INFO, userInfo);
            
            // 更新班级排名
            this.updateClassRanking(userInfo);
            
            return totalCarbon;
        } catch (error) {
            console.error('更新用户总碳足迹时出错:', error);
            return 0;
        }
    }
    
    // 更新班级排名
    updateClassRanking(userInfo) {
        try {
            // 获取班级排名数据
            let ranking = utils.storage.get(STORAGE_KEYS.CLASS_RANKING) || [];
            
            // 查找当前用户
            const userIndex = ranking.findIndex(user => user.name === userInfo.name);
            
            if (userIndex >= 0) {
                // 更新现有用户数据
                ranking[userIndex].totalCarbon = userInfo.totalCarbon || 0;
            } else if (userInfo.name) {
                // 添加新用户
                ranking.push({
                    name: userInfo.name,
                    studentId: userInfo.studentId || '',
                    totalCarbon: userInfo.totalCarbon || 0,
                    lastUpdated: new Date().toISOString()
                });
            }
            
            // 添加一些模拟数据（如果排名数据太少）
            if (ranking.length < 8) {
                const mockUsers = window.MOCK_CLASS_USERS || [];
                mockUsers.forEach(mockUser => {
                    if (!ranking.find(user => user.name === mockUser.name)) {
                        ranking.push({
                            name: mockUser.name,
                            studentId: mockUser.studentId,
                            totalCarbon: Math.random() * 500, // 随机碳足迹
                            lastUpdated: new Date().toISOString()
                        });
                    }
                });
            }
            
            // 按碳足迹值排序（升序，低碳足迹排名靠前）
            ranking.sort((a, b) => (a.totalCarbon || 0) - (b.totalCarbon || 0));
            
            // 保存排名数据
            utils.storage.set(STORAGE_KEYS.CLASS_RANKING, ranking);
            
            return ranking;
        } catch (error) {
            console.error('更新班级排名时出错:', error);
            return [];
        }
    }
    
    // 获取用户记录
    getUserRecords(limit = 100) {
        const records = utils.storage.get(STORAGE_KEYS.USER_RECORDS) || [];
        return records.slice(0, limit);
    }
    
    // 获取班级排名
    getClassRanking() {
        return utils.storage.get(STORAGE_KEYS.CLASS_RANKING) || [];
    }
    
    // 获取统计数据
    getStatistics() {
        const records = this.getUserRecords();
        const ranking = this.getClassRanking();
        
        // 计算总碳排放量
        const totalEmission = records.reduce((sum, record) => sum + (record.totalEmission || 0), 0);
        
        // 计算平均碳排放量
        const averageEmission = records.length > 0 ? totalEmission / records.length : 0;
        
        // 计算班级平均碳排放量
        const classAverageEmission = ranking.length > 0 
            ? ranking.reduce((sum, user) => sum + (user.totalCarbon || 0), 0) / ranking.length 
            : 0;
        
        // 统计不同活动类型的碳排放
        const emissionsByType = {};
        records.forEach(record => {
            if (record.activityType) {
                const type = record.activityType;
                emissionsByType[type] = (emissionsByType[type] || 0) + (record.totalEmission || 0);
            }
        });
        
        return {
            totalRecords: records.length,
            totalEmission,
            averageEmission,
            classAverageEmission,
            emissionsByType,
            classSize: ranking.length
        };
    }
}

// 创建全局计算器实例
window.carbonCalculator = new CarbonFootprintCalculator();

// 导出类供其他模块使用
if (typeof module !== 'undefined') {
    module.exports = CarbonFootprintCalculator;
}