// 一定要第一行
require('./tracing');

const express = require('express');
const cors = require('cors');

const { trace } = require('@opentelemetry/api');

const app = express();
app.use(express.json());
app.use(cors('*'))
const tracer = trace.getTracer('todo-service');

// 假資料
const todos = [];

/**
 * GET /todo
 */
app.get('/todo', async (req, res) => {
  // 自訂 span（可選，但很好教學）
  const span = tracer.startSpan('get_todo_logic');

  try {
    // 模擬 DB 存取
    await fakeDbQuery();

    res.json({
      data: todos,
    });
  } catch (err) {
    span.recordException(err);
    throw err;
  } finally {
    span.end();
  }
});

/**
 * POST /todo
 */
app.post('/todo', async (req, res) => {
  const span = tracer.startSpan('create_todo_logic');

  try {
    const { title } = req.body;

    if (!title) {
      span.setAttribute('error', true);
      return res.status(400).json({ error: 'title is required' });
    }

    // 模擬 DB 寫入
    await fakeDbInsert();

    const todo = {
      id: Date.now(),
      title,
    };

    todos.push(todo);

    res.status(201).json(todo);
  } finally {
    span.end();
  }
});

function fakeDbQuery() {
  return new Promise((resolve) => setTimeout(resolve, 100));
}

function fakeDbInsert() {
  return new Promise((resolve) => setTimeout(resolve, 150));
}

app.listen(3000, () => {
  console.log('🚀 Server listening on http://localhost:3000');
});
