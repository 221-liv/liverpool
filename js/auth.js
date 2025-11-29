/**
 * 统一的用户认证和状态管理模块
 * 解决登录状态无法保持和记录功能失效的问题
 */

(function(window) {
    'use strict';

    // 确保STORAGE_KEYS存在
    if (!window.STORAGE_KEYS) {
        window.STORAGE_KEYS = {
            USER_INFO: 'userInfo',
            USER_RECORDS: 'userRecords',
            GUEST_RECORDS: 'guestRecords',
            CLASS_RANKING: 'classRanking'
        };
    }

    /**
     * 认证管理器
     */
    const AuthManager = {
        /**
         * 获取当前登录用户信息
         * @returns {Object|null} 用户信息对象，未登录返回null
         */
        getCurrentUser: function() {
            try {
                const userInfoStr = localStorage.getItem(window.STORAGE_KEYS.USER_INFO);
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr);
                    console.log('✅ 获取到登录用户:', userInfo.name, userInfo.studentId);
                    return userInfo;
                }
                console.log('ℹ️ 未检测到登录用户，当前为访客模式');
                return null;
            } catch (error) {
                console.error('❌ 获取用户信息失败:', error);
                return null;
            }
        },

        /**
         * 保存用户登录信息
         * @param {Object} userInfo 用户信息 {name, studentId}
         * @returns {boolean} 是否保存成功
         */
        login: function(userInfo) {
            try {
                if (!userInfo || !userInfo.name || !userInfo.studentId) {
                    console.error('❌ 用户信息不完整');
                    return false;
                }

                // 添加登录时间
                userInfo.lastLogin = new Date().toISOString();
                
                localStorage.setItem(window.STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
                console.log('✅ 用户登录成功:', userInfo.name);
                
                // 触发登录事件
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userInfo }));
                
                return true;
            } catch (error) {
                console.error('❌ 保存用户信息失败:', error);
                return false;
            }
        },

        /**
         * 退出登录
         * @returns {boolean} 是否退出成功
         */
        logout: function() {
            try {
                const userInfo = this.getCurrentUser();
                localStorage.removeItem(window.STORAGE_KEYS.USER_INFO);
                console.log('✅ 用户退出登录');
                
                // 触发退出事件
                window.dispatchEvent(new CustomEvent('userLoggedOut', { detail: userInfo }));
                
                return true;
            } catch (error) {
                console.error('❌ 退出登录失败:', error);
                return false;
            }
        },

        /**
         * 检查是否已登录
         * @returns {boolean}
         */
        isLoggedIn: function() {
            return this.getCurrentUser() !== null;
        },

        /**
         * 获取用户显示名称
         * @returns {string}
         */
        getUserDisplayName: function() {
            const user = this.getCurrentUser();
            return user ? `${user.name} (${user.studentId})` : '访客用户';
        },

        /**
         * 初始化页面登录状态UI
         * 自动更新导航栏显示
         */
        initPageUI: function() {
            const userInfo = this.getCurrentUser();
            const registerLink = document.getElementById('register-link');
            const logoutButton = document.getElementById('logout-button');
            const loginLink = document.querySelector('a[href*="login"]');

            if (userInfo) {
                // 已登录状态
                console.log('🔐 页面UI更新：已登录模式');
                
                if (registerLink) registerLink.style.display = 'none';
                if (loginLink && loginLink !== logoutButton) loginLink.style.display = 'none';
                
                if (logoutButton) {
                    logoutButton.style.display = 'inline-block';
                    logoutButton.textContent = `退出 (${userInfo.name})`;
                    
                    // 移除旧的事件监听器，避免重复绑定
                    const newLogoutButton = logoutButton.cloneNode(true);
                    logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
                    
                    // 添加退出登录事件
                    newLogoutButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (confirm('确定要退出登录吗？退出后将切换为访客模式。')) {
                            AuthManager.logout();
                            window.location.reload();
                        }
                    });
                }
            } else {
                // 未登录状态
                console.log('👤 页面UI更新：访客模式');
                
                if (registerLink) registerLink.style.display = 'inline-block';
                if (loginLink) loginLink.style.display = 'inline-block';
                if (logoutButton) logoutButton.style.display = 'none';
            }
        }
    };

    /**
     * 记录管理器
     */
    const RecordManager = {
        /**
         * 保存计算记录
         * @param {Object} record 记录对象
         * @returns {boolean} 是否保存成功
         */
        saveRecord: function(record) {
            try {
                const userInfo = AuthManager.getCurrentUser();
                
                // 添加时间戳
                record.timestamp = record.timestamp || new Date().toISOString();
                
                if (userInfo) {
                    // 登录用户：保存到用户记录
                    record.studentId = userInfo.studentId;
                    record.userName = userInfo.name;
                    
                    const userRecords = this.getUserRecords();
                    userRecords.push(record);
                    localStorage.setItem(window.STORAGE_KEYS.USER_RECORDS, JSON.stringify(userRecords));
                    
                    console.log('✅ 记录已保存到用户记录:', userInfo.name, '总记录数:', userRecords.length);
                    return true;
                } else {
                    // 访客模式：保存到访客记录
                    record.studentId = '访客';
                    record.userName = '访客用户';
                    
                    const guestRecords = this.getGuestRecords();
                    guestRecords.push(record);
                    localStorage.setItem(window.STORAGE_KEYS.GUEST_RECORDS, JSON.stringify(guestRecords));
                    
                    console.log('✅ 记录已保存到访客记录，总记录数:', guestRecords.length);
                    return true;
                }
            } catch (error) {
                console.error('❌ 保存记录失败:', error);
                return false;
            }
        },

        /**
         * 获取用户记录
         * @returns {Array} 记录数组
         */
        getUserRecords: function() {
            try {
                const recordsStr = localStorage.getItem(window.STORAGE_KEYS.USER_RECORDS);
                return recordsStr ? JSON.parse(recordsStr) : [];
            } catch (error) {
                console.error('❌ 获取用户记录失败:', error);
                return [];
            }
        },

        /**
         * 获取访客记录
         * @returns {Array} 记录数组
         */
        getGuestRecords: function() {
            try {
                const recordsStr = localStorage.getItem(window.STORAGE_KEYS.GUEST_RECORDS);
                return recordsStr ? JSON.parse(recordsStr) : [];
            } catch (error) {
                console.error('❌ 获取访客记录失败:', error);
                return [];
            }
        },

        /**
         * 获取当前用户的所有记录
         * @returns {Array} 记录数组
         */
        getCurrentUserRecords: function() {
            const userInfo = AuthManager.getCurrentUser();
            
            if (userInfo) {
                // 返回该用户的记录
                const allUserRecords = this.getUserRecords();
                return allUserRecords.filter(r => r.studentId === userInfo.studentId);
            } else {
                // 返回访客记录
                return this.getGuestRecords();
            }
        },

        /**
         * 获取所有记录（用户+访客）
         * @returns {Array} 记录数组
         */
        getAllRecords: function() {
            return [...this.getUserRecords(), ...this.getGuestRecords()];
        },

        /**
         * 清除访客记录
         * @returns {boolean}
         */
        clearGuestRecords: function() {
            try {
                localStorage.removeItem(window.STORAGE_KEYS.GUEST_RECORDS);
                console.log('✅ 访客记录已清除');
                return true;
            } catch (error) {
                console.error('❌ 清除访客记录失败:', error);
                return false;
            }
        }
    };

    /**
     * 自动初始化
     */
    function autoInit() {
        // 页面加载完成后自动初始化UI
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                AuthManager.initPageUI();
            });
        } else {
            AuthManager.initPageUI();
        }

        // 监听存储变化（多标签页同步）
        window.addEventListener('storage', function(e) {
            if (e.key === window.STORAGE_KEYS.USER_INFO) {
                console.log('🔄 检测到其他标签页登录状态变化，刷新UI');
                AuthManager.initPageUI();
            }
        });
    }

    // 导出到全局
    window.AuthManager = AuthManager;
    window.RecordManager = RecordManager;

    // 自动初始化
    autoInit();

    console.log('✅ 认证管理模块加载完成');

})(window);
