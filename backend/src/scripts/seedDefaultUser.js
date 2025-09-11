/*
 * 将默认账号写入 MongoDB 的脚本。
 * 运行方式：npm run seed:user
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');

async function connectMongo() {
  // 使用配置中的写死 URI
  const uri = config.database.uri;

  // 基于写死的 options 组合连接参数
  const options = {
    maxPoolSize: config.database.options.maxPoolSize,
    minPoolSize: config.database.options.minPoolSize,
    connectTimeoutMS: config.database.options.connectTimeoutMS,
    socketTimeoutMS: config.database.options.socketTimeoutMS,
    serverSelectionTimeoutMS: config.database.options.serverSelectionTimeoutMS
  };

  await mongoose.connect(uri, options);
}

async function seedDefaultUser() {
  const defaultUser = {
    email: 'leo.liu@aircambodia.com',
    password: 'K6ITD2025', // 将会在保存前进行哈希
    name: 'Leo',
    role: 'admin'
  };

  // 若用户已存在则跳过创建
  const exists = await User.findOne({ email: defaultUser.email });
  if (exists) {
    console.log('默认账号已存在，跳过创建。');
    return { created: false };
  }

  const hashed = await bcrypt.hash(defaultUser.password, 10);

  await User.create({
    email: defaultUser.email,
    password: hashed,
    name: defaultUser.name,
    role: defaultUser.role
  });

  console.log('默认账号创建完成。');
  return { created: true };
}

async function main() {
  try {
    await connectMongo();
    const result = await seedDefaultUser();
    if (result.created) {
      console.log('✅ 已写入默认账号');
    } else {
      console.log('ℹ️ 已存在默认账号，无需写入');
    }
  } catch (err) {
    console.error('写入默认账号失败：', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();


