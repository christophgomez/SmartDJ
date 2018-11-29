import Api from './AnalyticsApi';

export default {
	getAll() {
		return Api().get('/requests');
	},
	getApp() {
		return Api().get('/requests/app');
	},
	getKinect() {
		return Api().get('/requests/kinect');
	},
	getEndpoint(endpoint) {
		return Api().get(`/requests/endpoint/${endpoint}`)
	},
	getCount() {
		return Api().get('/count');
	},
	getDay(year, month, day) {
		return Api().get(`/requests/${year}/${month}/${day}/day`);
	},
	getWeek(year, month, day) {
		return Api().get(`/requests/${year}/${month}/${day}/week`);
	},
	getMonth(year, month) {
		return Api().get(`/requests/${year}/${month}`);
	},
	getYear(year) {
		return Api().get(`/requests/${year}`);
	},
	getSessions() {
		return Api().get('/sessions');
	}
}