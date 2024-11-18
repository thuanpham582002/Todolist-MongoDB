const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://my-user:password@mongodb-cluster-svc.default.svc.cluster.local/todolist?replicaSet=mongodb-cluster&retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Add connection error handling
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  // Implement retry logic or failover handling
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  // Implement reconnection logic
});

// Todo Model
const todoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes
app.get('/api/todos', async (req, res) => {
  console.log('GET /api/todos');
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/todos', async (req, res) => {
  console.log('POST /api/todos', req.body);
  const todo = new Todo({
    text: req.body.text,
    completed: false
  });

  try {
    const newTodo = await todo.save();
    console.log('New todo created:', newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error.message);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  console.log(`PUT /api/todos/${req.params.id}`);
  try {
    const todo = await Todo.findById(req.params.id);
    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    console.log('Todo updated:', updatedTodo);
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error.message);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  console.log(`DELETE /api/todos/${req.params.id}`);
  try {
    await Todo.findByIdAndDelete(req.params.id);
    console.log('Todo deleted:', req.params.id);
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    console.error('Error deleting todo:', error.message);
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});