import Api from '@/services/PythonApi';

export default {
	startVid() {
		return Api().post('startVideo');
	},
	endVid() {
		return Api().post('endVideo');
	}
}