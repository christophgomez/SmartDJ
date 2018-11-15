const express = require('express');
var request = require('request');
var childProcess = require('child_process');
var spotifyRoute = express.Router();

var my_client_id = "c59420679278498bbd4186dd101f3f04";
var my_client_secret = "59803c9ee3eb43858252938d3d945713";
var redirect_uri = "http://localhost:8080/success";
var access_token;
var refresh_token;

spotifyRoute.route('/login').get((req, res) => {
	var scopes = 'user-read-private user-read-email user-read-playback-state user-read-birthdate user-read-currently-playing user-read-playback-state user-top-read playlist-read-private streaming user-read-recently-played';
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
		return res.status(500).send({
			token: false
		});
	}
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
			return res.send(500).send({
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
	childProcess.exec('open -a "Google Chrome" ./webPlayer.html', () => {
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

module.exports = spotifyRoute;