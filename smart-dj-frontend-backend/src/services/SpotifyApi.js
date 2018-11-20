import axios from 'axios';
const config = require('../../config/settings');
/* eslint-disable */

export default () => {
	return axios.create({
		baseURL: config.baseURL+config.serverPort+'/spotify',
	});
};