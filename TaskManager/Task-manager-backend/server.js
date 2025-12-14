const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.send('Task Manager Backend запрацював!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('http://localhost:3000');
});

const path = require('path'); 
app.use('/static', express.static(path.join(__dirname, '..', 'WEB', 'static')));
