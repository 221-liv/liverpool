// 碳排放系数常量定义
const EMISSION_FACTORS = {
    // 交通方式碳排放系数 (kg CO2e/km)
    transportation: {
        walking: 0,
        cycling: 0,
        bus: 0.089,      // 公共汽车
        subway: 0.041,   // 地铁
        taxi: 0.159,     // 出租车
        car_small: 0.122, // 小型汽车
        car_medium: 0.172, // 中型汽车
        car_large: 0.221,  // 大型汽车
        motorcycle: 0.091,
        train: 0.035,
        plane_domestic: 0.255,  // 国内航班
        plane_international: 0.195  // 国际航班
    },
    
    // 能源消耗碳排放系数
    energy: {
        electricity: 0.610,  // kg CO2e/kWh
        natural_gas: 2.16,   // kg CO2e/m³
        coal: 2.40,          // kg CO2e/kg
        gasoline: 2.31,      // kg CO2e/L
        diesel: 2.68         // kg CO2e/L
    },
    
    // 饮食碳排放系数
diet: {
    // 肉类
    beef: 27.0,        // kg CO2e/kg - 牛肉（碳足迹最高）
    lamb: 24.5,        // kg CO2e/kg - 羊肉
    pork: 12.0,        // kg CO2e/kg - 猪肉
    chicken: 6.0,      // kg CO2e/kg - 鸡肉（常见肉类中碳足迹最低）
    fish: 5.4,         // kg CO2e/kg - 鱼肉
    
    // 蛋奶类
    eggs: 4.8,         // kg CO2e/kg - 鸡蛋
    milk: 3.0,         // kg CO2e/kg - 牛奶
    
    // 谷物
    rice: 3.0,         // kg CO2e/kg - 米饭（2.5-3.5范围中间值）
    wheat: 2.5,        // kg CO2e/kg - 小麦
    
    // 蔬菜
    tomato: 1.75,      // kg CO2e/kg - 番茄（露天种植，1.5-2范围中间值）
    lettuce: 0.75,     // kg CO2e/kg - 生菜（露天种植，0.5-1范围中间值）
    broccoli: 2.8,     // kg CO2e/kg - 西兰花
    carrot: 1.1,       // kg CO2e/kg - 胡萝卜
    
    // 水果
    apple: 0.8,        // kg CO2e/kg - 苹果
    banana: 0.7,       // kg CO2e/kg - 香蕉
    
    // 分类汇总（用于快速计算）
    vegetables: 2.0,   // kg CO2e/kg - 蔬菜平均
    fruits: 1.1,       // kg CO2e/kg - 水果平均
    grains: 2.7        // kg CO2e/kg - 谷物平均
}
};

// 活动类型
const ACTIVITY_TYPES = {
    TRANSPORTATION: 'transportation',
    ENERGY: 'energy',
    DIET: 'diet'
};

// 交通方式选项
const TRANSPORT_OPTIONS = [
    { value: 'walking', label: '步行', unit: 'km' },
    { value: 'cycling', label: '自行车', unit: 'km' },
    { value: 'bus', label: '公共汽车', unit: 'km' },
    { value: 'subway', label: '地铁', unit: 'km' },
    { value: 'taxi', label: '出租车', unit: 'km' },
    { value: 'car_small', label: '小型汽车', unit: 'km' },
    { value: 'car_medium', label: '中型汽车', unit: 'km' },
    { value: 'car_large', label: '大型汽车', unit: 'km' },
    { value: 'motorcycle', label: '摩托车', unit: 'km' },
    { value: 'train', label: '火车', unit: 'km' },
    { value: 'plane_domestic', label: '国内航班', unit: 'km' },
    { value: 'plane_international', label: '国际航班', unit: 'km' }
];

// 能源类型选项
const ENERGY_OPTIONS = [
    { value: 'electricity', label: ' electricity', unit: 'kWh' },
    { value: 'natural_gas', label: '天然气', unit: 'm³' },
    { value: 'coal', label: '煤炭', unit: 'kg' },
    { value: 'gasoline', label: '汽油', unit: 'L' },
    { value: 'diesel', label: '柴油', unit: 'L' }
];

// 饮食类型选项
const DIET_OPTIONS = [
    // 肉类
    { value: 'beef', label: '牛肉', unit: 'kg', category: 'meat', highImpact: true },
    { value: 'pork', label: '猪肉', unit: 'kg', category: 'meat' },
    { value: 'chicken', label: '鸡肉', unit: 'kg', category: 'meat' },
    
    // 蛋奶类
    { value: 'eggs', label: '鸡蛋', unit: 'kg', category: 'dairy' },
    { value: 'milk', label: '牛奶', unit: 'kg', category: 'dairy' },
    
    // 谷物
    { value: 'rice', label: '米饭', unit: 'kg', category: 'grain' },
    
    // 蔬菜
    { value: 'tomato', label: '番茄(露天)', unit: 'kg', category: 'vegetable', lowImpact: true },
    { value: 'lettuce', label: '生菜(露天)', unit: 'kg', category: 'vegetable', lowImpact: true },
    
    // 分类汇总选项（用于快速选择）
    { value: 'vegetables', label: '蔬菜(平均)', unit: 'kg', category: 'vegetable' },
    { value: 'fruits', label: '水果(平均)', unit: 'kg', category: 'fruit' },
    { value: 'grains', label: '谷物(平均)', unit: 'kg', category: 'grain' }
];

// 牛肉碳足迹构成分析数据（百分比）
const BEEF_EMISSION_BREAKDOWN = {
    entericFermentation: 40,  // 肠道发酵（甲烷排放）
    feedProduction: 26,       // 饲料生产
    manureManagement: 10,     // 粪便管理
    farmEnergyUse: 7,         // 农场能源使用
    processing: 4,            // 加工处理
    transportation: 5,        // 运输配送
    retail: 3,                // 零售环节
    other: 5                  // 其他
};

// 存储键名
const STORAGE_KEYS = {
    USER_RECORDS: 'carbon_footprint_records',
    USER_INFO: 'user_info',
    CLASS_RANKING: 'class_carbon_ranking',
    ADMIN_LOGGED_IN: 'admin_logged_in',
    USER_LOGGED_IN: 'user_logged_in'
};

// 管理员凭证（实际应用中应该使用更安全的方式）
const ADMIN_CREDENTIALS = {
    username: '王榆腾',
    password: '351027'  // 管理员密码
};

// 模拟班级用户数据
const MOCK_CLASS_USERS = [
];

// 导出常量供其他模块使用
if (typeof module !== 'undefined') {
    module.exports = {
        EMISSION_FACTORS,
        ACTIVITY_TYPES,
        TRANSPORT_OPTIONS,
        ENERGY_OPTIONS,
        DIET_OPTIONS,
        BEEF_EMISSION_BREAKDOWN,
        STORAGE_KEYS,
        ADMIN_CREDENTIALS,
        MOCK_CLASS_USERS
    };
}

// 确保在浏览器环境中全局可用
if (typeof window !== 'undefined') {
    window.EMISSION_FACTORS = EMISSION_FACTORS;
    window.ACTIVITY_TYPES = ACTIVITY_TYPES;
    window.TRANSPORT_OPTIONS = TRANSPORT_OPTIONS;
    window.ENERGY_OPTIONS = ENERGY_OPTIONS;
    window.DIET_OPTIONS = DIET_OPTIONS;
    window.BEEF_EMISSION_BREAKDOWN = BEEF_EMISSION_BREAKDOWN;
    window.STORAGE_KEYS = STORAGE_KEYS;
    window.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;
    window.MOCK_CLASS_USERS = MOCK_CLASS_USERS;
}