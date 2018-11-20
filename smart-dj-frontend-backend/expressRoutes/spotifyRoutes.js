/* eslint-disable */
const express = require('express');
var request = require('request');
var exec = require('child_process').exec;
const Token = require('../models/token');
const User = require('../models/user');
const mongoose = require('mongoose');

module.exports = function (app, io) {
	var spotifyRoute = express.Router();
	const my_client_id = "c59420679278498bbd4186dd101f3f04";
	const my_client_secret = "59803c9ee3eb43858252938d3d945713";
	const redirect_uri = "http://chrisbook.local:8080/success";
	var primary_access_token = app.get('primary_access_token');
	var primary_refresh_token = app.get('primary_refresh_token');
	var temp_access_token;
	var temp_refresh_token;
	var kinect_id;

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
			socket.broadcast.emit('stateChanged', data.state);
		});

	});

	setInterval(() => {
		refreshPrimaryToken();
		refreshAllUserTokens();
	}, 300000);

	/***********************************ROUTES**********************************************/

	spotifyRoute.route('/test').get((req, res) => {
   	console.log('server received test GET');
   	res.send({
      	success: true
   	});
	});

	spotifyRoute.route('/login').get((req, res) => {
		var scopes = 'playlist-read-private playlist-modify-public playlist-modify-private playlist-read-collaborative user-read-private user-read-birthdate user-read-email user-read-playback-state user-read-currently-playing user-modify-playback-state app-remote-control streaming user-top-read user-read-recently-played user-library-read user-library-modify';

		return res.status(200).send({
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
			if (err) console.log(err);
			else {
				console.log('Primary Access deleted');
				return res.status(200).send({
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
						console.log('primary access_token: ' + primary_access_token);
						console.log('primary refresh_token: ' + primary_refresh_token);
						token.access_token = primary_access_token;
						token.refresh_token = primary_refresh_token;
						token.save((err) => {
							if (err) console.log(err);
							else {
								return res.status(200).send({
									msg: 'refresh successful',
								});
							}
						})
					} else {
						console.log(response.statusCode);
						console.log(response.body.error_description);
						console.log('primary refresh unsuccessful');
					}
				});
			}
		})
	});

	spotifyRoute.route('/access_token/temp').get((req, res) => {
		console.log("checking temp access token");
		if (temp_access_token !== undefined) {
			console.log("Temp: " + temp_access_token);
			return res.status(200).send({
				success: true,
				access_token: temp_access_token,
				refresh_token: temp_refresh_token
			});
		} else {
			console.log("temp undefined");
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
	})

	spotifyRoute.route('/access_token/temp/refresh').post((req, res) => {
		console.log('refreshing temp token');
		temp_refresh_token = req.body.refresh_token;
		return refreshToken(temp_refresh_token, res);
	});

	spotifyRoute.route('/profile/:token').get((req, res) => {
		return getProfile(req.params.token, res);
	});

	spotifyRoute.route('/player').get((req, res) => {
		exec('open -a "Google Chrome" ./webPlayer.html', () => {
			return res.status(200).send({
				message: 'child process created'
			});
		});
	});

	spotifyRoute.route('/transfer/kinect').put(() => {
		transferPlayback(kinect_id, primary_access_token);
	});

	spotifyRoute.route('/transfer/other_device').put((req) => {
		transferPlayback(req.body.id, { access_token: req.body.access_token });
	})

	spotifyRoute.route('/device_id').post((req, res) => {
		kinect_id = req.body.id;
		return res.status(204).send();
	});

	spotifyRoute.route('/devices/primary').get((req, res) => {
		return getDevices(primary_access_token, res);
	});

	spotifyRoute.route('/devices/user').get((req, res) => {
		return getDevices(req.body.access_token, res);
	});

	spotifyRoute.route('/currently_playing/user/:token').get((req, res) => {
		console.log('getting currently playing');
		return getCurrentPlaying(req.params.token, res);
	});

	spotifyRoute.route('/currently_playing/primary').get((req, res) => {
		console.log('getting currently playing');
		return getCurrentPlaying(primary_access_token, res);
	});

	spotifyRoute.route('/top_artists/user/:token').get((req, res) => {
		return getTopArtists(req.params.token, res);
	});

	spotifyRoute.route('/next/user').post((req, res) => {
		return next(req.body.access_token, res);
	});

	spotifyRoute.route('/prev/user').post((req, res) => {
		return prev(req.body.access_token, res);
	});

	spotifyRoute.route('/next/kinect').post((req, res) => {
		return next(primary_access_token, res);
	});

	spotifyRoute.route('/prev/kinect').post((req, res) => {
		return prev(primary_access_token, res);
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
				return res.send({
					error: error
				});
			}
			if (!error && response.statusCode === 200) {
				return res.send({
					success: true,
					birthday: body.birthdate,
					name: body.display_name,
					email: body.email,
					url: body.external_urls.spotify,
					followers: body.followers.total,
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
					item: null
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
				//console.log("error getting top artists");
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
				return;
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
			} else {
				console.log(body);
			}
		});
	}

	function next(token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			url: "https://api.spotify.com/v1/me/player/next",
			headers: {
				'Authorization': 'Bearer ' + token,
			},
			json: true
		};
		request.post(options, (error, response, body) => {
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
		});
	}

	function prev(token, res) {
		if (token === undefined) {
			return res.send({
				success: false
			});
		}
		var options = {
			url: "https://api.spotify.com/v1/me/player/previous",
			headers: {
				'Authorization': 'Bearer ' + token,
			},
			json: true
		};
		request.post(options, (error, response, body) => {
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
		});
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
		console.log('refreshing all users in spotify routes');
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
								});
							} else {
								console.log('refresh unsuccessful');
							}
						});
					})(i);
				}
			}
			console.log('all users refreshed');
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
								console.log('primary refresh successful');
							}
						});
					} else {
						console.log('primary refresh unsuccessful');
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