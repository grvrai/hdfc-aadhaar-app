import localforage from "localforage";
import {setup} from "axios-cache-adapter";
import AuthService from "./auth-service";
import Constants from "./../constants";
import App from './../App'

const api = setup({
	baseURL: Constants.aadhaar_domain,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
		// "Authorization": `Token ${user_data.token}`
	},
	cache: {
		maxAge: 24 * 60 * 60 * 1000,
		exclude: {
			//   query: false,
		},
		store: localforage.createInstance({
			driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
			name: "aadhar-service-cache",
		}),
		readOnError: (error, request) => {
			return error.message == "Network Error";
		},
		invalidate: async (cfg, req) => {
			const method = req.method.toLowerCase();
			if (method !== "get") {
				console.log(cfg.uuid);
				let url = cfg.uuid;
				if (method == "put") {
					url = url.split("/");
					url = url.splice(0, url.length - 2).join("/");
				}
				let keys = await cfg.store.keys();
				for (let index = 0; index < keys.length; index++) {
					const key = keys[index];
					if (key.indexOf(url) >= 0) {
						await cfg.store.removeItem(key);
					}
				}
			}
		},
	},
});

api.interceptors.request.use(
	(config) => {
		// Do something before request is sent
		let user_data = AuthService.getUserData();
		config.headers["Authorization"] = `Token ${user_data.token}`;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response.status === 401) {
			App.logout();
		}
		return Promise.reject(error);
	}
);

class AadharDataService {
	constructor() {
		this.CACHE = {
			customerDataUnsynced: "CustomerDataUnsyncedCache",
			customerData: "CustomerDataCache",
			daylyData: "DailyCache",
		};
		this.CACHE_KEY = "AadharDataService";
		this.DAILY_CACHE = "DailyCache";
	}

	async addCustomerRecord(customer_data) {
		let current_time = new Date().toISOString();
		customer_data.reportedAt = current_time;
		return api.post("/aadhaar/customerdata/", customer_data);
	}

	async getCustomerRecord(id) {
		return api.get("/aadhaar/customerdata/"+ id  + "/");
	}

	async deleteCustomerRecord(id) {
		return api.delete("/aadhaar/customerdata/"+ id  + "/");
	}

	async updateCustomerRecord(id, customer_data) {
		return api.put("/aadhaar/customerdata/" + id  + "/", customer_data);
	}

	async addRecordToCache(customer_data) {
		let data = await localforage.getItem(this.CACHE.customerDataUnsynced);
		if (!data) data = [];

		let current_time = new Date().toISOString();
		customer_data.reportedAt = current_time;
		customer_data.id = new Date().getTime();
		customer_data.unsynced = true;
		data.push(customer_data);

		await localforage.setItem(this.CACHE.customerDataUnsynced, data);
	}

	async updateRecordInCache(id, customer_data) {
		let data = await localforage.getItem(this.CACHE.customerDataUnsynced);
		if (!data) data = [];
		for (let index = 0; index < data.length; index++) {
			if (data[index].id == id) {
				data[index] = customer_data;
				break;
			}
		}
		await localforage.setItem(this.CACHE.customerDataUnsynced, data);
	}

	async deleteRecordFromCache(id) {
		let data = await localforage.getItem(this.CACHE.customerDataUnsynced);
		if (!data) data = [];
		for (let index = 0; index < data.length; index++) {
			if (data[index].id == id) {
				data.splice(index, 1);
				break;
			}
		}
		await localforage.setItem(this.CACHE.customerDataUnsynced, data);
	}

	async getUnsyncedRecords(date) {
		let data = await localforage.getItem(this.CACHE.customerDataUnsynced);

		if (data && data.length) {
			data = data.filter((x) => x.unsynced);
			if (date) {
				let current_date = new Date(date).toLocaleDateString();
				data = data.filter((x) => {
					return new Date(x.reportedAt).toLocaleDateString() == current_date;
				});
			}
		}
		return data ? data : [];
	}

	async getUnsyncedRecord(id) {
		let records = await this.getUnsyncedRecords();
		for (let index = 0; index < records.length; index++) {
			if (records[index].id == id) return records[index];
		}
	}

	async getRecords(date) {
		let d = date ? new Date(date) : new Date();
		let filter_gte = d.toISOString();
		d.setDate(d.getDate() + 1);
		let filter_lte = d.toISOString();

		let response = await api.get(`/aadhaar/customerdata/?createdAt__gte=${filter_gte}&createdAt__lte=${filter_lte}`);
		console.log(response);
		return response;
	}

	async uploadRecords() {
		let data = await this.getUnsyncedRecords();
		let response = await api.post("/aadhaar/customerdata/", data);
		data.map((item) => {
			item.unsynced = false;
			return item;
		});
		return localforage.setItem(this.CACHE.customerDataUnsynced, data);
	}

	async getCurrentDailyRecord(date) {
		console.log("getCurrentDailyRecord");
		let data = await localforage.getItem(this.DAILY_CACHE);
		if (data) {
			console.log(data);
			// check if data is for current day
			let cache_date = new Date(data.createdAt);
			if (cache_date.toLocaleDateString() == new Date().toLocaleDateString()) {
				console.log("getCurrentDailyRecord cache");
				console.log(data);

				return data;
			} else {
				await localforage.setItem(this.DAILY_CACHE, null);
			}
		}

		let d = date ? new Date(date) : new Date();
		d.setHours(0, 0, 0);
		// let filter_gte = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
		let filter_gte = d.toISOString();
		d.setDate(d.getDate() + 1);
		// let filter_lte = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
		let filter_lte = d.toISOString();
		// data = await fetchData(
		//   "GET",
		//   `${Constants.aadhaar_domain}/aadhaar/dailyactivity/?date__gte=${filter_gte}&date__lte=${filter_lte}`
		// );

		data = await api.get(`/aadhaar/dailyactivity/?createdAt__gte=${filter_gte}&createdAt__lte=${filter_lte}`);
		console.log(data);
		if (data && data.data.results.length > 0) {
			console.log(data.data.results[0]);
			await localforage.setItem(this.DAILY_CACHE, data.data.results[0]);
			return data.data.results[0];
		}

		return null;
	}

	async dropCache() {
		for (const key in this.CACHE) {
			if (this.CACHE.hasOwnProperty(key)) {
				await localforage.setItem(this.CACHE[key], null);
			}
		}
		await api.cache.clear();
	}
}

export {api};
export default new AadharDataService();
