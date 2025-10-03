/*
 * 按指定信息写入一个用户账户（若不存在）。
 * 运行方式：node src/scripts/seedUser.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { User } = require('../models/User');

async function connectMongo() {
  const uri = config.database.uri;
  const options = {
    maxPoolSize: config.database.options.maxPoolSize,
    minPoolSize: config.database.options.minPoolSize,
    connectTimeoutMS: config.database.options.connectTimeoutMS,
    socketTimeoutMS: config.database.options.socketTimeoutMS,
    serverSelectionTimeoutMS: config.database.options.serverSelectionTimeoutMS
  };
  await mongoose.connect(uri, options);
}

async function seedOneUser({ email, password, name, role = 'user' }) {
  // 已存在则跳过
  const exists = await User.findOne({ email });
  if (exists) {
    console.log(`用户已存在，跳过：${email}`);
    return { created: false, user: exists };
  }

  const hashed = await bcrypt.hash(password, 10);
  const created = await User.create({ email, password: hashed, name, role });
  console.log('用户创建完成：', { id: created._id.toString(), email: created.email, name: created.name, role: created.role });
  return { created: true, user: created };
}

async function main() {
  try {
    await connectMongo();
    const target = {
      email: 'menghua.li@aircambodia.com',
      password: 'K6FAD2025',
      name: 'Menghua Li',
      role: 'user'
    };
    const result = await seedOneUser(target);
    if (result.created) {
      console.log('✅ 已写入用户');
    } else {
      console.log('ℹ️ 已存在该用户，无需写入');
    }
  } catch (err) {
    console.error('写入用户失败：', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();


