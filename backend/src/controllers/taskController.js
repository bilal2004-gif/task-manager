const db = require('../config/database');
const AppError = require('../utils/AppError');

const getAllTasks = async (req, res) => {
  try {
    const { status, priority, search, page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let where = 'WHERE user_id = $1';
    const params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      where += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (priority) {
      where += ` AND priority = $${paramIndex++}`;
      params.push(priority);
    }

    if (search) {
      const term = search.trim();
      if (/^\d+$/.test(term)) {
        where += ` AND (id = $${paramIndex++} OR title ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`;
        params.push(parseInt(term, 10), `%${term}%`, `%${term}%`);
      } else {
        where += ` AND (title ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++} OR CAST(id AS TEXT) ILIKE $${paramIndex++})`;
        const like = `%${term}%`;
        params.push(like, like, like);
      }
    }

    const totalResult = await db.query(`SELECT COUNT(*) as total FROM tasks ${where}`, params);
    const total = parseInt(totalResult.rows[0].total, 10);

    const tasksResult = await db.query(
      `SELECT * FROM tasks ${where} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limitNum, offset]
    );
    const tasks = tasksResult.rows;

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: {
        tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const statsResult = await db.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority
      FROM tasks WHERE user_id = $1`,
      [req.user.id]
    );
    
    // PG might return SUM as string if it's large, we can parse it if needed
    const stats = statsResult.rows[0];

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    const task = result.rows[0];

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description = '', status = 'pending', priority = 'medium', due_date = null } = req.body;

    const result = await db.query(
      'INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, title, description, status, priority, due_date]
    );
    const task = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const taskResult = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    const task = taskResult.rows[0];

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    const { title, description, status, priority, due_date } = req.body;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(due_date);
    }

    if (updates.length === 0) {
      return next(new AppError('No fields to update', 400));
    }

    updates.push(`updated_at = NOW()`);
    
    // Add id and user_id for the WHERE clause
    const idIndex = paramIndex++;
    const userIdIndex = paramIndex++;
    values.push(req.params.id, req.user.id);

    const updateQuery = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${idIndex} AND user_id = $${userIdIndex} RETURNING *`;
    
    const result = await db.query(updateQuery, values);
    const updatedTask = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    if (result.rowCount === 0) {
      return next(new AppError('Task not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
