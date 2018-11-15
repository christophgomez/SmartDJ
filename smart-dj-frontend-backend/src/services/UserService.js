import Api from '@/services/UserApi.js'

export default {
	fetchUsers() {
		return Api().get('/');
	},
	createUser(params) {
		return Api().post('/add', params);
	}
}