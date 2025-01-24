const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();
// middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/', invoiceRoutes);

// catch 404 Errors
app.use((req, res, next) => {
  res.status(404).send(`<h1>Page Not Found</h1>`);
});


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));


module.exports = app;
