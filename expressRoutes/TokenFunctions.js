/* eslint-disable */
const Token = require('../models/token');
var request = require('request');
var config;
if (process.env.NODE_ENV !== 'production') {
	config = require('../config/settings');
}
const my_client_id = process.env.spotifyClientId || config.spotifyClientId;
const my_client_secret = process.env.spotifyClientSecret || config.spotifyClientSecret;
var access_token;

async function getPrimaryToken(req) {
	var token = req.app.get('primary_access_token');
	if (token === undefined) {
		const response = await asyncGetPrimaryToken();
		return response;
	} else {
		return token;
	}
}
exports.getPrimaryToken = getPrimaryToken;

async function getPrimaryTokenS() {
	const response = await asyncGetPrimaryToken();
	return response;
}
exports.getPrimaryTokenS = getPrimaryTokenS

async function asyncGetPrimaryToken() {
			try {
				const token = await Token.findById(1).exec();
				return token.access_token;
			} catch (err) {
				console.log("something went wrong getting primary access token");
			}
}
exports.asyncGetPrimaryToken = asyncGetPrimaryToken;
	
function updateToken(primary_access_token, primary_refresh_token) {
			console.log("updating primary access token");

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
							return false;
						}
						console.log("new primary token saved to db");
						return true;
					})
				} else {
					console.log("token exists in db, updating token");
					token.access_token = primary_access_token;
					token.refresh_token = primary_refresh_token;
					token.save((error) => {
						if (error) {
							console.log("error updating token");
							return false;
						}
						console.log("token updated");
						return true;
					});
				}
			});
}
exports.updateToken = updateToken;

function refreshPrimaryToken(token) {

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
				console.log('Primary Access token refreshed');
				token.access_token = primary_access_token;
				token.save((err) => {
					if (err) console.log(err);
					else {
						console.log('primary refresh successful');
					}
				});
			} else {
				console.log(body);
				console.log('primary refresh unsuccessful');
			}
		});
}
exports.refreshPrimaryToken = refreshPrimaryToken;

function setPrimaryToken(token) {
	access_token = token;
}
exports.setPrimaryToken = setPrimaryToken;