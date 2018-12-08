/* eslint-disable */
import axios from 'axios';
const config = require('../../config/settings');

export default () => {
	return axios.create({
		baseURL: config.baseURL + config.port + '/analytics',
	});
};