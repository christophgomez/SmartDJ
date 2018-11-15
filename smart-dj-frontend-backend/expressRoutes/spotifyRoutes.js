/* eslint-disable */
const express = require('express');
var request = require('request');
var exec = require('child_process').exec;
const querystring = require('querystring');
var spotifyRoute = express.Router();

var my_client_id = "c59420679278498bbd4186dd101f3f04";
var my_client_secret = "59803c9ee3eb43858252938d3d945713";
var redirect_uri = "http://localhost:8080/success";
var access_token;
var refresh_token;
var device_id;

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

			access_token = body.access_token;
			refresh_token = body.refresh_token;

			return res.status(200).send({
				msg: 'successful'
			});
		}
	});
});

spotifyRoute.route('/access_token').get((req, res) => {
	if (access_token !== undefined) {
		return res.status(200).send({
			token: true,
			access_token: access_token,
			refresh_token: refresh_token
		});
	} else {
		return res.send({
			token: false
		});
	}
});

spotifyRoute.route('/access_token').delete((req, res) => {
	access_token = undefined;
	refresh_token = undefined;
	return res.status(200).send({
		message: 'Access token deleted'
	});
});

spotifyRoute.route('/access_token').post((req, res) => {
	refresh_token = req.body.refresh_token;
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
			grant_type: 'authorization_code',
			refresh_token: refresh_token
		},
		headers: {
			'Authorization': 'Basic ' + (new Buffer(my_client_id + ':' + my_client_secret).toString('base64'))
		},
		json: true
	};
	request.post(authOptions, function (error, response, body) {
		if (!error && response.statusCode === 200) {

			access_token = body.access_token;
			console.log('\nAccess token refreshed');
			console.log('access_token: ' + access_token);
			console.log('refresh_token: ' + refresh_token);
			return res.status(200).send({
				msg: 'refresh successful'
			});
		} else {
			console.log(error);
		}
	});
});

spotifyRoute.route('/profile').get((req, res) => {
	var options = {
		url: 'https://api.spotify.com/v1/me',
		headers: {
			'Authorization': 'Bearer ' + access_token
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
				birthday: body.birthdate,
				name: body.display_name,
				email: body.email,
				url: body.external_urls.spotify,
				followers: body.followers.total,
				type: body.product,
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
			'Authorization': 'Bearer ' + access_token
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
			'Authorization': 'Bearer ' + access_token
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
	var options = {
		url: "https://api.spotify.com/v1/me/player",
		body: {
			'device_ids': [
				device_id
			],
			'play':true
		},
		headers: {
			'Authorization': 'Bearer ' + access_token
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
			'Authorization': 'Bearer ' + access_token
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
			'Authorization': 'Bearer ' + access_token
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

module.exports = spotifyRoute;