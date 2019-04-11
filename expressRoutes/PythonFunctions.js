/* eslint-disable */
let {
	PythonShell
} = require('python-shell');

class Python {
	constructor(scriptPath, args) {
		this.pyScript = null;
		this.scriptPath = scriptPath;
		this.args = args;
	}
	async startScript(callback) {
		let options = {
			mode: 'text',
			pythonOptions: ['-u'], // get print results in real-time
			args: this.args
		};
		this.pyScript = new PythonShell(this.scriptPath, options);
		this.pyScript.on('message', function (data) {
			callback(data);
			// console.log(data.toString());
		});

	}
	killScript() {
		this.pyScript.
		this.pyScript.end(function (err, code, signal) {
			if (err) {
				throw err;
			}
			console.log('The exit code was: ' + code);
			console.log('The exit signal was: ' + signal);
			console.log('finished');
			console.log('finished');
		});
	}
}

module.exports = Python;