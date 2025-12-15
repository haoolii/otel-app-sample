/* eslint-disable no-unreachable */
import { useState, useEffect } from 'react';
import './App.css';
import './otel';
import { trace, context } from '@opentelemetry/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tracer = trace.getTracer('todo-app-service');

  // 🚨 全局捕獲前端錯誤，alert traceId
  useEffect(() => {
    const handleError = (event) => {
      const currentSpan = trace.getSpan(context.active());
      const traceId = currentSpan ? currentSpan.spanContext().traceId : 'N/A';
      alert(`前端錯誤: ${event.message}\nTrace ID: ${traceId}`);
      console.log('traceId:', traceId);
      console.error(event.error || event.message);
    };

    const handleRejection = (event) => {
      const currentSpan = trace.getSpan(context.active());
      const traceId = currentSpan ? currentSpan.spanContext().traceId : 'N/A';
      alert(`Promise 拒絕: ${event.reason}\nTrace ID: ${traceId}`);
      console.error(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const addTodo = async () => {
    if (!inputValue.trim()) {
      alert('Please enter a todo title');
      return;
    }

    setLoading(true);
    setError(null);

    // 🔹 為這個操作 start span
    const span = tracer.startSpan('addTodo_click');

    try {
      const response = await fetch('http://localhost:8080/todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: inputValue }),
      });
      throw 'error test';
      if (!response.ok) {
        const err = new Error(`HTTP error! status: ${response.status}`);
        span.recordException(err);
        throw err;
      }

      const newTodo = await response.json();
      console.log('✅ Todo created:', newTodo);

      setTodos([...todos, newTodo]);
      setInputValue('');
    } catch (err) {
      span.recordException(err);

      const traceId = span.spanContext().traceId;
      alert(`❌ Todo 建立失敗\nTrace ID: ${traceId}`);
            console.log('traceId:', traceId);

      console.error(err);

      setError(err.message || 'Failed to create todo');
    } finally {
      alert('sss')
      span.end();
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="app-container">
      <h1>📝 Todo App with OpenTelemetry</h1>

      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter todo title..."
          disabled={loading}
          className="todo-input"
        />
        <button 
          onClick={addTodo} 
          disabled={loading}
          className="add-button"
        >
          {loading ? '⏳ Adding...' : '➕ Add Todo'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="todos-list">
        <h2>Your Todos ({todos.length})</h2>
        {todos.length === 0 ? (
          <p className="empty-message">No todos yet. Add one above! 👆</p>
        ) : (
          <ul>
            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <span className="todo-id">#{todo.id}</span>
                <span className="todo-title">{todo.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
