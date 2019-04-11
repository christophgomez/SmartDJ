/*eslint-disable*/
const express = require('express');
const SpotifyFunctions = require('./SpotifyFunctions');
const Token = require('../models/token');
const Python = require("./PythonFunctions");
const pythonRoute = express.Router();
var detectionArgs = ['computer-vision/proto.prototxt.txt', 'computer-vision/cafe.caffemodel'];
var detection = null;
var access;

pythonRoute.route('/start').post((req, res) => {
	Token.findById(1, (err, token) => {
		if (err) console.log(err);
		if (!token) console.log('token null');
		else {
			if (detection !== null)
				return;
			else {
				detection = new Python("computer-vision/detection.py", detectionArgs);
				access = token.access_token
				var callback = function (data) {
					if (data == 1) {
						console.log('Script Detected Vicky Gesture');
						SpotifyFunctions.nextS(access);
					}
				}
				detection.startScript(callback);
			}
		}
	});
	res.send({
		success: true
	});
});

pythonRoute.route('/end').post((req, res) => {
	if (detection !== null) {
		console.log("killing detection script");
		detection.killScript();
		detection = null;
	}	
	res.send({
		success: true
	});
});

module.exports = pythonRoute;