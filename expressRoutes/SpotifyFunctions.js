/* eslint-disable */

var request = require('request');
var rp = require('request-promise-native');


function getPlaylists(token, offset, res) {
	if (token === undefined) {
		return res.send({
			success: false
		});
	}
	var options = {
		url: 'https://api.spotify.com/v1/me/playlists?offset=' + offset + "&limit=5",
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};

	request.get(options, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			return res.send({
				success: true,
				playlists: body
			});
		} else {
			return res.send({
				success: false
			});
		}
	});
}
exports.getPlaylists = getPlaylists;

function getPlaylistTracks(token, id, offset, res) {
	if (token === undefined) {
		return res.send({
			success: false
		});
	}
	var options = {
		url: 'https://api.spotify.com/v1/playlists/' + id + '/tracks?offset=' + offset + "&limit=20",
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};
	request.get(options, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			return res.send({
				success: true,
				tracks: body
			});
		} else {
			return res.send({
				success: false
			});
		}
	});
}
exports.getPlaylistTracks = getPlaylistTracks

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
			//console.log(body);
			return res.send({
				success: false
			});
		}
	});


}
exports.getProfile = getProfile;

function getTrackInfo(token, id, res) {
	if (token === undefined || token === '' || id === undefined || id === '') {
		return res.send({
			success: false
		});
	}
	var options = {
		url: 'https://api.spotify.com/v1/tracks/' + id,
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};

	request.get(options, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			return res.send({
				success: true,
				track: body,
			});
		} else {
			//console.log(body);
			return res.send({
				success: false
			});
		}
	});
}
exports.getTrackInfo = getTrackInfo;

function analyze(token, id, res) {
	if (token === undefined || token === '' || id === undefined || id === '') {
		return res.send({
			success: false
		});
	}
	var options = {
		url: 'https://api.spotify.com/v1/audio-analysis/' + id,
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};

	request.get(options, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			return res.send({
				success: true,
				analysis: body,
			});
		} else {
			//console.log(body);
			return res.send({
				success: false
			});
		}
	});
}
exports.analyze = analyze;

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
			return res.status(200).send({
				success: true,
				is_playing: body.is_playing,
				object: body
			});
		} else if (!error && response.statusCode === 204) {
			return res.status(200).send({
				success: true,
				is_playing: false,
				object: null
			});
		} else {
			//console.log(body);
			return res.send({
				success: false
			});
		}
	});
}
exports.getCurrentPlaying = getCurrentPlaying;

function getRecentlyPlayed(token, res) {
	if (token === undefined) {
		return res.send({
			success: false
		});
	}
	var options = {
		url: "https://api.spotify.com/v1/me/player/recently-played",
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};
	request.get(options, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			return res.send({
				success: true,
				items: body
			});
		} else {
			return res.send({
				success: false
			});
		}
	});
}
exports.getRecentlyPlayed = getRecentlyPlayed;

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
			return res.status(200).send({
				success: true,
				artists: body.items
			})
		} else {
			//console.log(body);
			return res.send({
				success: false
			});
		}
	});
}
exports.getTopArtists = getTopArtists;

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
			//console.log(body);
			return res.send({
				success: false
			});
		}
	});
}
exports.getDevices = getDevices;

function transferPlayback(id, token, play = true, res = null) {
	if (token === undefined || token === '' || id === undefined || id === '') {
		//console.log('cant transfer to player, no access token or id')
		if(res !== null)
		return res.send({
			success: false
		});
	}
	var options = {
		url: "https://api.spotify.com/v1/me/player",
		body: {
			'device_ids': [
				id
			],
			'play': play
		},
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};
	request.put(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			//console.log('playback started on webplayer');
			if (res !== null)
			return res.send({
				success: true
			});
		} else {
			//console.log(body);
			if (res !== null)
			return res.send({
				success: false
			});
		}
	});
}
exports.transferPlayback = transferPlayback;

function playPlaylist(token, uri, res) {
	if (token === undefined || token === '' || uri === undefined || uri === '') {
		return res.send({
			success: false
		});
	}
	var options = {
		url: "https://api.spotify.com/v1/me/player/play",
		body: {
			'context_uri': uri,
		},
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};
	request.put(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			return res.send({
				success: true
			});
		} else {
			return res.send({
				success: false
			});
		}
	});
}
exports.playPlaylist = playPlaylist;

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
		res.send({
			success: true
		});
	} catch (error) {
		//console.log(error);
		Promise.reject(error);
		res.send({
			success: false
		});
	}
}
exports.play = play;

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
		res.send({
			success: true
		});
	} catch (error) {
		//console.log(error);
		Promise.reject(error);
		res.send({
			success: false
		});
	}
}
exports.pause = pause;

function playS(token) {
	if (token === undefined) {
		return false;
	}
	var options = {
		url: "https://api.spotify.com/v1/me/player/play",
		headers: {
			'Authorization': 'Bearer ' + token,
		},
		json: true
	};
	request.put(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			//console.log('playback started on webplayer');
			return true;
		} else {
			//console.log(body);
			return false;
		}
	});
}
exports.playS = playS;

function pauseS(token) {
	if (token === undefined) {
		return false;
	}
	var options = {
		url: "https://api.spotify.com/v1/me/player/pause",
		headers: {
			"Authorization": 'Bearer ' + token,
		},
		json: true
	};
	request.put(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			//console.log('playback started on webplayer');
			return true;
		} else {
			//console.log(body);
			return false;
		}
	});
}
exports.pauseS = pauseS;

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
		res.send({
			success: true
		});
	} catch (error) {
		//console.log(error);
		Promise.reject(error);
		res.send({
			success: false
		});
	}


}
exports.next = next;

function nextS(token) {
	console.log('nextS CALLED');
	if (token === undefined) {
		console.log('token undefined');
		return false;
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
			console.log('next completed');
			return true;
		} else {
			//console.log(body);
			return false;
		}
	});
}
exports.nextS = nextS;


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
		//console.log(error);
		Promise.reject(error);
		res.send({
			success: false
		});
	}
}
exports.prev = prev;

function seek(ms, token, res) {
	if (token === undefined || token === '' || ms === undefined || ms === '') {
		return res.send({
			success: false
		});
	}
	options = {
		url: "https://api.spotify.com/v1/me/player/seek?position_ms=" + ms,
		headers: {
			'Authorization': 'Bearer ' + token,
		},
		json: true
	}
	request.put(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			return res.send({
				success: true
			});
		} else {
			//console.log(body);
			return res.send({
				success: false
			});
		}
	});
}
exports.seek = seek;

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
		res.send({
			success: true
		});
	} catch (error) {
		Promise.reject(error);
		res.send({
			success: false
		});
	}

}
exports.shuffle = shuffle;

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
			'Authorization': 'Bearer ' + token
		},
		json: true
	};
	try {
		await rp(options);
		//console.log('Repeat: ' + trackContextOff);
		res.send({
			success: true
		});
	} catch (error) {
		//console.log(error);
		Promise.reject(error);
		res.send({
			success: false
		});
	}
	/*request.put(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			//console.log('Repeat: ' + trackContextOff);
			res.send({
				success: true
			});
		} else {
			//console.log(body);
			res.send({
				success: false
			});
		}
	});*/

}
exports.repeat = repeat;

async function setVolume(volumePercent, token, res) {
	if (token === undefined) {
		return res.send({
			success: false
		});
	}
	var options = {
		method: `PUT`,
		uri: "https://api.spotify.com/v1/me/player/volume?volume_percent=" + volumePercent,
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};
	try {
		await rp(options);
		//console.log("Volume set to: " + volumePercent);
		res.send({
			success: true
		});
	} catch (error) {
		//console.log(error);
		Promise.reject(error);
		res.send({
			success: false
		});
	}
	/*request.put(options, (error, response, body) => {
		if (!error && response.statusCode === 204) {
			//console.log("Volume set to: " + volumePercent);
			res.send({
				success: true
			});
		} else {
			//console.log(body);
			res.send({
				success: false,
			});
		}
	});*/
}
exports.setVolume = setVolume;