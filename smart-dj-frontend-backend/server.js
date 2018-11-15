/* eslint-disable */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

// Set up the app
const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

// Set up MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/users');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoose connection error'));
db.once('open', function (callback) {
	console.log('mongoose connection succeeded');
});

const spotifyRoutes = require('./expressRoutes/spotifyRoutes.js');
app.use('/spotify', spotifyRoutes);
const userRoutes = require('./expressRoutes/userRoutes.js');
app.use('/users', userRoutes);

// Set up the server to listen for connections
const server = http.createServer(app);

var port = 8081;

// Listen for connections to the port
server.listen(port, () => console.log('Server listening on port ' + port));