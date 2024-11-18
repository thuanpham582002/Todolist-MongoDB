import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Get the API URL from environment variable or use a default
const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.106.3:30000';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    console.log('Fetching todos on component mount');
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos from API');
      const response = await axios.get(`${API_URL}/api/todos`);
      setTodos(response.data);
      console.log('Todos fetched successfully:', response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      console.log('Input text is empty, not adding todo');
      return;
    }
    try {
      console.log('Adding new todo:', inputText);
      await axios.post(`${API_URL}/api/todos`, { text: inputText });
      setInputText('');
      console.log('Todo added successfully');
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      console.log('Toggling todo with id:', id);
      await axios.put(`${API_URL}/api/todos/${id}`);
      console.log('Todo toggled successfully');
      fetchTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      console.log('Deleting todo with id:', id);
      await axios.delete(`${API_URL}/api/todos/${id}`);
      console.log('Todo deleted successfully');
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add a new todo"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              onClick={() => toggleTodo(todo._id)}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
