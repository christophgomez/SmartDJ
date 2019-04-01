/*eslint-disable*/
const express = require('express');
const proc = require("child_process");
const pythonRoute = express.Router();

var pyScript;

pythonRoute.route('/start').post((req, res) => {
	startScript();
	res.send({
		success: true
	});
});

pythonRoute.route('/end').post((req, res) => {
	killScript();
	res.send({
		success: true
	});
});

function startScript() {
	pyScript = proc.spawn('python3', ["computer-vision/detection.py", "computer-vision/proto.prototxt.txt", "computer-vision/cafe.caffemodel"]);
	pyScript.stdout.on('data', function (data) {
		command = data.toString();
		if (command == 1) {
			console.log("SERVER: OpenCV sees someone looking at the screen! \n")
		}
		// console.log(data.toString());
	});
}

function killScript() {
	pyScript.kill('SIGKILL');
}

module.exports = pythonRoute;