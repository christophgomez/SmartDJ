/*eslint-disable*/
const express = require('express');
const SpotifyFunctions = require('./SpotifyFunctions');
const Python = require("./PythonFunctions").Python;
const pythonRoute = express.Router();
var exec = require('child_process').exec;
var detectionArgs = ['computer-vision/proto.prototxt.txt', 'computer-vision/cafe.caffemodel'];

module.exports = function (app, detection, voice, voiceConstructor, detectionConstructor) {
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
			console.log("User said play");
			SpotifyFunctions.playS(token);
		} else if (data == 2) {
			console.log("User said pause");
			SpotifyFunctions.pauseS(token);
		}
	}
	startVideo(detection, callback1);
	startVideo(voice, callback2);
	var web_player = exec('open -a "Google Chrome" ./webPlayer.html');
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
		web_player = exec('open -a "Google Chrome" ./webPlayer.html');
		startVideo(detection, callback1);
		startVideo(voice, callback2)
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
			endVideo(detection);
			endVideo(voice);
			detection = null;
		}
		res.send({
			success: true
		});
	});

	async function startVideo(detection, callback) {
		await detection.startScript(callback);
	}

	async function endVideo(detection) {
		await detection.killScript();
	}
	return pythonRoute;
}