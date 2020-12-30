import bowser from 'bowser'
// import localforage from "localforage"
import {getQueryParam} from './../helpers/helpers'
import localforage from 'localforage'

import PeakConstants from './../constants'

var PeakPwa = function () {
	'use strict';
	var location = window.location;

	var LS_USER_SUBSCRIBED_STATUS = location.hostname + '-' + 'ls-subscribe-cache';
	var LS_USER_PERM_STATUS = location.hostname + '-' + 'ls-perm-cache';
	var LS_DENIED_NOTIF_PERMISSION = location.hostname + '-' + 'ls-denied-notif';

	var PWA_SUPPORTED_BROWSERS = {
		desktop: ['Chrome'],
		mobile: ['Samsung Internet for Android', 'Chrome', 'Firefox', 'Safari']
	}
	var NOTIFICATIONS_SUPPORTED_BROWSERS = {
		desktop: ['Chrome', 'Firefox', 'Safari', 'Opera'],
		mobile: ['Samsung Internet for Android', 'Chrome', 'Firefox', 'Safari', 'UC Browser', 'Opera']
	}

	var NAMESPACE = "peakpwa";

	var webapp = {
		initialized: false,
		domain: location.origin,
		app: null,
		serialno: null,
		a2hsEvent: null,
		vapid: null,
		isSubscribed: false,
		subscription: null,
		serviceWorkerRegistration: null,
	};

	/** Execute on start **/
	webapp.init = async function (constants, state) {
		console.log(constants)
		if(webapp.isInit) return;

		if(state) {
			constants.serialno = state.template.serialno;
			constants.state_data = state;
		}
		

		webapp.constants = constants;

		// Add constants to webapp
		for (var k in constants) {
			if (constants.hasOwnProperty(k)) {
				webapp[k] = constants[k];
			}
		}

		await webapp.registerServiceWorker();

		var tracker_sn = webapp.getTrackerSerialno();
		webapp.installed = tracker_sn ? tracker_sn : false;

		// Check for src param if not subscribed yet
		if(!webapp.installed) {
			let install_param = getQueryParam('src');
			if (install_param) localStorage.setItem('install_parameter', install_param);
		}

		// Cache tracker/constants for use by service worker
		webapp.idbCache.init();
		webapp.idbCache.set('trackerSerialno', tracker_sn);
		webapp.idbCache.set('peak_constants', constants);

		webapp.initListeners();

		if(!state) {
			document.dispatchEvent(new CustomEvent('PeakPwaInit', {}));
			webapp.isInit = true;
			return;
		};

		let isSubscribed = await webapp.getSubscriptionStatus();
		let isAddedToHomescreen = webapp.isAddedToHomescreen();
		let isPermGranted = webapp.getPermissionStatus() == 'granted';

		// Fix forms in chrome mobile PWAs
		if (isAddedToHomescreen && bowser.mobile && bowser.chrome) {
			webapp.fixFormsTarget();
		}

		// Save device token on Safari APNS
		if (webapp.is_safari_with_apns()) {
			var permData = window.safari.pushNotification.permission(webapp.apns_push_id);
			if (permData.permission == 'granted')
				webapp.deviceToken = permData.deviceToken;
		}

		if (webapp.installed) {
			webapp.initialized = true;
			document.dispatchEvent(new CustomEvent('PeakPwaInit', {}));
			webapp.initGeolocationPerms();
			webapp.updateTokenIfChanged();
		}

		if (!webapp.installed) {
			if (isAddedToHomescreen || isPermGranted) {
				document.dispatchEvent(new CustomEvent('PeakPwaInstallStart', {}));
				webapp.subscribe(function () {
					if (isAddedToHomescreen) {
						webapp.logPwaFirstLaunchEvents();
						document.dispatchEvent(new CustomEvent('PwaFirstLaunch', {}));
					}

					// Clear html to update tags
					if (webapp.app != 'website') webapp.refreshHtmlCache();

					webapp.initialized = true;
					webapp.installed = true;

					document.dispatchEvent(new CustomEvent('PeakPwaInstallFinished', {}));
					document.dispatchEvent(new CustomEvent('PeakPwaInit', {}));
				});
			} else {
				document.dispatchEvent(new CustomEvent('PeakPwaInit', {}));
			}
		}

		webapp.logVisitEvents();

		webapp.isInit = true;
	}

	webapp.getSubscriptionStatus = function () {
		var userSubStatus = localStorage.getItem(LS_USER_SUBSCRIBED_STATUS);

		// If a browser supports PushManager, use it to check subscription status
		if ('PushManager' in window) {
			return webapp.serviceWorkerRegistration.pushManager.getSubscription()
				.then(function (subscription) {
					webapp.subscription = subscription;
					webapp.isSubscribed = !(subscription === null);
					return webapp.isSubscribed;
				});

			// In other browsers like Safari iOS check localStorage only
		} else if ((bowser.mobile && bowser.safari) || webapp.is_safari_with_apns()) {
			webapp.isSubscribed = !(userSubStatus == 'subscribed');
			return Promise.resolve(webapp.isSubscribed);
		}
	}

	webapp.initGeolocationPerms = function () {
		if ('permissions' in navigator) {
			navigator.permissions.query({
					name: 'geolocation'
				})
				.then(function (permissionStatus) {
					// console.log('geolocation permission state is ', permissionStatus.state);
					if (permissionStatus.state == 'granted') {
						localStorage.setItem(`${NAMESPACE}_geo_enabled`, 'true')
					} else {
						localStorage.setItem(`${NAMESPACE}_geo_enabled`, 'false')
					}
					permissionStatus.onchange = function () {
						// console.log('geolocation permission state has changed to ', this.state);
					};

					if (webapp.isGeoLocationEnabled()) webapp.updateLocIfNeeded();
				});
		} else {
			if (webapp.isGeoLocationEnabled()) webapp.updateLocIfNeeded();
		}
	}

	webapp.registerServiceWorker = async function () {
		// console.log('ServiceWorker Registered');
		if (PeakConstants.app == 'website') {
			var sw_url = PeakConstants.serviceWorker_path ? PeakConstants.serviceWorker_path : `./PeakServiceWorker.js`;
		} else {
			sw_url = './service-worker.js'
		}

		if ('serviceWorker' in navigator) {
			let swRegOptions = {}
			if (PeakConstants.serviceWorker_scope) {
				swRegOptions.scope = PeakConstants.serviceWorker_scope;
			}
			let serviceWorkerRegistration = await navigator.serviceWorker.register(sw_url, swRegOptions)
			webapp.serviceWorkerRegistration = serviceWorkerRegistration;
			document.dispatchEvent(new CustomEvent('onServiceWorkerRegistered', {}));
			return serviceWorkerRegistration;
		}

		return Promise.reject();
	}

	// function showNotfEnablePopup() {
	// 	if (PeakPwa.webapp.getPermissionStatus() != 'default') return;

	// 	var cache_key_ts = 'notif-enable-popup-shown';

	// 	function showPopup() {
	// 		new PeakPwaUi.components.NotificationEnableComponent('pk-notif-popup').render().show();
	// 		webapp.idbCache.set(cache_key_ts, Date.now());
	// 	}

	// 	var delta_pd = convertJsonDeltaToMs(webapp.constants.notif_popup_throttle ? webapp.constants.notif_popup_throttle : {
	// 		"days": 1
	// 	});

	// 	if (!delta_pd) {
	// 		showPopup();
	// 		return;
	// 	}

	// 	//Check throttle
	// 	return webapp.idbCache.get(cache_key_ts).then(function (last_log) {
	// 		if (!last_log) return showPopup();
	// 		last_log = new Date(last_log).getTime();
	// 		var now = Date.now()
	// 		if ((now - last_log) > delta_pd) {
	// 			showPopup();
	// 		}
	// 	});
	// }

	webapp.injectCss = async function (url, parent=document) {
		const linkElem = document.createElement('link');
		linkElem.setAttribute('rel', 'stylesheet');
		linkElem.setAttribute('href', url);
		parent.appendChild(linkElem);
	}

	webapp.initListeners = function () {
		document.addEventListener('toggleSubscription', function (e) {
			if (webapp.serviceWorkerRegistration) {
				var userSubStatus = localStorage.getItem(LS_USER_SUBSCRIBED_STATUS);
				if (userSubStatus == 'subscribed') {
					webapp.unsubscribe();
				} else {
					webapp.subscribe();
				}
			}
		}, false);

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.addEventListener('message', (e) => {
				window.postMessage('onUnreadIncremented', location.origin);
			});
		}
	}

	webapp.getSubscription = function (callback) {
		if (webapp.subscription) {
			webapp.isSubscribed = true;
			return callback(webapp.subscription)

		} else if ('PushManager' in window) {
			webapp.serviceWorkerRegistration.pushManager.getSubscription()
				.then(function (subscription) {
					webapp.subscription = subscription;
					webapp.isSubscribed = !(subscription === null);
					callback(subscription)
				});

		} else {
			callback(null);
		}
	}

	/** Event utility  **/

	webapp.logVisitEvents = function () {
		if (!webapp.isOnline()) return;

		var events_to_log = [];

		var tracker_sn = webapp.getTrackerSerialno();
		if (tracker_sn) {
			events_to_log.push('daily_visit_with_tracker');
			events_to_log.push('visit_with_tracker');

			if (webapp.isAddedToHomescreen()) {
				events_to_log.push('pwa_visit');
				events_to_log.push('daily_pwa_visit');
			}

		} else if (!webapp.isPwaSupported() && !webapp.isNotificationSupported()) {
			webapp.logEvent('unsupported_browser', {
				browser_name: bowser.name,
				user_agent: navigator.userAgent,
				device: `${bowser.osname} - ${bowser.osversion}`
			});

		} else {
			events_to_log.push('visit_without_tracker');
		}

		if (events_to_log.length) webapp.logEvents(events_to_log);
	}

	webapp.logPwaFirstLaunchEvents = function () {
		webapp.logEvent("pwa_opened");
		if (!bowser.chrome) webapp.logEvent("appinstalled");
	}

	/** General Utility  **/

	webapp.isAddedToHomescreen = function () {
		//Check for undectable browsers
		var undetectable_standalone_browsers = ["samsung", "ucbrowser"];
		var webapp_start_url = '?homescreen=1'; // ?homescreen=1
		for (var i = 0; i < undetectable_standalone_browsers.length; i++) {
			var browser = undetectable_standalone_browsers[i].toLowerCase();
			if (window.navigator.userAgent.toLowerCase().indexOf(browser) > 0 && window.location.href.indexOf(webapp_start_url) > 0) {
				return true;
			}
		}

		return window.matchMedia('(display-mode: standalone)').matches;
	}

	webapp.isLoadedInFrame = function () {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	}

	webapp.urlB64ToUint8Array = function (base64String) {
		const padding = '='.repeat((4 - base64String.length % 4) % 4);
		const base64 = (base64String + padding)
			.replace(/\-/g, '+')
			.replace(/_/g, '/');

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (var i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}

	webapp.isMobile = function () {
		return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile|SamsungBrowser|UCBrowser)/);
	}

	webapp.isPwaSupported = function () {
		var browser_list = PWA_SUPPORTED_BROWSERS[bowser.mobile ? 'mobile' : 'desktop'];

		// Exception for chrome as it supports only after v66
		if (bowser.name == 'Chrome' && parseInt(bowser.version) < 66) return false;

		// On iOS, only allow Safari
		if (bowser.ios && !bowser.safari) return false;

		return (browser_list.indexOf(bowser.name) >= 0) ? true : false;
	}

	webapp.isNotificationSupported = function () {
		var browser_list = NOTIFICATIONS_SUPPORTED_BROWSERS[bowser.mobile ? 'mobile' : 'desktop'];

		// On iOS, reject all browsers
		if (bowser.ios && !bowser.safari) return false;

		return (browser_list.indexOf(bowser.name) >= 0) ? true : false;
	}

	webapp.getUiMode = function (self = this) {

		// Set mode
		var mode = '',
			isSubscribed = PeakPwa.isSubscribed(),
			permStatus = PeakPwa.getPermissionStatus(),
			addedToHome = PeakPwa.isAddedToHomescreen();

		switch (true) {
			case ( //(!isSubscribed && permStatus !== 'granted' && !addedToHome) ||
				(!PeakPwa.webapp.getTrackerSerialno())):
				mode = 'disabled'
				break;
			case ((isSubscribed && permStatus === 'granted')):
				mode = 'enabled'
				break;
			default:
				mode = 'pull';
		}
		return mode;
	}

	webapp.loadJS = function (url, implementationCode, location) {
		if (!location) location = document.body;
		var scriptTag = document.createElement('script');
		scriptTag.src = url;
		if (implementationCode) {
			scriptTag.onload = implementationCode;
			scriptTag.onreadystatechange = implementationCode;
		}
		location.appendChild(scriptTag);
	}

	webapp.uuidv4 = function () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	webapp.isOnline = function () {
		return navigator.onLine;
	}

	webapp.checkThrottle = function (delta, cache_key_ts) {
		var delta_pd = convertJsonDeltaToMs(delta);
		return webapp.idbCache.get(cache_key_ts)
			.then(function (last_log) {
				if (!last_log) return true;
				last_log = new Date(last_log).getTime();
				var now = Date.now()
				if ((now - last_log) > delta_pd) {
					return true;
				} else {
					return false;
				}
			});
	}

	function convertJsonDeltaToMs(delta) {
		var delta_s = 0;
		if (delta.days) delta_s += delta.days * 86400;
		if (delta.hours) delta_s += delta.hours * 3600;
		if (delta.minutes) delta_s += delta.minutes * 60;
		if (delta.seconds) delta_s += delta.seconds;
		return delta_s * 1000;
	}

	webapp.fixFormsTarget = function () {
		// This is meant to fix a but with form POSTs with target="_blank"
		var forms = document.querySelectorAll('form[target="_blank"]');
		for (var i = 0; i < forms.length; i++) {
			forms[i].removeAttribute("target");
		}
	}

	webapp.isUiAllowedOnPage = function () {
		return (!PeakConstants.allowed_paths || !PeakConstants.allowed_paths.length ||
				PeakConstants.allowed_paths.indexOf(window.location.pathname) >= 0) &&
			(PeakConstants.app == 'website')
	}


	/** Notification API **/

	webapp.getNotificationsUrl = async function (trackerSerialno, id = null) {
		var url = `${webapp.domain}/api/communication/notification/`;
		if (id) url += `${id}/`;
		url += `?bypass_sw=true&tracker__serialno=${trackerSerialno}&order_by=-createdAt&localize=true`;

		return url;
	}

	webapp.getNotifications = async function (noCache = false) {
		var serialno = webapp.getTrackerSerialno();
		let cached_notifs = await webapp.idbCache.getNotifications()
		if (!noCache && cached_notifs) return cached_notifs;
		let url = await webapp.getNotificationsUrl(serialno);
		let response = await fetch(url, {
			cache: "no-cache"
		})

		if (response.status < 300) {
			webapp.logEvent("fetch_notifications");
			var data = await response.json()
			var formatted_notifs = webapp.formatNotificationsList(data)
			webapp.idbCache.cacheNotifications(formatted_notifs);
			return formatted_notifs;
		}
	}

	webapp.deleteNotification = async function (id) {
		webapp.logEvent("delete_notification");
		var serialno = webapp.getTrackerSerialno();
		let url = await webapp.getNotificationsUrl(serialno, id)
		return fetch(url, {
			method: "DELETE",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		})
	}

	webapp.formatNotificationsList = function (data) {
		var formatted_notifs = [];
		for (var i = 0; i < data.results.length; i++) {
			var notif = {
				id: data.results[i].id,
				changeTitle: data.results[i].shared_notification.notification_title,
				changeMessage: data.results[i].shared_notification.notification_message,
				createdAt: data.results[i].createdAt
			}
			if (data.results[i].shared_notification.metadata) {
				for (var key in data.results[i].shared_notification.metadata) {
					if (data.results[i].shared_notification.metadata.hasOwnProperty(key)) {
						notif[key] = data.results[i].shared_notification.metadata[key];
					}
				}
			}

			if (data.results[i].metadata) {
				for (var key in data.results[i].metadata) {
					if (data.results[i].metadata.hasOwnProperty(key)) {
						notif[key] = data.results[i].metadata[key];
					}
				}
			}
			formatted_notifs.push(notif);
		}
		// console.log(formatted_notifs);
		return formatted_notifs;
	}


	/** State/Tracker API **/

	webapp.getInstallToken = function () {
		if (webapp.constants.install_token) return webapp.constants.install_token;
		if (webapp.is_safari_with_apns()) {
			var permData = window.safari.pushNotification.permission(webapp.apns_push_id)
			return permData.deviceToken;
		}

		let key = `${NAMESPACE}_installToken_${webapp.constants.state_data.id}`;
		var installToken = localStorage.getItem(key);
		if (!installToken) {
			installToken = webapp.uuidv4();
			localStorage.setItem(key, installToken);
		}
		return installToken;
	}

	webapp.getTrackerSerialno = function () {
		if (webapp.constants.tracker_serialno) return webapp.constants.tracker_serialno;
		let key = `${NAMESPACE}_trackerSerialno_${webapp.constants?.state_data?.id}`;
		var serialno = localStorage.getItem(key);
		return serialno;
	}

	webapp.getDeviceLibraryId = function() {
		return webapp.idbCache.get('deviceLibraryId')
	}

	webapp.setStateData = function(state)  {
		webapp.serialno = state.template.serialno;
		webapp.constants.serialno = state.template.serialno;
		webapp.constants.state_data = state;
		localStorage.setItem(`${NAMESPACE}_stateSerialno`, state.serialno);
		localStorage.setItem(`${NAMESPACE}_stateId`, state.id);
		localStorage.setItem(`${NAMESPACE}_stateEncodedId`, state.encoded_id);
	}

	webapp.getStateSerialno = function () {
		if (webapp.constants.state_serialno) return webapp.constants.state_serialno;
		var serialno = localStorage.getItem(`${NAMESPACE}_stateSerialno`);
		return serialno;
	}

	webapp.getTemplateId = function () {
		if (webapp.constants.template_id) return webapp.constants.template_id;
		return localStorage.getItem(`${NAMESPACE}_templateId`);
	}

	webapp.getStateUrl = function (trackerSerialno, id = null) {
		var url = `${webapp.domain}/api/passes/state/`;
		if (id) url += `${id}/`;
		// url += `?tracker__serialno=${trackerSerialno}`;
		return url;
	}

	webapp.getState = function (reload=false) {
		var cache_key = `state_data`;

		function fetchState() {
			return fetch(webapp.getStateUrl('', webapp.getStateId()), {
				method: "PUT",
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					serialno: webapp.getStateSerialno()
				})
			}).then(function (response) {
				if (response.status < 300) return response.json()
			}).then(function (data) {
				webapp.idbCache.set(cache_key, data);
				return data;
			});
		}

		if(reload) return fetchState();

		return webapp.idbCache.get(cache_key)
			.then((cached_state) => {
				if (cached_state) return cached_state;
				return fetchState();
			});
	}

	webapp.updateState = function (state_payload) {
		var cache_key = `state_data`;
		return fetch(PeakPwa.webapp.getStateUrl('', PeakPwa.webapp.getStateId()), {
			method: "PUT",
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(state_payload)
		}).then(function (response) {
			if (response.status < 300) {
				response.json().then(function (data) {
					PeakPwa.idbCache.set(cache_key, data);
					return data;
				});
			}
		})
	}

	webapp.getStateId = function () {
		if (webapp.constants.state_id) return webapp.constants.state_id;
		return localStorage.getItem(`${NAMESPACE}_stateId`);
	}
	
	webapp.getStateEncodedId = function () {
		if (webapp.constants.state_id) return webapp.constants.state_id;
		return localStorage.getItem(`${NAMESPACE}_stateEncodedId`);
	}


	/** Preference Definitions API **/

	webapp.getPreferencesUrl = function () {
		var url = `${webapp.domain}/api/communication/preferencedefinition/?serialno=${webapp.serialno}&order_by=display_position&display=true&content_type__name=checkbox`;
		return url;
	}

	webapp.getPreferenceDefinitions = function () {
		var cache_key = 'preference_defs',
			cache_key_ts = 'preference_defs_ts';

		function fetchPreferences() {
			return fetch(webapp.getPreferencesUrl(), {
				method: "GET",
				headers: {
					'content-type': 'application/json'
				}
			}).then(function (response) {
				if (response.status < 300) {
					return response.json()
				}
			}).then(function (data) {
				webapp.idbCache.set(cache_key, data);
				webapp.idbCache.set(cache_key_ts, Date.now());
				return data;
			});
		}

		return webapp.idbCache.get(cache_key).then((cached_data) => {
			if (!cached_data) return fetchPreferences();

			// Check for throttle
			var delta_pd = webapp.constants.preference_defs_throttle ? convertJsonDeltaToMs(webapp.constants.preference_defs_throttle) : false;
			if (!delta_pd) {
				return cached_data ? cached_data : fetchPreferences()
			}

			if (delta_pd) {
				return webapp.idbCache.get(cache_key_ts).then(function (last_log) {
					if (!last_log) return fetchPreferences();
					last_log = new Date(last_log).getTime();
					var now = Date.now()
					if ((now - last_log) > delta_pd) {
						return fetchPreferences();
					} else {
						return cached_data;
					}
				});
			}
		});
	}


	/** LoyaltyActions/Data/Config **/

	webapp.getLoyaltyData = function (no_cache) {
		var cache_key = 'ldata';

		function fetchLoyaltyData() {
			return fetch(webapp.getLoyaltyDataUrl(), {
				method: "GET",
				headers: {
					'content-type': 'application/json'
				}
			}).then(function (response) {
				if (response.status < 300) {
					return response.json()
				}
			}).then(function (data) {
				webapp.idbCache.set(cache_key, data.results[0]);
				return data.results[0];
			});
		}

		return webapp.idbCache.get(cache_key)
			.then((cached_data) => {
				console.log(cached_data);
				if (!cached_data || no_cache) return fetchLoyaltyData();
				return cached_data;
			})
			.catch((err) => {
				console.log(err);
			});
	}

	webapp.getLoyaltyDataUrl = function () {
		var url = `${webapp.domain}/api/loyalty/loyaltydata/?serialno=${webapp.getStateSerialno()}`;
		return url;
	}

	webapp.getLoyaltyActions = function (no_cache) {
		var cache_key = 'loyalty_actions';

		function fetchActions() {
			return fetch(webapp.getLoyaltyActionsUrl(), {
				method: "GET",
				headers: {
					'content-type': 'application/json'
				}
			}).then(function (response) {
				if (response.status < 300) {
					return response.json()
				}
			}).then(function (data) {
				webapp.idbCache.set(cache_key, data.results);
				return data.results;
			});
		}

		return webapp.idbCache.get(cache_key).then((cached_data) => {
			if (!cached_data || no_cache) return fetchActions();
			return cached_data;
		});
	}

	webapp.getLoyaltyActionsUrl = function () {
		var url = `${webapp.domain}/api/loyalty/loyaltyaction/?serialno=${webapp.getStateSerialno()}`;
		return url;
	}


	/** PkPass Handling **/

	webapp.createAndGetWalletCardUrl = async function (state_sn = null, callback = null) {
		let wallet_url = (state_id, state_sn, template_sn) => `${webapp.constants.domain}/p/${template_sn}/state/${state_id}/${state_sn}/download/`;
		if (!state_sn) state_sn = webapp.getStateSerialno();
		if (!state_sn) {
			let state = await webapp.createStateForPass();
			state_sn = state.serialno
		}

		let state_id = webapp.getStateEncodedId();
		let pass_url = wallet_url(state_id, state_sn, webapp.constants.serialno)
		if (callback) callback(pass_url);
		return pass_url
	}

	webapp.createStateForPass = async function() {
		let response = await fetch(`${webapp.domain}/api/passes/state-action/create_temp_state/`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				template_serialno: webapp.constants.serialno
			})
		});

		let json = {}
		json = await response.json();

		webapp.setStateData(json.state);
		return json.state
	}

	webapp.isPkPassAdded = async function () {
		let state_sn = webapp.getStateSerialno()
		if (!state_sn) {
			return Promise.resolve(false);
		}

		let response = await fetch(`${webapp.domain}/api/passes/state-action/is_pkpass_added/`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				state_serialno: state_sn
			})
		})
		
		let json = await response.json();
		
		if(json.tracker && !webapp.getTrackerSerialno()) {
			localStorage.setItem(`${NAMESPACE}_trackerSerialno`, json.tracker.serialno);
			webapp.idbCache.set('trackerSerialno', json.tracker.serialno);
			webapp.idbCache.set('deviceLibraryId', json.tracker.devicelibraryid);
			webapp.logVisitEvents();
		}

		return json.is_pkpass_added
	}


	/** Push un/subscription **/

	webapp.getSubscriptionUrl = function (id = null) {
		if (webapp.is_safari_with_apns()) {
			var url = `${webapp.domain}/p/${webapp.serialno}/app/${webapp.app}/${webapp.deviceToken}/${webapp.deviceToken}/`;
		} else {
			var installToken = webapp.getInstallToken();
			url = `${webapp.domain}/p/${webapp.serialno}/app/${webapp.app}/${installToken}/${installToken}/`;
		}
		if (id) url += `${id}/`
		return url;
	}

	webapp.reportSubscriptionChange = function () {
		var userSubStatus = localStorage.getItem(LS_USER_SUBSCRIBED_STATUS);
		var event = new CustomEvent('onSubscriptionChange', {
			detail: {
				isSubscribed: (userSubStatus == 'subscribed')
			}
		});
		document.dispatchEvent(event);
	}

	webapp.reportSubscriptionChangeStart = function () {
		var userSubStatus = localStorage.getItem(LS_USER_SUBSCRIBED_STATUS);
		var event = new CustomEvent('onSubscriptionChangeStart', {});
		document.dispatchEvent(event);
	}

	webapp.is_safari_with_apns = function () {
		return 'safari' in window && 'pushNotification' in window.safari;
	}

	webapp.requestNotificationPermission = function () {
		return new Promise(function (resolve, reject) {

			if (webapp.is_safari_with_apns()) {

				// Check if perm has already been given
				let perm_data = window.safari.pushNotification.permission(PeakPwa.webapp.apns_push_id);

				if (perm_data.permission == 'granted') {
					webapp.deviceToken = perm_data.deviceToken;
					resolve(perm_data.permission);
				}

				var webPushUrl = `${webapp.domain}/p/${webapp.serialno}/app/${webapp.app}`;
				var webPushId = webapp.apns_push_id;
				var payload = {
					"web_service_url": webPushUrl,
					"serialno": webapp.serialno,
					"destination": document.location.href
				};
				// console.log(payload);

				window.safari.pushNotification.requestPermission(
					webPushUrl,
					webPushId,
					payload,
					(resultData) => {
						resolve(resultData.permission);
						if (resultData.permission == 'granted') {
							webapp.deviceToken = resultData.deviceToken;
						}
					}
				);

			} else {
				// const permissionResult = Notification.requestPermission(function (result) {
				// 	resolve(result);
				// });
				// if (permissionResult) {
				// 	permissionResult.then(resolve, reject);
				// }

				Notification.requestPermission().then(resolve, reject);
			}
		});
	}

	webapp.getSafariPushPayload = function () {
		let webPushUrl = `${webapp.domain}/p/${webapp.serialno}/app/${webapp.app}`;
		let webPushId = webapp.apns_push_id;
		let payload = {
			"web_service_url": webPushUrl,
			"serialno": webapp.serialno,
			"destination": document.location.href
		};
		return payload;
	}

	webapp.getPermissionStatus = function () {
		if ('Notification' in window) {
			if (bowser.safari && typeof safari != 'undefined') {
				return window.safari.pushNotification.permission(PeakPwa.webapp.apns_push_id).permission;
			}
			return Notification.permission;
		} else {
			return 'unavailable';
		}
	}

	webapp.requestNotificationPermissionAndSubscribe = function (callback) {

		return webapp.requestNotificationPermission()
			.then(function (permissionResult) {
				if (permissionResult === 'ignore') {
					// console.log('Permission ignored... bypass');

				} else if (permissionResult !== 'granted') {
					var previouslyDenied = localStorage.getItem(LS_DENIED_NOTIF_PERMISSION) || false;
					if (!previouslyDenied) {
						webapp.logEvent("perm_notif_denied");
					}
					localStorage.setItem(LS_DENIED_NOTIF_PERMISSION, true);
					webapp.reportSubscriptionChange();

				} else {
					webapp.logEvent("perm_notif_granted");
					localStorage.setItem(LS_DENIED_NOTIF_PERMISSION, false);
					webapp.reportSubscriptionChangeStart();
					webapp.handlePermissionGranted(callback);
				}
				return permissionResult;
			})
			.catch(function (err) {
				console.log(err);
			});
	}

	webapp.handlePermissionGranted = async function (callback) {
		if (!webapp.is_safari_with_apns()) {
			let subscription = await webapp.serviceWorkerRegistration.pushManager.getSubscription()
			// If subscription exists, just register with backend
			// Else get subscription, and register with backend.
			webapp.isSubscribed = !(subscription === null);
			if (webapp.isSubscribed) {
				localStorage.setItem(LS_USER_SUBSCRIBED_STATUS, 'subscribed');
				webapp.subscription = subscription;
				webapp.isSubscribed = true;
				webapp.subscribeWithBackend(callback);

			} else {
				const applicationServerKey = webapp.urlB64ToUint8Array(webapp.vapid);
				subscription = await webapp.serviceWorkerRegistration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: applicationServerKey
				});

				if (subscription) {
					localStorage.setItem(LS_USER_SUBSCRIBED_STATUS, 'subscribed');
					webapp.subscription = subscription;
					webapp.isSubscribed = true;
					await webapp.subscribeWithBackend(callback);
				}
			}

		} else {
			localStorage.setItem(LS_USER_SUBSCRIBED_STATUS, 'subscribed');
			var permData = window.safari.pushNotification.permission(webapp.apns_push_id)
			webapp.subscription = permData.deviceToken;
			webapp.isSubscribed = true;
			await webapp.subscribeWithBackend(callback);
		}
	}

	webapp.subscribeWithBackend = async function (callback) {
		// console.log('subscribeWithBackend');

		var sub_payload = {
			"device_type": window.navigator.platform,
			"certificate_for": null,
		};

		if (webapp.state_xid) {
			sub_payload.xid = webapp.state_xid;
		}

		if (webapp.is_safari_with_apns()) {
			sub_payload.push_token = webapp.subscription ? webapp.subscription : JSON.stringify({});
			sub_payload.pass_type_id = PeakConstants.apns_push_id;
		} else {
			sub_payload.push_token = webapp.subscription ? JSON.stringify(webapp.subscription) : JSON.stringify({});
		}

		let state_data = localStorage.getItem('state_data')
		if(state_data) {
			state_data = JSON.parse(state_data);
			sub_payload.xid = state_data.xid;
		}

		// Set install param if passed
		let install_param = localStorage.getItem('install_parameter');
		if(install_param) sub_payload.install_parameter = install_param;

		let response = await fetch(webapp.getSubscriptionUrl(), {
			method: "POST",
			body: JSON.stringify(sub_payload),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		})

		var json = {}
		try {
			json = await response.json();
		} catch (e) {}

		var isNewSub = webapp.getTrackerSerialno() ? false : true;

		localStorage.setItem(`${NAMESPACE}_trackerSerialno_${json.state.id}`, json.tracker.serialno);
		localStorage.setItem(`${NAMESPACE}_stateSerialno`, json.state.serialno);
		localStorage.setItem(`${NAMESPACE}_stateId`, json.state.id);
		localStorage.setItem(`${NAMESPACE}_stateEncodedId`, json.state.encoded_id);
		if(json.template) {
			localStorage.setItem(`${NAMESPACE}_templateId`, json.template.id);
		}
		webapp.idbCache.set('pushToken', sub_payload.push_token);
		webapp.idbCache.set('trackerSerialno', json.tracker.serialno);

		webapp.logVisitEvents();
		if (sub_payload.push_token != '{}') {
			webapp.logEvent("reg_with_pushtoken");
		}

		if (isNewSub) document.dispatchEvent(new CustomEvent('PeakPwaInitalSubscription', {}));
		if (callback) callback();
		
		webapp.reportSubscriptionChange();
	}

	webapp.unsubscribeWithBackend = function () {
		// console.log('unsubscribeWithBackend');
		fetch(webapp.getSubscriptionUrl(), {
			method: "DELETE",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			webapp.reportSubscriptionChange();
		});
	}

	webapp.subscribe = async function (callback) {
		if (!webapp.serviceWorkerRegistration) return;

		webapp.reportSubscriptionChangeStart();

		// Auto subscribe on chrome if permission has already been given
		if ('Notification' in window && webapp.subscription == null && Notification.permission == 'granted') {
			await webapp.handlePermissionGranted(callback);

			// Handle Safari subscription
		} else if (webapp.is_safari_with_apns()) {
			var permData = window.safari.pushNotification.permission(webapp.apns_push_id);
			if (!permData.deviceToken) return;
			webapp.subscription = permData.deviceToken;
			localStorage.setItem(LS_USER_SUBSCRIBED_STATUS, 'subscribed');
			await webapp.subscribeWithBackend(callback);

		} else if (bowser.mobile && bowser.safari) {
			localStorage.setItem(LS_USER_SUBSCRIBED_STATUS, 'subscribed');
			await webapp.subscribeWithBackend(callback);

		} else {
			let subscription = await webapp.serviceWorkerRegistration.pushManager.getSubscription()
			localStorage.setItem(LS_USER_SUBSCRIBED_STATUS, 'subscribed');
			webapp.subscription = subscription;
			webapp.isSubscribed = true;
			await webapp.subscribeWithBackend(callback);
		}
	}

	webapp.unsubscribe = function () {
		if (webapp.serviceWorkerRegistration) {
			webapp.reportSubscriptionChangeStart();
			if (webapp.is_safari_with_apns()) {
				var permData = window.safari.pushNotification.permission(webapp.apns_push_id)
				webapp.subscription = permData.deviceToken;
				webapp.isSubscribed = false;
				localStorage.setItem(LS_USER_SUBSCRIBED_STATUS, 'unsubscribed');
				webapp.unsubscribeWithBackend();
			} else {
				webapp.serviceWorkerRegistration.pushManager.getSubscription()
					.then(function (subscription) {
						webapp.subscription = subscription;
						webapp.isSubscribed = false;
						localStorage.setItem(LS_USER_SUBSCRIBED_STATUS, 'unsubscribed');
						webapp.unsubscribeWithBackend();
					});
			}
		}
	}

	webapp.inSubscribedStatus = function () {
		var userSubStatus = localStorage.getItem(LS_USER_SUBSCRIBED_STATUS);
		return userSubStatus === 'subscribed';
	}

	webapp.updateTokenIfChanged = async function () {
		if (!bowser.safari && webapp.getTrackerSerialno()) {
			let token = await webapp.serviceWorkerRegistration.pushManager.getSubscription()
			token = token ? JSON.stringify(token) : JSON.stringify({});

			var cachedToken = await webapp.idbCache.get('pushToken');

			if (cachedToken != token) {
				await webapp.updateToken(token);
				PeakPwa.webapp.logEvent(token != "{}" ? 'push_token_set' : 'push_token_cleared');
			}

			if ((token == '{}') && PeakPwa.webapp.getPermissionStatus() == 'granted') {
				webapp.handlePermissionGranted();
			}
		}
	}

	webapp.updateToken = async function (push_token) {
		var payload = {
			push_token: push_token
		}
		let response = await fetch(`${webapp.domain}/api/passes/tracker/${webapp.getTrackerSerialno()}/updatetoken/`, {
			method: "POST",
			body: JSON.stringify(payload),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		})
		await webapp.idbCache.set('pushToken', push_token);
	}

	webapp.logEvent = function(event) {
		webapp.logEvents([event]);
	} 

	webapp.logEvents = async function (events) {
		if (!webapp.isOnline()) return;
		
		// console.log(events);

		// Check and filter out throttled events
		var c_promises = [];
		for (var i = 0; i < events.length; i++) {
			c_promises.push(checkEventThrottle(events[i]));
		}
		events = await Promise.all(c_promises)
		events = events.filter(function (value, index, arr) {
			return value ? value : false;
		});

		if (!events.length) return;

		// Log events
		let payload = {
			'app': webapp.app,
			'action_list': events,
			'action_qualifier': '',
			'template_serialno': webapp.serialno,
			'tracker_serialno': webapp.getTrackerSerialno(),
			'metadata': {}
		};

		if (bowser.mobile && bowser.safari) {
			var device_lib_id = await webapp.getDeviceLibraryId();
			if (device_lib_id) {
				payload['tracker_devicelibraryid'] = device_lib_id;
			}			
		}

		var serialno = webapp.getTrackerSerialno();
		let response = await fetch(`${webapp.domain}/api/passes/action/log/`, {
			method: "POST",
			cache: "no-cache",
			body: JSON.stringify(payload),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		})
		
		// If tracker/template not found, reset
		if (response.status == 400) {
			let text = await response.text();
			if (text.toLowerCase().indexOf('template') >= 0 || text.toLowerCase().indexOf('tracker') >= 0) {
				webapp.reset();
				return;
			}
		}

		// Update throttles
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			if (webapp.constants.action_throttles[event]) {
				var cache_key = `${NAMESPACE}_throttle_${event}`;
				localforage.setItem(cache_key, Date.now())
			}
		}
	}

	async function checkEventThrottle(event) {
		if (!webapp.constants.action_throttles && !webapp.constants.action_throttles[event]) {
			return event;
		}

		var cache_key = `${NAMESPACE}_throttle_${event}`;
		let last_log = await localforage.getItem(cache_key)
		if (!last_log) return event;
		
		last_log = new Date(last_log).getTime();
		var now = Date.now()
		var throttle_delta = getThrottleDelta(event);
		if ((now - last_log) > throttle_delta) {
			return event;
		} else {
			return false;
		}
	}

	function getThrottleDelta(event) {
		var delta = webapp.constants.action_throttles[event];
		if (!delta) return 0;
		return convertJsonDeltaToMs(delta);
	}


	/** Location Handling **/

	webapp.isGeoLocationEnabled = function () {
		if (localStorage.getItem(`${NAMESPACE}_geo_enabled`) == 'true') {
			return true;
		} else {
			return false;
		}
	}

	webapp.getGeolocation = function (onSuccess, onError) {
		function showLocation(position) {
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			localStorage.setItem(`${NAMESPACE}_geo_enabled`, 'true');
			// console.log("Latitude : " + latitude + " Longitude: " + longitude);

			if (latitude == localStorage.getItem(`${NAMESPACE}_geo_lat`) &&
				longitude == localStorage.getItem(`${NAMESPACE}_geo_long`)) {
				// console.log('Not updating location as location is unchanged.')
				if (typeof onSuccess == 'function') onSuccess(latitude, longitude);
				return;
			}

			localStorage.setItem(`${NAMESPACE}_geo_lat`, latitude);
			localStorage.setItem(`${NAMESPACE}_geo_long`, longitude);
			webapp.updateLocation(latitude, longitude);
			if (typeof onSuccess == 'function') onSuccess(latitude, longitude);
		}

		function errorHandler(err) {
			// console.log(err)
			localStorage.setItem(`${NAMESPACE}_geo_enabled`, 'false')
			if (typeof onError == 'function') onError(err);
			// if(err.code == 1) {
			// 	// alert("Error: Access is denied!");
			// }	else if( err.code == 2) {
			// 	// alert("Error: Position is unavailable!");
			// }
		}

		if (navigator.geolocation) {
			var options = {
				timeout: 60000
			};
			navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
		} else {
			// console.log("Sorry, browser does not support geolocation!");
		}
	}

	webapp.updateLocation = function (lat, lng) {
		var tracker_sn = webapp.getTrackerSerialno();
		if (!tracker_sn) return;
		fetch(`${webapp.domain}/p/${tracker_sn}/locations/`, {
			method: "POST",
			body: JSON.stringify({
				lat: lat,
				lng: lng
			})
		}).then((response) => {

		})
	}

	webapp.updateLocIfNeeded = function () {
		if (bowser.name == 'Safari') {
			return;
		}
		if (!webapp.isOnline()) return;

		var delta = webapp.constants.location_update_throttle;
		if (!delta) return;

		var cache_key = `${NAMESPACE}_location_update_ts`;
		var throttle_delta = convertJsonDeltaToMs(delta);
		localforage.getItem(cache_key)
			.then(function (last_log) {
				if (!last_log) {
					localforage.setItem(cache_key, Date.now())
					webapp.getGeolocation()
					return;
				}
				last_log = new Date(last_log).getTime();
				var now = Date.now()
				if ((now - last_log) > throttle_delta) {
					// console.log('Updating Location..');
					webapp.getGeolocation()
					localforage.setItem(cache_key, Date.now())
				} else {
					// console.log('Not Updating Location');
				}
			});
	}


	/** IndexedDB Cache **/

	webapp.idbCache = (function () {
		var IDB_CACHES = {
			notif: 'notifs-db',
			ldata: 'ldata-db',
			unread: 'unread-db'
		}

		function getLoyaltyData() {
			return localforage.getItem(IDB_CACHES.ldata)
				.catch(function (err) {});
		}

		function getNotifications() {
			return localforage.getItem(IDB_CACHES.notif)
				.catch(function (err) {
					// console.log(err);
				});
		}

		function deleteNotification(id) {
			return localforage.getItem(IDB_CACHES.notif)
				.then((data) => {
					if (!data) data = [];
					for (var j = 0; j < data.length; j++) {
						if (data[j].id == id || (!data[j].id && !id)) {
							data.splice(j, 1)
						}
					}

					return localforage.setItem(IDB_CACHES.notif, data);
				})
		}

		function cacheNotifications(notifs) {
			return localforage.setItem(IDB_CACHES.notif, notifs);
		}

		function getUnreadCount() {
			return localforage.getItem(IDB_CACHES.unread)
				.catch(function (err) {
					// console.log(err);
				});
		}

		function setUnreadCount(count) {
			return localforage.setItem(IDB_CACHES.unread, count);
		}

		function dropCaches() {
			localforage.clear();
			for (var key in IDB_CACHES) {

			}
		}

		function set(key, val) {
			return localforage.setItem(key, val);
		}

		function get(key) {
			return localforage.getItem(key);
		}

		function init() {
			if (webapp.constants.app != 'website' && webapp.constants.tracker_serialno) {
				var tracker_sn = webapp.constants.tracker_serialno;
				IDB_CACHES = {
					notif: `notifs-db-${tracker_sn}`,
					ldata: `ldata-db-${tracker_sn}`,
					unread: `unread-db-${tracker_sn}`
				}
			}

			if (webapp.constants.app != 'website') {
				var serialno = webapp.constants.tracker_serialno;
				serialno.replace('-', '_');
				console.log('idbCache init');
				localforage.config({
					name: webapp.constants.tracker_serialno ? `PeakPwa_${serialno}` : 'PeakPwa',
					version: 1.0,
					storeName: 'PeakPwaStore',
					description: 'A storage for PeakPwa specific items.'
				});
			}
		}

		return {
			init: init,
			getLoyaltyData: getLoyaltyData,
			getNotifications: getNotifications,
			deleteNotification: deleteNotification,
			cacheNotifications: cacheNotifications,
			getUnreadCount: getUnreadCount,
			setUnreadCount: setUnreadCount,
			dropCaches: dropCaches,
			set: set,
			get: get,
			IDB_CACHES: IDB_CACHES
		}
	})();


	/** Browser Support **/

	webapp.getSupportedBrowsersForPwa = function () {
		return PWA_SUPPORTED_BROWSERS;
	}

	webapp.getSupportedBrowsersForNotifications = function () {
		return NOTIFICATIONS_SUPPORTED_BROWSERS;
	}

	webapp.reload = function () {
		if (webapp.onReload && typeof (webapp.onReload) == 'function') {
			webapp.onReload();
		}

		//Drop all default IDB caches
		if (webapp.idbCache) webapp.idbCache.dropCaches();

		//Msg SW to reload or reload
		if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage('refresh');
		} else {
			location.reload();
		}
	}

	webapp.reset = function () {
		webapp.idbCache.dropCaches();
		localStorage.clear();
		let isPermGranted = webapp.getPermissionStatus() == 'granted';
		if (isPermGranted) {
			webapp.subscribe(function () {
				webapp.logVisitEvents();
			});
		} else {
			webapp.reportSubscriptionChange();
		}
	}

	return {
		init: webapp.init,
		subscribe: webapp.subscribe,
		unsubscribe: webapp.unsubscribe,
		isSubscribed: webapp.inSubscribedStatus,
		isMobile: webapp.isMobile,
		isOnline: webapp.isOnline,
		isAddedToHomescreen: webapp.isAddedToHomescreen,
		getNotifications: webapp.getNotifications,
		// getLatestNotifications: webapp.getLatestNotifications,
		deleteNotification: webapp.deleteNotification,
		requestNotificationPermissionAndSubscribe: webapp.requestNotificationPermissionAndSubscribe,
		getPermissionStatus: webapp.getPermissionStatus,
		idbCache: webapp.idbCache,
		getUiMode: webapp.getUiMode,
		isPwaSupported: webapp.isPwaSupported,
		isNotificationSupported: webapp.isNotificationSupported,
		webapp: webapp
	}
}();

export default PeakPwa