import Api from '@/services/SpotifyApi';

export default {
	login() {
		return Api().get('login');
	},
	exchange(params) {
		return Api().post('authorize', params);
	},
	checkAccessToken() {
		return Api().get('access_token');
	},
	deleteAccessToken() {
		return Api().delete('access_token');
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
	getProfile() {
		return Api().get('profile');
	},
	refreshAccessToken(params) {
		return Api().post('access_token', params);
	}
};
