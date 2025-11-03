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
        beef: 27.0,        // kg CO2e/kg
        lamb: 24.5,        // kg CO2e/kg
        pork: 12.1,        // kg CO2e/kg
        chicken: 6.9,      // kg CO2e/kg
        fish: 5.4,         // kg CO2e/kg
        eggs: 4.8,         // kg CO2e/kg
        dairy: 2.8,        // kg CO2e/kg
        vegetables: 2.0,   // kg CO2e/kg
        fruits: 1.1,       // kg CO2e/kg
        grains: 2.7        // kg CO2e/kg
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
    { value: 'beef', label: '牛肉', unit: 'kg' },
    { value: 'lamb', label: '羊肉', unit: 'kg' },
    { value: 'pork', label: '猪肉', unit: 'kg' },
    { value: 'chicken', label: '鸡肉', unit: 'kg' },
    { value: 'fish', label: '鱼肉', unit: 'kg' },
    { value: 'eggs', label: '蛋类', unit: 'kg' },
    { value: 'dairy', label: '乳制品', unit: 'kg' },
    { value: 'vegetables', label: '蔬菜', unit: 'kg' },
    { value: 'fruits', label: '水果', unit: 'kg' },
    { value: 'grains', label: '谷物', unit: 'kg' }
];

// 存储键名
const STORAGE_KEYS = {
    USER_RECORDS: 'carbon_footprint_records',
    USER_INFO: 'user_info',
    CLASS_RANKING: 'class_carbon_ranking',
    ADMIN_LOGGED_IN: 'admin_logged_in'
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
    window.STORAGE_KEYS = STORAGE_KEYS;
    window.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;
    window.MOCK_CLASS_USERS = MOCK_CLASS_USERS;
}