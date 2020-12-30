import {fetchData} from '../helpers/helpers'
import Constants from '../constants'

import AadharDataService from './customer-data-service'
import PeakPwa from './peakpwa';

class AuthService {
  constructor() {
    this._isLoggedIn = localStorage.getItem('user_data') ? true : false;
    if(this.isLoggedIn) {
      let user_data = localStorage.getItem('user_data')
      if (user_data) {
        user_data = JSON.parse(user_data);
        // this.user_data = user_data;
        // return user_data;
        Constants.token = user_data.token;
      }
    }
  }

  async auth(username, password) {
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
    let user_data = await fetchData('POST', `${Constants.domain}/api/login/`, {}, headers);
    Constants.token = user_data.token;
    let state_list = await fetchData('GET', `${Constants.domain}/api/passes/state/?assigned_user=${user_data.id}&expand=template`);

    if(state_list.results.length) {
      var state_data = state_list.results[0];
      return { user_data, state_data };
    } else {
      Constants.token = null;
      throw {
          response: {
            detail: 'This account is not configured to be used with this app.'
          }
      }      
    }
  }

  login(user_data, state_data) {
    this._isLoggedIn = true;
    localStorage.setItem('user_data', JSON.stringify(user_data));
	localStorage.setItem('state_data', JSON.stringify(state_data));
	
	PeakPwa.webapp.setStateData(state_data);
    PeakPwa.subscribe();
  }

  logout() {
	AadharDataService.dropCache();
	PeakPwa.unsubscribe();
	// localStorage.clear();
	Constants.token = null	;
    this._isLoggedIn = false;
  }

  getUserData() {
    if (this.user_data) {
      return this.user_data;
    } else {
      let user_data = localStorage.getItem('user_data')
      if (user_data) {
        user_data = JSON.parse(user_data);
        this.user_data = user_data;
        return user_data;
      }
    }
  }

  getUserState() {
    if (this.state_data) {
      return this.state_data;
    } else {
      let state_data = localStorage.getItem('state_data')
      if (state_data) {
        state_data = JSON.parse(state_data);
        this.state_data = state_data;
        return state_data;
      }
    }
  }

  isLoggedIn() {
    if (this._isLoggedIn) {
      return true;
    } else {
      return false
    }
  }
}

export default new AuthService()