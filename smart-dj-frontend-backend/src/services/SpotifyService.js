import Api from '@/services/SpotifyApi';

export default {
	login() {
		return Api().get('login');
	},
	exchange(params) {
		return Api().post('authorize', params);
	},
	checkTempAccessToken() {
		return Api().get('access_token/temp');
	},
	deleteAccessToken() {
		return Api().delete('access_token/primary');
	},
	getCurrentlyPlaying() {
		return Api().get('currently_playing');
	},
	getTopArtists() {
		return Api().get('top_artists');
	},
	startPlayer() {
		return Api().get('player');
	},
	nextTrack() {
		return Api().post('next');
	},
	previousTrack() {
		return Api().post('prev');
	},
	getUserProfile(token) {
		return Api().get(`profile/${token}`);
	},
	refreshTempAccessToken(params) {
		return Api().post('access_token/temp/refresh', params);
	},
	getPrimaryToken() {
		return Api().get('access_token/primary');
	}
};
