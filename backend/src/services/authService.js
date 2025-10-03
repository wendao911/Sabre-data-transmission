const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models/User');

async function registerUser({ email, password, name }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) return { ok: false, status: 400, error: 'User already exists' };

  const hashedPassword = await bcrypt.hash(password, 10);
  const created = await User.create({ email, password: hashedPassword, name, role: 'user' });

  const token = jwt.sign(
    { userId: created._id.toString(), email: created.email, role: created.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  return {
    ok: true,
    status: 201,
    data: {
      message: 'User created successfully',
      token,
      user: { id: created._id.toString(), email: created.email, name: created.name, role: created.role }
    }
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) return { ok: false, status: 401, error: 'Invalid credentials' };
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return { ok: false, status: 401, error: 'Invalid credentials' };

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  return {
    ok: true,
    status: 200,
    data: {
      message: 'Login successful',
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role }
    }
  };
}

async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId);
    if (!user) return { ok: false, status: 401, error: 'Invalid token' };

    return { ok: true, status: 200, data: { valid: true, user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role } } };
  } catch (_) {
    return { ok: false, status: 401, error: 'Invalid token' };
  }
}

module.exports = { registerUser, loginUser, verifyToken };


