import Api from '@/services/Api';

export default {
	login() {
		return Api().get('/spotifyApi/login');
	},
	exchange(params) {
		return Api().post('/spotifyApi/authorize',params);
	},
	getCurrentlyPlaying() {
		return Api().get('/spotifyApi/currently_playing');
	},
	getTopArtists() {
		return Api().get('/spotifyApi/top_artists');
	}
};
