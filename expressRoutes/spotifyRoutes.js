/* eslint-disable */
const SpotifyFunctions = require('./SpotifyFunctions');
const TokenFunctions = require('./TokenFunctions');

const express = require('express');
var request = require('request');
var config;
if (process.env.NODE_ENV !== 'production') {
	config = require('../config/settings');
}

module.exports = function (app, io) {
	var spotifyRoute = express.Router();
	const my_client_id = process.env.spotifyClientId || config.spotifyClientId;
	const my_client_secret = process.env.spotifyClientSecret || config.spotifyClientSecret;
	var port;
	if (config !== undefined) {
		port = config.clientPort;
	} else {
		port = "";
	}
	const baseURL = process.env.baseURL || config.baseURL;
	const redirect_uri = baseURL + port + "/success";

	/***********************************SOCKET**********************************************/

	io.on('connection', function (socket) {
		//console.log('client connected');
		var token = {
			access_token: app.settings.primary_access_token,
			refresh_token: app.settings.primary_refresh_token
		};
		socket.emit('token', {
			token: token
		});

		socket.on('visualPlayerReady', (data) => {
			socket.emit('playerReady', data);
		});

		socket.on('staticPlayerReady', (data) => {
			SpotifyFunctions.transferPlayback(data.id, token.access_token, false, null);
		});

		socket.on('stateChanged', (data) => {
			socket.emit('stateChanged', data);
		});

		socket.on('tokenRefreshed', (data) => {
			socket.emit('tokenRefreshed', data);
		});

		socket.on('paused', () => {
			socket.emit('paused');
		});

		socket.on('played', () => {
			socket.emit('played');
		})
	});

	/***********************************ROUTES**********************************************/

	spotifyRoute.route('/link').get((req, res) => {
		var scopes = 'playlist-read-private playlist-read-collaborative user-read-private user-read-birthdate user-read-email user-read-playback-state user-read-currently-playing user-modify-playback-state app-remote-control streaming user-top-read user-read-recently-played user-library-read';

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
				////console.log('spotify auth successful');
				access_token = body.access_token;
				refresh_token = body.refresh_token;
				TokenFunctions.updateToken(access_token, refresh_token);
				return res.status(200).send({
					success: true,
					access_token: access_token,
					refresh_token: refresh_token
				});
			} else {
				////console.log(body);
				return res.send({
					success: false
				});
			}
		});
	});

	spotifyRoute.route('/access_token').get((req, res) => {
		console.log('getting primary token');
		TokenFunctions.getPrimaryToken(req).then((data) => {
			token = data;
			if (primary_access_token === undefined) {
				return res.send({
					success: false,
				});
			}
			return res.send({
				success: true,
				access_token: token.access_token,
				refresh_token: token.refresh_token
			});
		});
	});

	spotifyRoute.route('/access_token/refresh').post((req, res) => {
		refresh_token = req.body.refresh_token;
		////console.log(" Refresh: " + refresh_token);
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
				////console.log('Access token refreshed');
				TokenFunctions.updateToken(body.access_token, refresh_token);
				return res.send({
					success: true,
					access_token: body.access_token
				})
			} else {
				//console.log(body);
				return res.send({
					success: false
				});
			}
		});
	});

	spotifyRoute.route('/transfer/player').put((req, res) => {
		return SpotifyFunctions.transferPlayback(req.body.id, req.body.access_token, req.body.play, res)
	});

	spotifyRoute.route('/transfer/:id').put((req, res) => {
		if (SpotifyFunctions.transferPlayback(req.params.id, req.body.access_token, req.body.play)) {
			return res.send({
				success: true
			});
		} else {
			return res.send({
				success: false
			});
		}
	});

	spotifyRoute.route('/play').put((req, res) => {
		SpotifyFunctions.play(req.body.access_token, res);
	});

	spotifyRoute.route('/pause').put((req, res) => {
		SpotifyFunctions.pause(req.body.access_token, res);
	});

	spotifyRoute.route('/next').post((req, res) => {
		SpotifyFunctions.next(req.body.access_token, res);
	});

	spotifyRoute.route('/prev').post((req, res) => {
		SpotifyFunctions.prev(req.body.access_token, res);
	});

	spotifyRoute.route('/shuffle').put((req, res) => {
		SpotifyFunctions.shuffle(req.body.shuffle, req.body.access_token, res);
	});

	spotifyRoute.route('/repeat').put((req, res) => {
		SpotifyFunctions.repeat(req.body.type, req.body.access_token, res);
	});

	spotifyRoute.route('/volume').put((req, res) => {
		SpotifyFunctions.setVolume(req.body.volumePercent, req.body.access_token, res);
	})

	spotifyRoute.route('/seek').put((req, res) => {
		return SpotifyFunctions.seek(req.body.ms, req.body.access_token, res);
	})

	spotifyRoute.route('/profile/:access_token').get((req, res) => {
		return SpotifyFunctions.getProfile(req.params.access_token, res);
	});

	spotifyRoute.route('/top_artists/:access_token').get((req, res) => {
		return SpotifyFunctions.getTopArtists(req.params.access_token, res);
	});

	spotifyRoute.route('/currently_playing/:access_token').get((req, res) => {
		return SpotifyFunctions.getCurrentPlaying(req.params.access_token, res);
	});

	spotifyRoute.route('/recently_played/:access_token').get((req, res) => {
		return SpotifyFunctions.getRecentlyPlayed(req.params.access_token, res);
	});

	spotifyRoute.route('/track/:access_token/:id').get((req, res) => {
		return SpotifyFunctions.getTrackInfo(req.params.access_token, req.params.id, res);
	});

	spotifyRoute.route('/devices/:access_token').get((req, res) => {
		return SpotifyFunctions.getDevices(req.params.access_token, res);
	});

	spotifyRoute.route('/analyze/:access_token/:id').get((req, res) => {
		return SpotifyFunctions.analyze(req.params.access_token, req.params.id, res);
	});

	spotifyRoute.route('/playlists/:access_token/:offset').get((req, res) => {
		return SpotifyFunctions.getPlaylists(req.params.access_token, req.params.offset, res);
	});

	spotifyRoute.route('/playlists/play').put((req, res) => {
		return SpotifyFunctions.playPlaylist(req.body.access_token, req.body.uri, res);
	});

	spotifyRoute.route('/playlists/:id/tracks/:access_token/:offset').get((req, res) => {
		return SpotifyFunctions.getPlaylistTracks(req.params.access_token, req.params.id, req.params.offset, res);
	});

	/***********************************END ROUTES**********************************************/
	return spotifyRoute;
}