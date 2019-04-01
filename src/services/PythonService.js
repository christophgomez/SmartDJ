import Api from '@/services/PythonApi';

export default {
	start() {
		return Api().post('start');
	},
	end() {
		return Api().post('end');
	}
}