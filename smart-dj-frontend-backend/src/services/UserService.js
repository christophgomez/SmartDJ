import Api from '@/services/UserApi.js'

export default {
	fetchUsers() {
		return Api().get('/');
	},
	createUser(params) {
		return Api().post('/add', params);
	},
	deleteUser(id) {
		return Api().delete(`/delete/${id}`)
	},
	getUser(username) {
		return Api().get(`/${username}`);
	},
	loginUser(params) {
		return Api().post('/login', params);
	},
	updateToken(username, params) {
		return Api().put(`/updateToken/${username}`, params);
	}
}