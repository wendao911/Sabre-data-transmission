#!/usr/bin/env node
/**
 * 独立的GPG文件解密脚本
 * 使用方法：node decrypt.js
 */

const decryptService = require('./src/services/decryptService');

async function main() {
    console.log('=== GPG文件解密脚本 ===');
    console.log('正在检查系统状态...\n');
    
    try {
        // 检查状态
        const status = decryptService.getDecryptStatus();
        
        console.log('系统状态检查：');
        console.log(`- 加密文件夹存在: ${status.encryptionDir.exists ? '✓' : '✗'}`);
        console.log(`- 解密文件夹存在: ${status.decryptionDir.exists ? '✓' : '✗'}`);
        console.log(`- 私钥文件存在: ${status.privateKey.exists ? '✓' : '✗'}`);
        console.log(`- 密码文件存在: ${status.passphrase.exists ? '✓' : '✗'}`);
        
        if (status.encryptionDir.exists) {
            console.log(`- 找到 ${status.encryptionDir.gpgFiles} 个GPG文件`);
            console.log(`- 涉及日期: ${status.encryptionDir.dates.join(', ')}`);
        }
        
        if (status.decryptionDir.exists) {
            console.log(`- 解密目录子文件夹: ${status.decryptionDir.subdirs.join(', ')}`);
        }
        
        console.log('\n开始解密...');
        
        // 执行解密
        const results = await decryptService.decryptAllFiles();
        
        console.log('\n=== 解密完成 ===');
        console.log(`总文件数: ${results.total}`);
        console.log(`成功解密: ${results.success}`);
        console.log(`失败数量: ${results.total - results.success}`);
        
        if (results.errors.length > 0) {
            console.log('\n错误信息:');
            results.errors.forEach(error => console.log(`- ${error}`));
        }
        
        if (results.success === results.total) {
            console.log('\n🎉 所有文件解密成功！');
            process.exit(0);
        } else {
            console.log('\n⚠️  部分文件解密失败，请检查错误信息');
            process.exit(1);
        }
        
    } catch (error) {
        console.error(`\n错误: ${error.message}`);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = main;
