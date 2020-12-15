import localforage from 'localforage'
import {fetchData} from '../helpers/helpers'
import Constants from './../constants'

class CustomerDataService {
    constructor() {
        this.CACHE_KEY = 'CustomerDataService'
    }

    async addRecordToCache(customer_data) {
        let data = await localforage.getItem(this.CACHE_KEY);
        if(!data) data = [];

        customer_data.createdAt = new Date().toISOString();
        customer_data.id = new Date().getTime();
        customer_data.unsynced = true;
        
        data.push(customer_data);

        await localforage.setItem(this.CACHE_KEY, data);
    }

    async updateRecordInCache(id, customer_data) {
        let data = await localforage.getItem(this.CACHE_KEY);
        if(!data) data = [];
        for (let index = 0; index < data.length; index++) {
            if(data[index].id == id) {
                data[index] = customer_data;
                break;
            }           
        }
        await localforage.setItem(this.CACHE_KEY, data);
    }

    async deleteRecordFromCache(id) {
        let data = await localforage.getItem(this.CACHE_KEY);
        if(!data) data = [];
        for (let index = 0; index < data.length; index++) {
            if(data[index].id == id) {
                data.splice(index, 1);
                break;
            }            
        }
        await localforage.setItem(this.CACHE_KEY, data);
    }

    async getUnsyncedRecords() {
        let data = await localforage.getItem(this.CACHE_KEY);
        return data ? data : [];
    }

    async getUnsyncedRecord(id) {
        let records = await this.getUnsyncedRecords();
        for (let index = 0; index < records.length; index++) {
            if(records[index].id == id) return records[index];
        }
    }

    async uploadRecords() {
        let data = await localforage.getItem(this.CACHE_KEY);
        // await localforage.setItem(this.CACHE_KEY, [])
        await fetchData('POST', `${Constants.aadhaar_domain}/aadhaar/customerdata/`, data)
        return localforage.setItem(this.CACHE_KEY, [])
    }
}

export default new CustomerDataService()