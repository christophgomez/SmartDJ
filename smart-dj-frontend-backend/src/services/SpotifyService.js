import Api from '@/services/Api';

export default {
	login() {
		return Api().get('login/');
	},
	exchange(params) {
		return Api().post('authorize/',params);
	},
	getCurrentlyPlaying() {
		return Api().get('currently_playing/');
	},
	getTopArtists() {
		return Api().get('top_artists/');
	},
	startPlayer() {
		return Api().get('player/');
	}
};
