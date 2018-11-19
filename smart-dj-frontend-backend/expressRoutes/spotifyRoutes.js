/* eslint-disable */
const express = require('express');
var request = require('request');
var exec = require('child_process').exec;
const querystring = require('querystring');
const Token = require('../models/token');
const User = require('../models/user');
var spotifyRoute = express.Router();

const my_client_id = "c59420679278498bbd4186dd101f3f04";
const my_client_secret = "59803c9ee3eb43858252938d3d945713";
const redirect_uri = "http://localhost:8080/success";
var primary_access_token;
var primary_refresh_token;
var temp_access_token;
var temp_refresh_token;
var device_id;

setInterval(() => {
	refreshPrimaryToken();
	refreshAllUserTokens();
}, 300000);

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

			if (isFirstUser) {
				console.log('first user');
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
				temp_access_token = body.access_token;
				temp_refresh_token = body.refresh_token;
			}
			return res.status(200).send({
				msg: 'successful',
			});
		} else {
			console.log(body);
		}
	});
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

spotifyRoute.route('/access_token/primary').get((req, res) => {
	if (primary_access_token !== undefined) {
		return res.status(200).send({
			success: true,
			access_token: primary_access_token,
			refresh_token: primary_refresh_token
		});
	} else {
		primary_access_token = req.app.get('primary_access_token');
		primary_refresh_token = req.app.get('primary_refresh_token');
		if (primary_access_token === undefined) {
			return res.send({
				success: false,
			});
		} else {
			return res.send({
				success: true,
				access_token: primary_access_token,
				refresh_token: primary_refresh_token
			});
		}
	}
})

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

spotifyRoute.route('/access_token/temp/refresh').post((req, res) => {
	console.log('refreshing temp token');
	temp_refresh_token = req.body.refresh_token;
	return refreshToken(temp_refresh_token, res);
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
					console.log('\nAccess token refreshed');
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

spotifyRoute.route('/profile/:token').get((req, res) => {
	console.log('getting profile');
	var token = req.params.token;
	var options = {
		url: 'https://api.spotify.com/v1/me',
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function (error, response, body) {
		if (error) {
			return res.send({
				error: error
			});
		}
		if (!error && response.statusCode === 200) {
			return res.status(200).send({
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
});

spotifyRoute.route('/player').get((req, res) => {
	exec('open -a "Google Chrome" ./webPlayer.html', () => {
		return res.status(200).send({
			message: 'child process created'
		});
	});
});

spotifyRoute.route('/currently_playing').get((req, res) => {
	var options = {
		url: "https://api.spotify.com/v1/me/player/currently-playing",
		headers: {
			'Authorization': 'Bearer ' + temp_access_token
		},
		json: true
	};
	request.get(options, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			//console.log(body);
			return res.status(200).send({
				is_playing: body.is_playing,
				item: body.item
			});
		} else if (!error && response.statusCode === 204) {
			//console.log("User not playing anything");
			return res.status(200).send({
				is_playing: false,
				item: null
			});
		} else {
			//console.log("error getting currently playing track");
		}
	});
});

spotifyRoute.route('/top_artists').get((req, res) => {
	var options = {
		url: "https://api.spotify.com/v1/me/top/artists",
		headers: {
			'Authorization': 'Bearer ' + temp_access_token
		},
		json: true
	};
	request.get(options, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			//console.log(body);
			return res.status(200).send({
				artists: body.items
			})
		} else {
			//console.log("error getting top artists");
		}
	});
});

spotifyRoute.route('/device_play').put((req, res) => {
	if (primary_access_token === undefined) {
		primary_access_token = req.app.get('primary_access_token');
	}
	var options = {
		url: "https://api.spotify.com/v1/me/player",
		body: {
			'device_ids': [
				device_id
			],
			'play':true
		},
		headers: {
			'Authorization': 'Bearer ' + primary_access_token
		},
		json: true
	};
	request.put(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			console.log('playback started on webplayer\n');
			res.status(204).send();
		} else {
			console.log(response);
		}
	});
});

spotifyRoute.route('/device_play').post((req, res) => {
	device_id = req.body.id;
	return res.status(204).send();
});

spotifyRoute.route('/next').post((req, res) => {
	var options = {
		url: "https://api.spotify.com/v1/me/player/next",
		headers: {
			'Authorization': 'Bearer ' + primary_access_token
		},
		json: true
	};
	request.post(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			console.log('\nSkipped Track\n');
			res.status(204).send();
		} else {
			console.log(response);
		}
	});
});

spotifyRoute.route('/prev').post((req, res) => {
	var options = {
		url: "https://api.spotify.com/v1/me/player/previous",
		headers: {
			'Authorization': 'Bearer ' + primary_access_token
		},
		json: true
	};
	request.post(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			console.log('\nSkipped Track Back\n');
			res.status(204).send();
		} else {
			console.log(response);
		}
	});
});

function refreshToken(refresh_token, res) {
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		},
		headers: {
			'Authorization': 'Basic ' + (new Buffer(my_client_id + ':' + my_client_secret).toString('base64'))
		},
		json: true
	};
	request.post(authOptions, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			temp_access_token = body.access_token;
			console.log('Access token refreshed');
			console.log(body.access_token);
			return res.status(200).send({
				success: true,
				access_token: body.access_token,
				refresh_token: temp_refresh_token
			});
		} else {
			console.log(response.statusCode);
			console.log(response.body.error_description);
			console.log('refresh unsuccessful');
			return res.send({
				success: false
			});
		}
	});
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
							console.log(response.statusCode);
							console.log(response.body.error_description);
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
	console.log('refreshing primary token in spotify routes')
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

					var primary_access_token = body.access_token;
					console.log('Access token refreshed');
					token.access_token = primary_access_token;
					token.save((err) => {
						if (err) console.log(err);
						else {
							console.log('primary refresh successful');
						}
					});
				} else {
					console.log(response.statusCode);
					console.log(response.body.error_description);
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
		if (count === 0) {
			return true;
		} else {
			return false;
		}
	});
}

module.exports = spotifyRoute;