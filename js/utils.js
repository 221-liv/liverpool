// 工具函数模块

// 本地存储操作函数
const storage = {
    // 获取存储的数据
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },
    
    // 设置存储的数据
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    // 移除存储的数据
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    // 清空所有存储的数据
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// 日期格式化函数
function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// 格式化碳排放量显示
function formatCarbonEmission(amount) {
    if (amount === 0) return '0 kg';
    
    if (amount < 0.001) {
        return (amount * 1000000).toFixed(2) + ' mg';
    } else if (amount < 1) {
        return (amount * 1000).toFixed(2) + ' g';
    } else if (amount < 1000) {
        return amount.toFixed(2) + ' kg';
    } else {
        return (amount / 1000).toFixed(2) + ' t';
    }
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 深拷贝对象
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}

// 验证数值输入
function validateNumberInput(value, min = 0, max = Infinity) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}

// 计算两个碳足迹的差值（节约量）
function calculateCarbonSavings(highCarbon, lowCarbon) {
    const savings = highCarbon - lowCarbon;
    return Math.max(0, savings); // 确保不会出现负数
}

// 计算平均碳足迹
function calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
}

// 按碳足迹值排序用户
function sortUsersByCarbonFootprint(users, ascending = true) {
    return [...users].sort((a, b) => {
        const carbonA = a.totalCarbon || 0;
        const carbonB = b.totalCarbon || 0;
        return ascending ? carbonA - carbonB : carbonB - carbonA;
    });
}

// 导出数据为CSV格式
function exportToCSV(data, filename = 'carbon_footprint_data.csv') {
    if (!data || data.length === 0) {
        alert('没有数据可导出');
        return;
    }
    
    // 获取所有字段名
    const headers = Object.keys(data[0]);
    
    // 创建CSV内容
    let csvContent = headers.join(',') + '\n';
    
    // 添加数据行
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            // 如果值包含逗号、引号或换行符，需要用引号包围
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        csvContent += values.join(',') + '\n';
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) { // 支持HTML5下载
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 显示通知消息
function showNotification(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '4px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '10000',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: 'translateX(100%)',
        opacity: 0
    });
    
    // 设置不同类型的背景色
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#4caf50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ff9800';
            break;
        default:
            notification.style.backgroundColor = '#2196f3';
    }
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        // 移除元素
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

// 验证表单字段
function validateForm(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        // 检查必填字段
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            // 显示错误提示
            showError(input, '此字段为必填项');
        } else {
            input.classList.remove('error');
            // 移除错误提示
            removeError(input);
        }
        
        // 验证数字字段
        if (input.type === 'number' && input.value) {
            const min = parseFloat(input.min) || 0;
            const max = parseFloat(input.max) || Infinity;
            const value = parseFloat(input.value);
            
            if (isNaN(value) || value < min || value > max) {
                isValid = false;
                input.classList.add('error');
                showError(input, `请输入${min}到${max}之间的数字`);
            }
        }
    });
    
    return isValid;
}

// 显示表单错误
function showError(input, message) {
    // 移除已存在的错误提示
    removeError(input);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    Object.assign(errorElement.style, {
        color: '#f44336',
        fontSize: '12px',
        marginTop: '5px'
    });
    
    input.parentNode.appendChild(errorElement);
}

// 移除表单错误
function removeError(input) {
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        input.parentNode.removeChild(existingError);
    }
}

// 导出工具函数
if (typeof module !== 'undefined') {
    module.exports = {
        storage,
        formatDate,
        formatCarbonEmission,
        generateId,
        deepClone,
        validateNumberInput,
        calculateCarbonSavings,
        calculateAverage,
        sortUsersByCarbonFootprint,
        exportToCSV,
        showNotification,
        validateForm
    };
}

// 全局暴露工具函数
window.utils = {
    storage,
    formatDate,
    formatCarbonEmission,
    generateId,
    deepClone,
    validateNumberInput,
    calculateCarbonSavings,
    calculateAverage,
    sortUsersByCarbonFootprint,
    exportToCSV,
    showNotification,
    validateForm
};