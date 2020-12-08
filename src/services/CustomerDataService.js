import localforage from 'localforage'

class CustomerDataService {
    constructor() {
        this.CACHE_KEY = 'CustomerDataService'
    }

    async addRecordToCache(customer_data) {
        let data = await localforage.getItem(this.CACHE_KEY);
        if(!data) data = [];

        customer_data.createdAt = new Date().toISOString();
        customer_data.id = new Date().toISOString();
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

    async uploadRecords() {

    }
}

export default new CustomerDataService()