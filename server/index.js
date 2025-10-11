const express = require('express');
const cors = require('cors'); // 1. Import cors
require('dotenv').config();
const connectDB = require('./config/db');
const Task = require('./models/TaskModel');

connectDB();

const app = express();
app.use(cors()); // 2. Use cors middleware
app.use(express.json()); // <-- This line is crucial for reading JSON from requests
app.use(express.static('public'));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

// @desc    Fetch the next available task for annotation
// @route   GET /api/tasks/next
app.get('/api/tasks/next', async (req, res) => {
  try {
    const availableTask = await Task.findOne({ status: 'pending_annotation' });

    if (!availableTask) {
      return res.status(404).json({ message: 'No available tasks at the moment.' });
    }
    
    // This is a temporary find and update. We will improve this logic later.
    const task = await Task.findByIdAndUpdate(
      availableTask._id, 
      { status: 'in_progress' }, 
      { new: true } // This option returns the document after the update
    );

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// ... (after the GET endpoint)

// @desc    Update a task with correction data
// @route   PUT /api/tasks/:id
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { correctedText, gender, ageRange } = req.body;
    const taskId = req.params.id;

    // Find the task by its ID and update it
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        correctedText,
        gender,
        ageRange,
        status: 'pending_verification', // The task is now waiting for verification
      },
      { new: true } // This option returns the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(updatedTask); // Send back the updated task as confirmation
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});