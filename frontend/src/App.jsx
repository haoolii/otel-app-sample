import { useState } from 'react';
import './App.css';
import './otel';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTodo = async () => {
    if (!inputValue.trim()) {
      alert('Please enter a todo title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: inputValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newTodo = await response.json();
      console.log('✅ Todo created:', newTodo);

      setTodos([...todos, newTodo]);
      setInputValue('');
    } catch (err) {
      console.error('❌ Error creating todo:', err);
      setError(err.message || 'Failed to create todo');
    } finally {
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
      <h1>📝 Todo App with OpenTelemetry 12345</h1>

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