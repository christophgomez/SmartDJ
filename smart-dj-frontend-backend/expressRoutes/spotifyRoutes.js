/* eslint-disable */
const express = require('express');
var request = require('request');
var rp = require('request-promise-native');
var exec = require('child_process').exec;
const Token = require('../models/token');
const User = require('../models/user');
const mongoose = require('mongoose');
const config = require('../config/settings');
const Request = require('../models/request');
const Session = require('../models/listeningSession');

module.exports = function (app, io) {
	var spotifyRoute = express.Router();
	const my_client_id = config.spotifyClientId;
	const my_client_secret = config.spotifyClientSecret;
	const redirect_uri = config.baseURL + config.clientPort + "/success";
	var primary_access_token = app.get('primary_access_token');
	var primary_refresh_token = app.get('primary_refresh_token');
	var temp_access_token;
	var temp_refresh_token;
	var kinect_id;
	var sessionBegan = false;
	var onSecondReq = false;

	/***********************************SOCKET**********************************************/

	io.on('connection', function (socket) {
		console.log('client connected');

		asyncGetPrimaryToken().then((data) => {
			primary_access_token = data;
			socket.emit('token', { token: primary_access_token });
		}).catch((error) => {
			console.log(error);
		});
		
		socket.on('ready', (data) => {
			kinect_id = data.id;
			transferPlayback(kinect_id, primary_access_token);
		});
		
		socket.on('stateChanged', (data) => {
			if (data.state !== null) {
				socket.broadcast.emit('stateChanged', data.state);
				if (data.state.paused === false) {
					if (sessionBegan === false) {
						var new_session = new Session({
							createdAt: Date.now(),
							endedAt: Date.now()
						});
						new_session.save((err) => {
							if (err) {
								console.log(err);
							}
						});
						sessionBegan = true;
					}
				}
				if (data.state.paused === true) {
					if (sessionBegan === true) {
						Session.findOne({}, {}, { sort: { 'createdAt': -1 } }, (err, session) => {
							if (err) {
								console.log(err)
							}
							session.endedAt = Date.now();
							session.save((err) => {
								if (err) console.log(err);
								sessionBegan = false;
							});
						});
					}
				}
			} else {
				if (sessionBegan === true) {
					Session.findOne({}, {}, {
						sort: {
							'createdAt': -1
						}
					}, (err, session) => {
						if (err) {
							console.log(err)
						}
						session.endedAt = Date.now();
						session.save((err) => {
							if (err) console.log(err);
							sessionBegan = false;
						});
					});
				}
			}
		});
	});

	setInterval(() => {
		refreshPrimaryToken();
		refreshAllUserTokens();
	}, 900000);

	/***********************************ROUTES**********************************************/

	spotifyRoute.route('/test').get((req, res) => {
   	console.log('server received test GET');
   	res.send({
      	success: true
   	});
	});

	spotifyRoute.route('/test').post((req, res) => {
		console.log('server received test POST, checking data');
		if (req.body.from === 'Kinect') {
			if (onSecondReq === false) {
				console.log('First kinect request');
				onSecondReq = true;
				return;
			} else {
				onSecondReq = false;
				console.log('Received 2nd request from kinect');
			}
		}
		if (req.body.data) {
			console.log('data: ' + req.body.data);
			return res.send({
				success: true
			});
		} else {
			console.log('No data');
			return res.send({
				success: false
			});
		}
	});

	spotifyRoute.route('/login').get((req, res) => {
		var scopes = 'playlist-read-private playlist-modify-public playlist-modify-private playlist-read-collaborative user-read-private user-read-birthdate user-read-email user-read-playback-state user-read-currently-playing user-modify-playback-state app-remote-control streaming user-top-read user-read-recently-played user-library-read user-library-modify';

		return res.status(200).send({
			success: true,
			redirect: 'https://accounts.spotify.com/authorize' +
				'?response_type=code' +
				'&client_id=' +
				my_client_id +
				(scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
				'&redirect_uri=' + encodeURIComponent(redirect_uri) +
				'&show_dialog=true'
		});
	});

	spotifyRoute.route('/authorize').post((req, res) => {
		var code = req.body.code;

		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(my_client_id + ':' + my_client_secret).toString('base64'))
			},
			json: true
		};
		request.post(authOptions, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				console.log('spotify auth successful');

				if (isFirstUser()) {
					console.log('first user. setting primary access token');
					primary_access_token = body.access_token;
					primary_refresh_token = body.refresh_token;
					var new_token = Token({
						_id: 1,
						access_token: primary_access_token,
						refresh_token: primary_refresh_token
					});
					new_token.save((error) => {
						if (error) console.log(error);
					});
					temp_access_token = body.access_token;
					temp_refresh_token = body.refresh_token;
				} else {
					console.log("not a first user. setting temp access token")
					temp_access_token = body.access_token;
					temp_refresh_token = body.refresh_token;
				}
				return res.status(200).send({
					success: true
				});
			} else {
				console.log(body);
				return res.send({
					success: false
				});
			}
		});
	});

	spotifyRoute.route('/access_token/primary').get((req, res) => {
		if (primary_access_token !== undefined) {
			return res.status(200).send({
				success: true,
				access_token: primary_access_token,
				refresh_token: primary_refresh_token
			});
		} else {
			console.log('getting primary token');
			getPrimaryToken(req).then((data) => {
				primary_access_token = data;
				if (primary_access_token === undefined) {
					return res.send({
						success: false,
					});
				}
				return res.send({
					success: true,
					access_token: primary_access_token,
					refresh_token: primary_refresh_token
				});
			});
		}
	});

	spotifyRoute.route('/access_token/primary').post((req, res) => {
		console.log("updating primary access token");
		primary_access_token = req.body.access_token;
		primary_refresh_token = req.body.refresh_token;
		Token.findById(1, (err, token) => {
			if (err) {
				console.log(err);
				return res.send({
					success: false
				});
			}
			if (!token) {
				console.log("no token yet, creating new token");
				var newToken = new Token({
					_id: 1,
					access_token: primary_access_token,
					refresh_token: primary_refresh_token,
				});
				newToken.save((err) => {
					if (err) {
						console.log("error creating new token");
						return res.send({
							success: false
						});
					}
					console.log("new primary token saved to db");
					return res.send({
						success: true
					});
				})
			} else {
				console.log("token exists in db, updating token");
				token.access_token = primary_access_token;
				token.refresh_token = primary_refresh_token;
				token.save((error) => {
					if (error) {
						console.log("error updating token");
						return res.send({
							success: false
						});
					}
					console.log("token updated");
					return res.send({
						success: true
					});
				})
			}
		});
	});

	spotifyRoute.route('/access_token/primary').delete((req, res) => {
		primary_access_token = undefined;
		primary_refresh_token = undefined;
		Token.findByIdAndRemove(1, (err, data) => {
			if (err) {
				console.log(err);
				return res.send({
					success: false
				});
			}
			else {
				console.log('Primary Access deleted');
				return res.status(200).send({
					success: true,
					message: 'Access token deleted'
				});
			}
		});
	});

	spotifyRoute.route('/access_token/primary/refresh').post((req, res) => {
		Token.findById(1, (error, token) => {
			if (error) console.log(error);
			if (!token) {
				console.log("No primary token");
			} else {
				primary_refresh_token = token.refresh_token;
				console.log("Primary Refresh: " + primary_refresh_token);
				var authOptions = {
					url: 'https://accounts.spotify.com/api/token',
					form: {
						grant_type: 'refresh_token',
						refresh_token: primary_refresh_token
					},
					headers: {
						'Authorization': 'Basic ' + (new Buffer(my_client_id + ':' + my_client_secret).toString('base64'))
					},
					json: true
				};
				request.post(authOptions, function (error, response, body) {
					if (!error && response.statusCode === 200) {

						primary_access_token = body.access_token;
						console.log('Access token refreshed');
						token.access_token = primary_access_token;
						token.refresh_token = primary_refresh_token;
						token.save((err) => {
							if (err) {
								console.log(err);
								return res.send({
									success: false
								});
							}
							else {
								return res.status(200).send({
									success: true,
								});
							}
						})
					} else {
						console.log(body);
						return res.send({
							success: false
						});
					}
				});
			}
		})
	});

	spotifyRoute.route('/access_token/temp').get((req, res) => {
		if (temp_access_token !== undefined) {
			return res.status(200).send({
				success: true,
				access_token: temp_access_token,
				refresh_token: temp_refresh_token
			});
		} else {
			return res.send({
				success: false
			});
		}
	});

	spotifyRoute.route("/access_token/temp").delete((req, res) => {
		temp_access_token = undefined;
		temp_refresh_token = undefined;
		return res.send({
			success: true
		});
	});

	spotifyRoute.route('/kinect/currently_playing').get((req, res) => {
		return getCurrentPlaying(primary_access_token, res);
	});

	spotifyRoute.route('/kinect/devices').get((req, res) => {
		return getDevices(primary_access_token, res);
	});

	spotifyRoute.route('/kinect/player').post((req, res) => {
		exec('open -a "Google Chrome" ./webPlayer.html', () => {
			return res.status(200).send({
				success: true,
				message: 'child process created'
			});
		});
	});

	spotifyRoute.route('/kinect/script').post((req, res) => {
		exec('DiscreteGestureBasics-WPF.exe', () => {
			return res.status(200).send({
				success: true,
				message: 'child process created'
			});
		});
	});

	spotifyRoute.route('/kinect/script').get((req, res) => {
		if (isRunning('KinectService.exe', "KinectService", "KinectService") !== false) {
			return res.send({
				success: true,
			});
		} else {
			return res.send({
				success: false
			});
		}
	});

	function isRunning(win, mac, linux) {
		return new Promise(function (resolve, reject) {
			const plat = process.platform
			const cmd = plat == 'win32' ? 'tasklist' : (plat == 'darwin' ? 'ps -ax | grep ' + mac : (plat == 'linux' ? 'ps -A' : ''))
			const proc = plat == 'win32' ? win : (plat == 'darwin' ? mac : (plat == 'linux' ? linux : ''))
			if (cmd === '' || proc === '') {
				resolve(false)
			}
			exec(cmd, function (err, stdout, stderr) {
				resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1)
			})
		})
	}


	spotifyRoute.route('/kinect/device_id').post((req, res) => {
		kinect_id = req.body.id;
		return res.status(204).send({
			success: true
		});
	});

	spotifyRoute.route('/kinect/transfer').put((req, res) => {
		if (transferPlayback(kinect_id, primary_access_token)) {
			return res.send({
				success: true
			});
		} else {
			return res.send({
				success: false
			});
		}
	});

	spotifyRoute.route('/kinect/play').put((req, res) => {
		/*if (req.body.from === 'Kinect') {
			if (onSecondReq === false) {
				console.log('First kinect request');
				onSecondReq = true;
				return;
			} else {
				onSecondReq = false;
				console.log('Received 2nd request from kinect');
			}
		}*/
		var received = Date.now();
		play(primary_access_token, res);
		var executed = Date.now();
		var new_request = new Request({
			from: req.body.from,
			endpoint: 'play',
			time: {
				created: req.body.timestamp,
				received: received,
				executed: executed,
				totalTime: executed - req.body.timestamp
			}
		});
		new_request.save((error) => {
			if (error) {
				console.log(error);
				return;
			}
		});
	})

	spotifyRoute.route('/kinect/pause').put((req, res) => {
		/*if (req.body.from === 'Kinect') {
			if (onSecondReq === false) {
				console.log('First kinect request');
				onSecondReq = true;
				return;
			} else {
				onSecondReq = false;
				console.log('Received 2nd request from kinect');
			}
		}*/
		var received = Date.now();
		pause(primary_access_token, res);
		var executed = Date.now();
		var new_request = new Request({
			from: req.body.from,
			endpoint: 'pause',
			time: {
				created: req.body.timestamp,
				received: received,
				executed: executed,
				totalTime: executed - req.body.timestamp
			}
		});
		new_request.save((error) => {
			if (error) {
				console.log(error);
				return;
			}
		});
	})
	
	spotifyRoute.route('/kinect/next').post((req, res) => {
		/*if (req.body.from === 'Kinect') {
			if (onSecondReq === false) {
				console.log('First kinect request');
				onSecondReq = true;
				return;
			} else {
				onSecondReq = false;
				console.log('Received 2nd request from kinect');
			}
		}*/
		var received = Date.now();
		next(primary_access_token, res);
		var executed = Date.now();
		var new_request = new Request({
			from: req.body.from,
			endpoint: 'next',
			time: {
				created: req.body.timestamp,
				received: received,
				executed: executed,
				totalTime: executed - req.body.timestamp
			}
		});
		new_request.save((error) => {
			if (error) {
				console.log(error);
				return;
			}
		});
	});

	spotifyRoute.route('/kinect/prev').post((req, res) => {
		/*if (req.body.from === 'Kinect') {
			if (onSecondReq === false) {
				console.log('First kinect request');
				onSecondReq = true;
				return;
			} else {
				onSecondReq = false;
				console.log('Received 2nd request from kinect');
			}
		}*/
		var received = Date.now();
		prev(primary_access_token, res);
		var executed = Date.now();
		var new_request = new Request({
			from: req.body.from,
			endpoint: 'prev',
			time: {
				created: req.body.timestamp,
				received: received,
				executed: executed,
				totalTime: executed - req.body.timestamp
			}
		});
		new_request.save((error) => {
			if (error) {
				console.log(error);
				return;
			}
		});
	});

	spotifyRoute.route('/kinect/shuffle').put((req, res) => {
		if (req.body.from === 'Kinect') {
			if (onSecondReq === false) {
				console.log('First kinect request');
				onSecondReq = true;
				return;
			} else {
				onSecondReq = false;
				console.log('Received 2nd request from kinect');
			}
		}
		var received = Date.now();
		shuffle(req.body.shuffle, primary_access_token, res);
		var executed = Date.now();
		var new_request = new Request({
			from: req.body.from,
			endpoint: 'shuffle',
			time: {
				created: req.body.timestamp,
				received: received,
				executed: executed,
				totalTime: executed - req.body.timestamp
			}
		});
		new_request.save((error) => {
			if (error) {
				console.log(error);
				return;
			}
		});
	});

	spotifyRoute.route('/kinect/repeat').put((req, res) => {
		if (req.body.from === 'Kinect') {
			if (onSecondReq === false) {
				console.log('First kinect request');
				onSecondReq = true;
				return;
			} else {
				onSecondReq = false;
				console.log('Received 2nd request from kinect');
			}
		}
		var received = Date.now();
		repeat(req.body.type, primary_access_token, res);
		var executed = Date.now();
		var new_request = new Request({
			from: req.body.from,
			endpoint: 'repeat',
			time: {
				created: req.body.timestamp,
				received: received,
				executed: executed,
				totalTime: executed - req.body.timestamp
			}
		});
		new_request.save((error) => {
			if (error) {
				console.log(error);
				return;
			}
		});
	});

	spotifyRoute.route('/kinect/volume').put((req, res) => {
		if (req.body.from === 'Kinect') {
			if (onSecondReq === false) {
				console.log('First kinect request');
				onSecondReq = true;
				return;
			} else {
				onSecondReq = false;
				console.log('Received 2nd request from kinect');
			}
		}
		var received = Date.now();
		setVolume(req.body.volumePercent, primary_access_token, res);
		var executed = Date.now();
		var new_request = new Request({
			from: req.body.from,
			endpoint: 'volume',
			time: {
				created: req.body.timestamp,
				received: received,
				executed: executed,
				totalTime: executed - req.body.timestamp
			}
		});
		new_request.save((error) => {
			if (error) {
				console.log(error);
				return;
			}
		});
	})

	spotifyRoute.route('/user/:token').get((req, res) => {
		return getProfile(req.params.token, res);
	});

	spotifyRoute.route('/user/transfer').put((req, res) => {
		if (transferPlayback(req.body.id, {
				access_token: req.body.access_token
			})) {
			return res.send({
				success: true
			});
		} else {
			return res.send({
				success: false
			});
		}
	})

	spotifyRoute.route('/user/devices/:token').get((req, res) => {
		return getDevices(req.params.token, res);
	});

	spotifyRoute.route('/user/currently_playing/:token').get((req, res) => {
		return getCurrentPlaying(req.params.token, res);
	});

	spotifyRoute.route('/user/top_artists/:token').get((req, res) => {
		return getTopArtists(req.params.token, res);
	});

	spotifyRoute.route('/user/play').put((req, res) => {
		return play(req.body.access_token, res);
	})

	spotifyRoute.route('/user/pause').put((req, res) => {
		return pause(req.body.access_token, res);
	})

	spotifyRoute.route('/user/next').post((req, res) => {
		return next(req.body.access_token, res);
	});

	spotifyRoute.route('/user/prev').post((req, res) => {
		return prev(req.body.access_token, res);
	});


	/***********************************END ROUTES**********************************************/


	/***********************************HELPERS**********************************************/

	function getProfile(token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			url: 'https://api.spotify.com/v1/me',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			json: true
		};

		request.get(options, function (error, response, body) {
			if (error) {
				console.log(error);
				return res.send({
					success: false
				});
			}
			if (!error && response.statusCode === 200) {
				return res.send({
					success: true,
					fullProfileResponse: body,
					birthday: body.birthdate,
					name: body.display_name,
					email: body.email,
					url: body.external_urls.spotify,
					followerTotal: body.followers.total,
					type: body.product,
				});
			} else {
				console.log(body);
				return res.send({
					success: false
				});
			}
		});
	}

	function getCurrentPlaying(token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			url: "https://api.spotify.com/v1/me/player/currently-playing",
			headers: {
				'Authorization': 'Bearer ' + token
			},
			json: true
		};
		request.get(options, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				//console.log(body);
				console.log('user playing: ' + body.item);
				return res.status(200).send({
					success: true,
					is_playing: body.is_playing,
					object: body
				});
			} else if (!error && response.statusCode === 204) {
				console.log("User not playing anything");
				return res.status(200).send({
					success: true,
					is_playing: false,
					object: null
				});
			} else {
				console.log(body);
				return res.send({
					success: false
				});
			}
		});
	}

	function getTopArtists(token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			url: "https://api.spotify.com/v1/me/top/artists",
			headers: {
				'Authorization': 'Bearer ' + token,
			},
			json: true
		};
		request.get(options, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				//console.log(body);
				return res.status(200).send({
					success: true,
					artists: body.items
				})
			} else {
				console.log(body);
				return res.send({
					success: false
				});
			}
		});
	}

	function getDevices(token, res) {
		var options;
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		options = {
			url: "https://api.spotify.com/v1/me/player/devices",
			headers: {
					'Authorization': 'Bearer ' + token,
			},
			json: true
		}
		request.get(options, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				return res.send({
					success: true,
					devices: body.devices
				});
			} else {
				console.log(body);
				return res.send({
					success: false
				});
			}
		});
	}

	function transferPlayback(id, token) {
		if (token === undefined) {
			return false;
		}
		var options = {
			url: "https://api.spotify.com/v1/me/player",
			body: {
				'device_ids': [
					id
				],
				'play': true
			},
			headers: {
				'Authorization': 'Bearer ' + token
			},
			json: true
		};
		request.put(options, (error, response, body) => {
			if (!error && response.statusCode === 204) {
				console.log('playback started on webplayer');
				return true;
			} else {
				console.log(body);
				return false;
			}
		});
	}

	async function play(token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			method: `PUT`,
			uri: "https://api.spotify.com/v1/me/player/play",
			headers: {
				'Authorization': 'Bearer ' + token,
			},
			json: true
		};
		try {
			await rp(options);
			console.log('Play');
			res.send({
				success: true
			});
		} catch(error) {
			console.log(error);
			Promise.reject(error);
			res.send({
				success: false
			});
		}
		/*request.put(options, (error, response, body) => {
			if (!error && response.statusCode === 204) {
				console.log('Play');
				res.send({
					success: true
				});
			} else {
				console.log(body);
				res.send({
					success: false
				});
			}
		});*/
	}

	async function pause(token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			method: `PUT`,
			uri: "https://api.spotify.com/v1/me/player/pause",
			headers: {
				"Authorization": 'Bearer ' + token,
			},
			json: true
		};
		try {
			await rp(options);
			console.log('Pause');
			res.send({
				success: true
			});
		} catch (error) {
			console.log(error);
			Promise.reject(error);
			res.send({
				success: false
			});
		}
		/*request.put(options, (error, response, body) => {
			if (!error && response.statusCode === 204) {
				console.log('Pause');
				res.send({
					success: true
				});
			} else {
				console.log(body);
				res.send({
					success: false
				});
			}
		});*/
	}

	async function next(token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			method: `POST`,
			uri: "https://api.spotify.com/v1/me/player/next",
			headers: {
				'Authorization': 'Bearer ' + token,
			},
			json: true
		};
		try {
			await rp(options);
			console.log('Skipped Track');
			res.send({
				success: true
			});
		} catch (error) {
			console.log(error);
			Promise.reject(error);
			res.send({
				success: false
			});
		}
		/*request.post(options, (error, response, body) => {
			if (!error && response.statusCode === 204) {
				console.log('Skipped Track');
				res.send({
					success: true
				});
			} else {
				console.log(body);
				res.send({
					success: false
				});
			}
		});*/
	}

	async function prev(token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			method: `POST`,
			uri: "https://api.spotify.com/v1/me/player/previous",
			headers: {
				'Authorization': 'Bearer ' + token,
			},
			json: true
		};
		try {
			await rp(options);
			res.send({
				success: true
			});
		} catch (error) {
			console.log(error);
			Promise.reject(error);
			res.send({
				success: false
			});
		}
		/*request.post(options, (error, response, body) => {
			if (!error && response.statusCode === 204) {
				console.log('Skipped Track Back');
				res.send({
					success: true,
				});
			} else {
				console.log(body);
				res.send({
					success: false
				});
			}
		});*/
	}

	async function shuffle(trueOrFalse, token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			method: `PUT`,
			uri: "https://api.spotify.com/v1/me/player/shuffle?state=" + trueOrFalse,
			headers: {
				'Authorization': 'Bearer ' + token,
			},
			json: true
		};
		try {
			await rp(options);
			console.log('Shuffling: ' + trueOrFalse);
			res.send({
				success: true
			});
		} catch (error) {
			console.log(error);
			Promise.reject(error);
			res.send({
				success: false
			});
		}
		/*request.put(options, (error, response, body) => {
			if (!error && response.statusCode === 204) {
				console.log('Shuffling: ' + trueOrFalse);
				res.send({
					success: true
				});
			} else {
				console.log(body);
				res.send({
					success: false
				});
			}
		});*/
	}

	async function repeat(trackContextOff, token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			method: `PUT`,
			uri: "https://api.spotify.com/v1/me/player/repeat?state=" + trackContextOff,
			headers: {
				'Authorization': 'Bearer '+token
			},
			json: true
		};
		try {
			await rp(options);
			console.log('Repeat: ' + trackContextOff);
			res.send({
				success: true
			});
		} catch (error) {
			console.log(error);
			Promise.reject(error);
			res.send({
				success: false
			});
		}
		/*request.put(options, (error, response, body) => {
			if (!error && response.statusCode === 204) {
				console.log('Repeat: ' + trackContextOff);
				res.send({
					success: true
				});
			} else {
				console.log(body);
				res.send({
					success: false
				});
			}
		});*/
	}

	async function setVolume(volumePercent, token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			method: `PUT`,
			uri: "https://api.spotify.com/v1/me/player/volume?volume_percent="+volumePercent,
			headers: {
				'Authorization': 'Bearer ' + token
			},
			json: true
		};
		try {
			await rp(options);
			console.log("Volume set to: " + volumePercent);
			res.send({
				success: true
			});
		} catch (error) {
			console.log(error);
			Promise.reject(error);
			res.send({
				success: false
			});
		}
		/*request.put(options, (error, response, body) => {
			if (!error && response.statusCode === 204) {
				console.log("Volume set to: " + volumePercent);
				res.send({
					success: true
				});
			} else {
				console.log(body);
				res.send({
					success: false,
				});
			}
		});*/
	}
	
	async function getPrimaryToken(req) {
		var token = req.app.get('primary_access_token');
		if (token === undefined) {
			const response = await asyncGetPrimaryToken();
			return response;
		} else {
			return token;
		}
	}

	async function asyncGetPrimaryToken() {
		try {
			const token = await Token.findById(1).exec();
			return token.access_token;
		} catch (err) {
			console.log("something went wrong getting primary access token");
		}
	}

	async function getPrimaryRefresh(req) {
		var token = req.app.get('primary_refresh_token');
		if (token === undefined) {
			const response = asyncGetPrimaryRefresh();
			return response;
		} else {
			return token;
		}
	}

	async function asyncGetPrimaryRefresh() {
		try {
			const token = await Token.findById(1).exec();
			return token.refresh_token;
		} catch (err) {
			console.log("something went wrong getting primary refresh token");
		}
	}

	function refreshAllUserTokens() {
		User.find({}, (err, users) => {
			if (err) console.log(err);
			if (!users) console.log('No users to refresh tokens');
			else {
				for (var i = 0; i < users.length; ++i) {
					(function (i) {
						var authOptions = {
							url: 'https://accounts.spotify.com/api/token',
							form: {
								grant_type: 'refresh_token',
								refresh_token: users[i].refresh_token
							},
							headers: {
								'Authorization': 'Basic ' + (new Buffer(my_client_id + ':' + my_client_secret).toString('base64'))
							},
							json: true
						};
						request.post(authOptions, function (error, response, body) {
							if (!error && response.statusCode === 200) {
								console.log('User access token refreshed');
								users[i].access_token = body.access_token;
								users[i].save((err) => {
									if (err) console.log(err);
									else {
										console.log('user token saved');
									}
								});
							} else {
								console.log('user refresh unsuccessful');
								console.log(body);
							}
						});
					})(i);
				}
			}
		});
	}

	function refreshPrimaryToken() {
		console.log('refreshing primary token in spotify routes');
		Token.findById(1, (err, token) => {
			if (err) console.log(err);
			if (!token) console.log('no primary token to refresh');
			else {
				var authOptions = {
					url: 'https://accounts.spotify.com/api/token',
					form: {
						grant_type: 'refresh_token',
						refresh_token: token.refresh_token
					},
					headers: {
						'Authorization': 'Basic ' + (new Buffer(my_client_id + ':' + my_client_secret).toString('base64'))
					},
					json: true
				};
				request.post(authOptions, function (error, response, body) {
					if (!error && response.statusCode === 200) {

						primary_access_token = body.access_token;
						console.log('Access token refreshed');
						token.access_token = primary_access_token;
						token.save((err) => {
							if (err) console.log(err);
							else {
								console.log('primary token saved');
							}
						});
					} else {
						console.log('primary refresh unsuccessful');
						console.log(body);
					}
				});
			}
		});
	}

	function isFirstUser() {
		const db = mongoose.connection;
		db.collection('users').countDocuments((err, count) => {
			if (err) {
				console.log(err);
			}
			if (count >= 1) {
				return false;
			} else {
				return true;
			}
		});
	}

	/***********************************END HELPERS**********************************************/


	return spotifyRoute;
}