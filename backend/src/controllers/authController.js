const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const AppError = require('../utils/AppError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return next(new AppError('Email already registered', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );
    const user = result.rows[0];

    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = signToken(user.id);
    const { password: _, ...safeUser } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser, token },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password, currentPassword } = req.body;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (email) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
      if (existing.rows.length > 0) {
        return next(new AppError('Email already in use', 409));
      }
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (password) {
      if (!currentPassword) {
        return next(new AppError('Current password is required to set a new password', 400));
      }

      const userRecord = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
      const isMatch = await bcrypt.compare(currentPassword, userRecord.rows[0].password);
      if (!isMatch) {
        return next(new AppError('Current password is incorrect', 401));
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return next(new AppError('No fields to update', 400));
    }

    updates.push(`updated_at = NOW()`);
    
    // We need to append the user id for the WHERE clause
    const userIdIndex = paramIndex;
    values.push(req.user.id);

    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = $${userIdIndex} RETURNING id, name, email, created_at, updated_at`;
    
    const result = await db.query(updateQuery, values);
    const user = result.rows[0];

    res.status(200).json({
      success: true,
      message: password ? 'Profile and password updated successfully' : 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };
