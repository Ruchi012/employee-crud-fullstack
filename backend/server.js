const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch employees' });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch employee' });
  }
});

app.post('/api/employees', async (req, res) => {
  const { name, email, department, salary } = req.body;
  if (!name || !email || !department || salary === undefined || salary === '') {
    return res.status(400).json({ message: 'Name, email, department and salary are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO employees (name, email, department, salary) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim(), department.trim(), Number(salary)]
    );
    const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists' });
    console.error(err);
    res.status(500).json({ message: 'Could not create employee' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  const { name, email, department, salary } = req.body;
  if (!name || !email || !department || salary === undefined || salary === '') {
    return res.status(400).json({ message: 'Name, email, department and salary are required' });
  }
  try {
    const [result] = await db.query(
      'UPDATE employees SET name = ?, email = ?, department = ?, salary = ? WHERE id = ?',
      [name.trim(), email.trim(), department.trim(), Number(salary), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Employee not found' });
    const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists' });
    console.error(err);
    res.status(500).json({ message: 'Could not update employee' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete employee' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => console.log(`API running on port ${port}`));
