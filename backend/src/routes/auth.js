const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authService = require('../services/authService');

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const result = await authService.registerUser(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const result = await authService.loginUser(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  const result = await authService.verifyToken(token);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(result.status).json(result.data);
});

module.exports = router;


