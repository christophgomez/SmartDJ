/*eslint-disable*/
const express = require('express');
const SpotifyFunctions = require('./SpotifyFunctions');
const Python = require("./PythonFunctions").Python;
const pythonRoute = express.Router();
var exec = require('child_process').exec;
var detectionArgs = ['computer-vision/proto.prototxt.txt', 'computer-vision/cafe.caffemodel'];
var base64img = require('base64-img');
const fs = require('fs');
var isLinux = process.platform === "linux";

module.exports = function (app, detection, voice, voiceConstructor, detectionConstructor, io) {
	var image_path;
	io.on('connection', (socket) => {
		socket.on("image", (data) => {
			// console.log('received image from server');
			base64img.img(data.image, '', '1', function (err, filepath) {
				image_path = filepath;
				var gestureArgs = [image_path];
				var cb = function (data) {
					console.log(data);
					if (data == 1) {
						SpotifyFunctions.nextS(app.settings.primary_access_token);
					}
				}
				var gesture = new Python('./computer-vision/gestureCheck.py', gestureArgs);
				// console.log("starting script");
				startScript(gesture, cb);
			});
			
		});
	});
	voice = new Python(voiceConstructor.scriptPath, voiceConstructor.args);
	detection = new Python(detectionConstructor.scriptPath, detectionConstructor.args);
	var token = app.settings.primary_access_token;
	var callback1 = function (data) {
		if (data == 1) {
			//console.log('Script Detected Vicky Gesture');
			//SpotifyFunctions.nextS(token);
		}
	}
	var callback2 = function (data) {
		if (data == 1) {
			// console.log("User said play");
			SpotifyFunctions.playS(token);
		} else if (data == 2) {
			// console.log("User said pause");
			SpotifyFunctions.pauseS(token);
		}
	}
	startScript(detection, callback1);
	startScript(voice, callback2);
	var web_player;
	if(isLinux)
		web_player = exec('google-chrome ./webPlayer.html');
	else
		web_player = exec('open -a "Google Chrome" ./webPlayer.html');

	pythonRoute.route('/startVideo').post((req, res) => {
		detection = new Python("computer-vision/detection.py", detectionArgs);
		token = app.settings.primary_access_token;
		var callback1 = function (data) {
			if (data == 1) {
				//console.log('Script Detected Vicky Gesture');
				//SpotifyFunctions.nextS(token);
			}
		}
		var callback2 = function (data) {
			if (data == 1) {
				console.log("User said play");
				SpotifyFunctions.playS(token);
			} else if (data == 2) {
				console.log("user said pause");
				SpotifyFunctions.pauseS(token);
			}
		}
		if (isLinux)
			web_player = exec('google-chrome ./webPlayer.html');
		else
			web_player = exec('open -a "Google Chrome" ./webPlayer.html');
		startScript(detection, callback1);
		startScript(voice, callback2)
		res.send({
			success: true
		});
	});

	pythonRoute.route('/endVideo').post((req, res) => {
		console.log("recieved kill switch");
		if (detection !== null) {
			console.log("killing detection script");
			web_player.kill();
			web_player = null;
			endScript(detection);
			endScript(voice);
			detection = null;
		}
		res.send({
			success: true
		});
	});

	async function startScript(detection, callback) {
		await detection.startScript(callback);
	}

	async function endScript(detection) {
		await detection.killScript();
	}
	return pythonRoute;
}