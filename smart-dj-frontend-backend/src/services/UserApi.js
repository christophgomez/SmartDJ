import axios from 'axios';

export default () => {
	return axios.create({
		baseURL: 'http://chrisbook.local:8081/users'
	});
};