/* eslint-disable */
let {
	PythonShell
} = require('python-shell');

class Python {
	constructor(scriptPath, args) {
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
		this.pyScript.terminate();
	}
}

module.exports.Python = Python;