// 直接导入用户数据脚本
console.log('开始导入用户数据...');

// 确保localStorage可用
if (typeof localStorage === 'undefined') {
    console.error('错误：localStorage不可用！');
} else {
    // 学生名单数据
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

    // 创建用户列表数组（如果不存在）
    let allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    let addedCount = 0;
    let existingCount = 0;

    // 导入用户
    students.forEach(student => {
        try {
            // 检查用户是否已存在
            const existingUser = allUsers.find(u => u.studentId === student.studentId);
            if (existingUser) {
                console.log(`⚠️ 用户已存在: ${student.name} (${student.studentId})`);
                existingCount++;
            } else {
                // 添加用户到列表
                allUsers.push({
                    name: student.name,
                    studentId: student.studentId,
                    createdAt: new Date().toISOString()
                });
                addedCount++;

                // 同时创建对应的用户记录存储空间
                const userRecordsKey = `userRecords_${student.studentId}`;
                if (!localStorage.getItem(userRecordsKey)) {
                    localStorage.setItem(userRecordsKey, JSON.stringify([]));
                }

                // 额外添加到auth.js使用的格式
                if (window.STORAGE_KEYS && window.STORAGE_KEYS.USER_RECORDS) {
                    const userRecords = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.USER_RECORDS) || '[]');
                    // 不需要在这里添加记录，只需要确保空间存在
                }

                console.log(`✅ 已导入: ${student.name} - ${student.studentId}`);
            }
        } catch (error) {
            console.error(`❌ 导入用户 ${student.name} 失败: ${error.message}`);
        }
    });

    // 保存更新后的用户列表
    localStorage.setItem('allUsers', JSON.stringify(allUsers));

    // 显示导入结果
    console.log('\n====================================');
    console.log(`导入完成！`);
    console.log(`- 总共处理: ${students.length} 个用户`);
    console.log(`- 新添加: ${addedCount} 个用户`);
    console.log(`- 已存在: ${existingCount} 个用户`);
    console.log(`- 当前系统用户总数: ${allUsers.length} 个`);
    console.log('====================================');
    
    // 验证第一个用户是否成功导入
    if (allUsers.length > 0) {
        const firstUser = allUsers[0];
        console.log(`\n验证: 第一个用户 ${firstUser.name} (${firstUser.studentId}) 已成功导入`);
    }
}