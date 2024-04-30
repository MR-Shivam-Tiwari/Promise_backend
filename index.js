const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserR = require('./Routes/UserR');
const Signinroutes = require('./Routes/Signinroutes');
const AddTask = require('./Routes/AddTask');
const TaskGroup = require('./Routes/Tasks');
const TGroupR = require('./Routes/TGroupR');
const ForgetPassword = require('./Routes/Forgotpassword');
const ResetPassword = require('./Routes/Resetpassword');

const app = express();
const PORT = 5000;

// MongoDB connection
mongoose.connect('mongodb+srv://Promise:Promise@cluster0.iufeasi.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Database connected successfully"))
.catch(err => {
    console.error("Database connection error", err);
    process.exit(1); // Exit the process if connection fails
});

// Middleware
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

const corsOptions = {
  origin: '*', // Change '*' to a specific origin or list of origins allowed to access your server
  credential: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify HTTP methods allowed
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  optionsSuccessStatus: 200, // Return successful status code for preflight requests
};

app.use(cors(corsOptions));

// Routes
app.use('/api', UserR);
app.use('/api', Signinroutes);
app.use('/api', AddTask);
app.use('/api', TaskGroup);
app.use('/api', TGroupR);
app.use('/api', ForgetPassword);
app.use('/api', ResetPassword);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
