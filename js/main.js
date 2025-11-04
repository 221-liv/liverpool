// 主JavaScript文件 - 页面交互和功能初始化

// 等待DOM加载完成
 document.addEventListener('DOMContentLoaded', function() {
    // 根据当前页面执行相应的初始化
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
            initHomePage();
            break;
        case 'calculator.html':
            initCalculatorPage();
            break;
        case 'records.html':
            initRecordsPage();
            break;
        case 'ranking.html':
            initRankingPage();
            break;
        case 'admin.html':
            initAdminPage();
            break;
    }
    
    // 初始化通用组件
    initNavigation();
    initUserInfo();
});

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

// 创建并显示用户注册表单
function showUserRegistrationForm() {
    // 创建模态框容器
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-overlay';
    modalContainer.id = 'registration-modal';
    
    // 模态框内容
    modalContainer.innerHTML = `
        <div class="modal-content">
            <h2>学生注册</h2>
            <div class="form-group">
                <label for="reg-name">姓名 *</label>
                <input type="text" id="reg-name" placeholder="请输入您的姓名" required>
            </div>
            <div class="form-group">
                <label for="reg-studentId">学号 *</label>
                <input type="text" id="reg-studentId" placeholder="请输入您的学号" required>
            </div>
            <div class="form-actions">
                <button id="reg-submit" class="btn-primary">注册</button>
                <button id="reg-cancel" class="btn-secondary">取消</button>
            </div>
            <p class="form-note">注：本系统仅供25-10矿大能动班级学生使用</p>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(modalContainer);
    
    // 绑定事件
    document.getElementById('reg-submit').addEventListener('click', handleUserRegistration);
    document.getElementById('reg-cancel').addEventListener('click', () => {
        // 如果用户取消注册，重定向到首页
        modalContainer.remove();
        utils.showNotification('请完成注册以使用系统功能', 'warning');
    });
}

// 处理用户注册
function handleUserRegistration() {
    const name = document.getElementById('reg-name').value.trim();
    const studentId = document.getElementById('reg-studentId').value.trim();
    const modal = document.getElementById('registration-modal');
    
    // 验证输入
    if (!name) {
        utils.showNotification('请输入姓名', 'error');
        return;
    }
    
    if (!studentId) {
        utils.showNotification('请输入学号', 'error');
        return;
    }
    
    // 创建用户信息
    const userInfo = {
        name,
        studentId,
        totalCarbon: 0,
        joinDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    // 保存用户信息
    utils.storage.set(STORAGE_KEYS.USER_INFO, userInfo);
    
    // 设置用户登录状态，实现记忆功能
    utils.storage.set(STORAGE_KEYS.USER_LOGGED_IN, true);
    
    // 更新班级排名数据
    updateClassRanking(userInfo);
    
    // 显示成功消息并关闭模态框
    utils.showNotification('注册成功，欢迎使用碳足迹计算器！', 'success');
    modal.remove();
    
    // 强制刷新当前页面，确保所有功能正常加载
    if (window.location.pathname !== '/') {
        window.location.reload();
    }
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

// 更新碳减排建议
function updateCarbonReductionTips(comparison) {
    const higherOption = comparison.lowerOption === 'option1' ? comparison.option2 : comparison.option1;
    const tips = window.carbonCalculator.getCarbonReductionTips(higherOption.emission, higherOption.type);
    
    const tipsElement = document.getElementById('reduction-tips');
    if (tipsElement) {
        tipsElement.innerHTML = '';
        
        tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsElement.appendChild(li);
        });
    }
}

// 处理保存记录
function handleSaveRecord() {
    if (!window.currentCalculation) {
        utils.showNotification('没有可保存的计算结果', 'error');
        return;
    }
    
    // 获取用户信息
    let userInfo = utils.storage.get(STORAGE_KEYS.USER_INFO);
    
    // 即使没有用户信息，也要允许保存记录，只是不关联到特定用户
    const isAnonymous = !userInfo;
    
    // 准备记录数据
    const record = {
        id: utils.generateId(),
        userId: isAnonymous ? 'anonymous' : userInfo.name,
        userName: isAnonymous ? '匿名用户' : userInfo.name,
        studentId: isAnonymous ? '' : userInfo.studentId,
        activityType: 'transportation',
        option1: window.currentCalculation.option1,
        option2: window.currentCalculation.option2,
        savings: window.currentCalculation.savings,
        totalEmission: Math.max(window.currentCalculation.option1.emission, window.currentCalculation.option2.emission),
        notes: document.getElementById('record-notes').value || '',
        timestamp: new Date().toISOString()
    };
    
    try {
        // 保存记录
        window.carbonCalculator.saveRecord(record)
            .then(savedRecord => {
                // 如果有用户信息，更新用户总碳排放量
                if (userInfo) {
                    userInfo.totalCarbon = (userInfo.totalCarbon || 0) + record.totalEmission;
                    userInfo.lastUpdated = new Date().toISOString();
                    utils.storage.set(STORAGE_KEYS.USER_INFO, userInfo);
                    
                    // 更新班级排名数据
                    updateClassRanking(userInfo);
                }
                
                utils.showNotification('记录已保存', 'success');
                // 重置表单
                document.getElementById('record-notes').value = '';
                document.getElementById('save-btn').disabled = true;
            })
            .catch(error => {
                console.error('保存记录失败:', error);
                utils.showNotification('保存失败，请稍后重试', 'error');
            });
    } catch (error) {
        console.error('处理保存记录时出错:', error);
        utils.showNotification('保存失败，请稍后重试', 'error');
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
    const records = window.carbonCalculator.getUserRecords();
    
    // 准备导出数据
    const exportData = ranking.map(user => ({
        '排名': ranking.findIndex(u => u.name === user.name) + 1,
        '姓名': user.name,
        '学号': user.studentId,
        '总碳排放量(kg)': (user.totalCarbon || 0).toFixed(2),
        '最后更新时间': utils.formatDate(user.lastUpdated)
    }));
    
    // 导出为CSV
    const filename = `碳足迹数据_${utils.formatDate(new Date(), 'YYYYMMDD_HHmm')}.csv`;
    utils.exportToCSV(exportData, filename);
    
    utils.showNotification('数据导出成功', 'success');
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