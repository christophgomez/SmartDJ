import Api from '@/services/SpotifyApi';

export default {
	login() {
		return Api().get('/login');
	},
	exchange(params) {
		return Api().post('/authorize', params);
	},
	getPrimaryToken() {
		return Api().get('/access_token/primary');
	},
	updatePrimaryToken(params) {
		return Api().post('/access_token/primary', params);
	},
	deletePrimaryAccessToken() {
		return Api().delete('/access_token/primary');
	},
	checkTempAccessToken() {
		return Api().get('/access_token/temp');
	},
	deleteTempAccessToken() {
		return Api().delete('/access_token/temp');
	},
	refreshTempAccessToken(params) {
		return Api().post(`/access_token/temp/refresh`, params);
	},
	getUserCurrentlyPlaying(token) {
		return Api().get(`/user/currently_playing/${token}`);
	},
	getPrimaryCurrentlyPlaying() {
		return Api().get('/kinect/currently_playing');
	},
	getUserTopArtists(token) {
		return Api().get(`/user/top_artists/${token}`);
	},
	getPrimaryDevices() {
		return Api().get('/kinect/devices');
	},
	getUserDevices(token) {
		return Api().get(`/user/devices/${token}`,);
	},
	startPlayer() {
		return Api().post('/kinect/player');
	},
	playPrimary() {
		return Api().put('/kinect/play');
	},
	playUser(params) {
		return Api().put('/user/play', params);
	},
	pausePrimary() {
		return Api().put('/kinect/pause');
	},
	pauseUser(params) {
		return Api().put('/user/pause', params);
	},
	nextUserTrack(params) {
		return Api().post('/user/next', params);
	},
	previousUserTrack(params) {
		return Api().post('/user/prev', params);
	},
	nextPrimaryTrack() {
		return Api().post('/kinect/next');
	},
	previousPrimaryTrack() {
		return Api().post('/kinect/prev');
	},
	getUserProfile(token) {
		return Api().get(`/user/${token}`);
	},
	shufflePrimary(params) {
		return Api().put('/kinect/shuffle', params);
	},
	repeatPrimary(params) {
		return Api().put('/kinect/repeat', params);
	},
	setPrimaryVolume(params) {
		return Api().put('/kinect/volume', params);
	}
};
