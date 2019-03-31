import Api from '@/services/SpotifyApi';

export default {
	link() {
		return Api().get('/link');
	},
	exchange(params) {
		return Api().post('/authorize', params);
	},
	refreshToken(refresh_token) {
		return Api().post('/access_token/refresh', {refresh_token: refresh_token});
	},
	getDevices(access_token) {
		return Api().get(`/devices/${access_token}`);
	},
	startPlayer() {
		return Api().post('/player/open');
	},
	play(params) {
		return Api().put('/play', params);
	},
	pause(params) {
		return Api().put('/pause', params);
	},
	nextTrack(params) {
		return Api().post('/next', params);
	},
	previousTrack(params) {
		return Api().post('/prev', params);
	},
	seek(params) {
		return Api().put('/seek', params);
	},
	repeat(params) {
		return Api().put('/repeat', params);
	},
	shuffle(params) {
		return Api().put('/shuffle', params);
	},
	setVolume(params) {
		return Api().put('/volume', params);
	},
	getProfile(access_token) {
		return Api().get(`/profile/${access_token}`);
	},
	getCurrentlyPlaying(access_token) {
		return Api().get(`/currently_playing/${access_token}`);
	},
	getRecentlyPlayed(access_token) {
		return Api().get(`/recently_played/${access_token}`);
	},
	getTopArtists(access_token) {
		return Api().get(`/top_artists/${access_token}`);
	},
	getTrackInfo(access_token, id) {
		return Api().get(`/track/${access_token}/${id}`);
	},
	getPlaylists(access_token, offset) {
		return Api().get(`playlists/${access_token}/${offset}`);
	},
	playPlaylist(access_token, uri) {
		return Api().put('playlists/play', { access_token: access_token, uri: uri });
	},
	getPlaylistTracks(access_token,id, offset) {
		return Api().get(`playlists/${id}/tracks/${access_token}/${offset}`);
	},
	analyzeTrack(access_token, id) {
		return Api().get(`/analyze/${access_token}/${id}`);
	},
	transferDevicePlayer(params) {
		return Api().put('/transfer/player', params);
	},
	transferDevice(id) {
		return Api().put(`/transfer/${id}`);
	},
};
