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

const routes = require('./routes.js');
app.use('/spotifyApi', routes);

// Set up the server to listen for connections
const server = http.createServer(app);

var port = 8081;

// Listen for connections to the port
server.listen(port, () => console.log('Server listening on port ' + port));