import axios from 'axios';
/* eslint-disable */

export default () => {
	return axios.create({
		baseURL: 'http://chrisbook.local:8081/spotify/',
	});
};