import Api from '@/services/SpotifyApi';

export default {
	login() {
		return Api().get('login');
	},
	exchange(params) {
		return Api().post('authorize', params);
	},
	getPrimaryToken() {
		return Api().get('access_token/primary');
	},
	updatePrimaryToken(params) {
		return Api().post('access_token/primary', params);
	},
	deletePrimaryAccessToken() {
		return Api().delete('access_token/primary');
	},
	checkTempAccessToken() {
		return Api().get('access_token/temp');
	},
	deleteTempAccessToken() {
		return Api().delete('access_token/temp');
	},
	refreshTempAccessToken(params) {
		return Api().post(`access_token/temp/refresh`, params);
	},
	getUserCurrentlyPlaying(token) {
		return Api().get(`currently_playing/user/${token}`);
	},
	getPrimaryCurrentlyPlaying() {
		return Api().get('currently_playing/primary');
	},
	getUserTopArtists(token) {
		return Api().get(`top_artists/user/${token}`);
	},
	getPrimaryDevices() {
		return Api().get('devices/primary');
	},
	getUserDevices(params) {
		return Api().get('devices/user', params);
	},
	startPlayer() {
		return Api().get('player');
	},
	nextUserTrack(params) {
		return Api().post('next/user', params);
	},
	previousUserTrack(params) {
		return Api().post('prev/user', params);
	},
	nextPrimaryTrack() {
		return Api().post('next/kinect');
	},
	previousPrimaryTrack() {
		return Api().post('prev/kinect');
	},
	getUserProfile(token) {
		return Api().get(`profile/${token}`);
	}
};
