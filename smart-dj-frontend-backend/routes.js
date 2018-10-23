const express = require('express');
var request = require('request');
var router = express.Router();

var my_client_id = "c59420679278498bbd4186dd101f3f04";
var my_client_secret = "59803c9ee3eb43858252938d3d945713";
var redirect_uri = "http://localhost:8080/success";
var access_token;

router.route('/login').get((req, res) => {
	var scopes = 'user-read-private user-read-email user-read-playback-state user-read-birthdate user-read-currently-playing user-read-playback-state user-top-read';
	return res.send({
		redirect: 'https://accounts.spotify.com/authorize' +
			'?response_type=code' +
			'&client_id=' +
			my_client_id +
			(scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
			'&redirect_uri=' + encodeURIComponent(redirect_uri)
	});
});

router.route('/authorize').post((req, res) => {
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
			//var refresh_token = body.refresh_token;

			var options = {
				url: 'https://api.spotify.com/v1/me',
				headers: {
					'Authorization': 'Bearer ' + access_token
				},
				json: true
			};

			// use the access token to access the Spotify Web API
			request.get(options, function (error, response, body) {
				console.log(body);
				res.send({
					birthday: body.birthdate,
					name: body.display_name,
					email: body.email,
					url: body.external_urls.spotify,
					followers: body.followers.total,
					type: body.product,
				});
			});
		}
	});
});

router.route('/currently_playing').get((req, res) => {
	var options = {
		url: "https://api.spotify.com/v1/me/player/currently-playing",
		headers: {
			'Authorization': 'Bearer ' + access_token
		},
		json: true
	};
	request.get(options, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			console.log(body);
			res.send({
				is_playing: body.is_playing,
				item: body.item
			});
		} else if (!error && response.statusCode === 204) {
			console.log("User not playing anything");
			res.send({
				is_playing: false,
				item: null
			});
		} else {
			console.log("error getting currently playing track");
		}
	});
});

router.route('/top_artists').get((req, res) => {
	var options = {
		url: "https://api.spotify.com/v1/me/top/artists",
		headers: {
			'Authorization': 'Bearer ' + access_token
		},
		json: true
	};
	request.get(options, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			console.log(body);
			res.send({
				artists: response.body.items
			})
		} else {
			console.log("error getting top artists");
		}
	})
})

module.exports = router;