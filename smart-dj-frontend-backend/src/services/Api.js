import axios from 'axios';
/* eslint-disable */

export default () => {
	return axios.create({
		baseURL: 'https://smartdjbackend.localtunnel.me/spotifyApi/',
	});
};