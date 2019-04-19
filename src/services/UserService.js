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
	getUser(email) {
		return Api().get(`/${email}`);
	},
	loginUser(params) {
		return Api().post('/login', params);
	},
	updateToken(email, params) {
		return Api().put(`/updateToken/${email}`, params);
	},
	getUserImage(email) {
		return Api().get(`/image/${email}`);
	}
}