/*
    Requirements
    1. Register and handle Progressive Web App Criteria
    2. Handle content caching, offline content, and refreshing asynchronously
    3. Provide push registeration and notification handling
*/

// Come up with a pass specific scheme to avoid collisions with other passes served from the same server.
var dataCacheName = 'pass-data-v1';
var cacheName = 'pass-cache-v1';
var OFFLINE_URL = 'https://d3qu4ca2fqz9dn.cloudfront.net/peak_offline.html'
var filesToCache = [
	OFFLINE_URL,
	'https://staging.peakengage.com/s/d/aadhaar/',
	'https://s3-us-west-2.amazonaws.com/engagementservices-us-west-2/Resources/Default/main.css',
	'https://s3-us-west-2.amazonaws.com/engagementservices-us-west-2/Resources/Default/main.js'
];
var mLastPush = null;
var constants = {};
var PWA_SUPPORTED_BROWSERS = {
	desktop: ['Chrome'],
	mobile: ['Samsung Internet for Android', 'Chrome', 'Firefox', 'Safari']
}
var swRegistration = self.registration

self.importScripts('https://d3qu4ca2fqz9dn.cloudfront.net/localforage.min.js');
self.importScripts('https://d3qu4ca2fqz9dn.cloudfront.net/bowser.min.js');
// configStorage();

self.addEventListener('install', function (e) {
	// console.log('[ServiceWorker] Install');
	e.waitUntil(
		caches.open(cacheName).then(function (cache) {
			// console.log('[ServiceWorker] Caching app shell');
			return cache.addAll(filesToCache);
			// return cache.addAll(filesToCache.map(function(urlToPrefetch) {
			//   return new Request(urlToPrefetch, { mode: 'no-cors' });
			// }));
		})
	);
});

self.addEventListener('activate', function (e) {
	// console.log('[ServiceWorker] Activate');
	e.waitUntil(
		caches.keys().then(function (keyList) {
			return Promise.all(keyList.map(function (key) {
				if (key !== cacheName && key !== dataCacheName) {
					// console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
			}));
		})
	);
	/*
	 * Fixes a corner case in which the app wasn't returning the latest data.
	 * You can reproduce the corner case by commenting out the line below and
	 * then doing the following steps: 1) load app for first time so that the
	 * initial New York City data is shown 2) press the refresh button on the
	 * app 3) go offline 4) reload the app. You expect to see the newer NYC
	 * data, but you actually see the initial data. This happens because the
	 * service worker is not yet activated. The code below essentially lets
	 * you activate the service worker faster.
	 */
	return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
	console.log('[SW] - fetch');
	console.log(event.request);
	// event.respondWith(
	//
	// 	fetch(event.request)
	// 		.catch(function() {
	// 			console.log('[ServiceWorker] Fetch Failed for ', event.request.url);
	// 		})
	// );

	if (!navigator.onLine) {
		event.respondWith(
			caches.match(event.request.url)
		)
	}
});

self.addEventListener('push', function (event) {
	console.log('[Service Worker] Push Received.');

	try {
		mLastPush = JSON.parse(event.data.text());
	} catch (e) {
		// No op
	}

	console.log(mLastPush)

	// Cache the notification
	if (mLastPush.changeMessage) {
		cacheNotif(mLastPush).then(function () {
			return broadcastMessage({
				action: 'push_received',
				notification: mLastPush
			});
		});
	}

	// Report Push Received
	if (mLastPush.messageentry) {
		reportHeartbeat(mLastPush);
	}


	// Show a notification
	if (mLastPush.changeMessage) {

		const notificationPromise = getConstants()
			.then((constants) => {
				const options = {
					body: mLastPush.changeMessage,
					badge: '',
					tag: mLastPush.id
				};

				// Set icon/image if needed
				if (constants && constants.notification_icon) options.icon = constants.notification_icon;
				if (mLastPush.image) options.image = mLastPush.image;

				console.log(options);

				return self.registration.showNotification(mLastPush.changeTitle, options);
			});

		return event.waitUntil(notificationPromise);
	}
});

self.addEventListener('notificationclick', function (event) {
	console.log('[Service Worker] On notification click: ', event.notification.tag);

	// Close notification
	event.notification.close();

	// Get all open clients
	event.waitUntil(clients.matchAll({
		type: "window"
	}).then(async function (clientList) {
		// console.log('On notification click: ', event.notification.tag);

		let constants = getConstants();
		var pwaSupported = isPwaSupported() && constants.a2hs;
		var non_pwa_clients = [];
		let notif = await getNotification(event.notification.tag);
		let isCustomLink = (notif && notif.link);
		console.log(notif);

		// Focus client if it is open in PWA mode.
		if (pwaSupported) {
			for (var i = 0; i < clientList.length; i++) {
				var client = clientList[i];
				if (client.url.indexOf('homescreen=1') != -1 && 'focus' in client && !isCustomLink) {
					return client.focus();
				} else {
					non_pwa_clients.push(client);
				}
			}
		} else {
			non_pwa_clients = clientList;
		}

		// Focus non-pwa clients if available
		for (var i = 0; i < non_pwa_clients.length; i++) {
			return non_pwa_clients[i].focus();
		}

		let url = isCustomLink ? notif.link : self.registration.scope;

		if (pwaSupported) url = url += '?homescreenn=1';
		
		if (clients.openWindow)
			await clients.openWindow(url);
	}));
});

self.addEventListener('pushsubscriptionchange', function (event) {
	console.log('[Service Worker] pushsubscriptionchange');
	event.waitUntil(
		handlePushTokenChange(event)
	);
});


async function handlePushTokenChange(event) {
	// push_token = await swRegistration.pushManager.subscribe(event.oldSubscription.options);
	console.log('[Service Worker] Updating push token')


	let tracker_cached = await localforage.getItem('trackerSerialno');
	if (!tracker_cached) return;

	let constants = await getConstants();

	const applicationServerKey = urlB64ToUint8Array(constants.vapid);
	let push_token = await swRegistration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: applicationServerKey
	})

	push_token = push_token ? JSON.stringify(push_token) : JSON.stringify({});
	let response = await fetch(`${constants.domain}/api/passes/tracker/${tracker_cached}/updatetoken/`, {
		method: "POST",
		body: JSON.stringify({
			push_token: push_token
		}),
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	})

	try {
		var json = response.json();
	} catch (e) {
		json = {}
	}

	await localforage.setItem('pushToken', push_token);
	await logEvent('pushsubscriptionchange');
	return
}

async function logEvent(event, action_qualifier, metadata) {
	// console.log(`Logging ${event}..`);
	let serialno = await localforage.getItem('trackerSerialno');
	if (!serialno) return;
	let constants = await getConstants();
	fetch(`${constants.domain}/api/passes/action/log/`, {
		method: "POST",
		cache: "no-cache",
		body: JSON.stringify({
			'app': constants.app,
			'action': event,
			'action_qualifier': action_qualifier ? action_qualifier : '',
			'template_serialno': constants.serialno,
			'tracker_serialno': serialno,
			'metadata': metadata ? metadata : {}
		}),
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	});
}

function messageClient(client, message) {
	return new Promise(function (resolve, reject) {
		var channel = new MessageChannel();
		channel.port1.onmessage = function (event) {
			if (event.data.error) {
				reject(event.data.error);
			} else {
				resolve(event.data);
			}
		};
		client.postMessage(message, [channel.port2]);
	});
}

function broadcastMessage(message) {
	clients.matchAll().then(clients => {
		clients.forEach(client => {
			messageClient(client, message);
		})
	})
}

function reportHeartbeat(push) {
	localforage.getItem('trackerSerialno').then(function (tracker_cached) {
		getConstants().then(function (constants) {
			var url = `${constants.domain}/p/${tracker_cached}/ping/`

			var data = {};
			if (push.messagequery) data.messagequery = push.messagequery;
			if (push.messageentry) data.messageentry = push.messageentry;

			fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then((res) => {
				// console.log(`${res.status} Reported heartbeat!`);
			});
		});
	});
}

function getConstants() {
	return localforage.getItem('peak_constants')
		.then((constants) => {
			return constants;
		})
}

function cacheNotif(notif) {
	var NOTIF_DB = 'notifs-db';
	// console.log(`[SW] Caching notif`);
	// console.log(notif);

	notif.createdAt = new Date().toISOString();

	if (notif.notification) {
		notif.id = notif.notification.id;
		delete notif['notification'];
	}

	return localforage.getItem(NOTIF_DB)
		.then((data) => {
			if (!data) data = [];
			data.unshift(notif);
			return localforage.setItem(NOTIF_DB, data);
		})
		.then(() => {
			return incUnreadCount();
		});
}

function getNotification(id) {
	var NOTIF_DB = 'notifs-db';
	// console.log(`[SW] Deleting notif`);
	// console.log(id);

	return localforage.getItem(NOTIF_DB)
		.then((data) => {
			if (!data) data = [];

			for (j = 0; j < data.length; j++) {
				// console.log(data[j].id);
				if (data[j].id == id) return data[j];
			}
		})
}

function deleteNotif(id) {
	var NOTIF_DB = 'notifs-db';
	// console.log(`[SW] Deleting notif`);
	// console.log(id);

	return localforage.getItem(NOTIF_DB)
		.then((data) => {
			if (!data) data = [];

			for (j = 0; j < data.length; j++) {
				// console.log(data[j].id);
				if (data[j].id == id) data.splice(j, 1)
			}

			return localforage.setItem(NOTIF_DB, data);
		})
}

async function fetchNotifications() {
	console.log(`[SW] fetchNotifications`);
	let constants = await getConstants()
	var url = '{{domain}}/api/communication/notification/?tracker={{tracker.id}}&order_by=-createdAt';

	return fetch(url).then(response => {
		return response.json();
	}).then(data => {
		// console.log(data);
		var NOTIF_DB = 'notifs-db';
		if (data.results.length) {
			var formatted_notifs = [];
			for (var i = 0; i < data.results.length; i++) {
				var notif = {
					id: data.results[i].id,
					changeTitle: data.results[i].notification_title,
					changeMessage: data.results[i].notification_message,
					createdAt: data.results[i].createdAt
				}
				formatted_notifs.push(notif);
			}
			// console.log(formatted_notifs);
			return localforage.setItem(NOTIF_DB, formatted_notifs).then(function () {
				broadcastMessage({
					refresh: true
				});
			});
		} else {
			return localforage.setItem(NOTIF_DB, []).then(function () {
				broadcastMessage({
					refresh: true
				});
			});
		}
	});
}

function incUnreadCount() {
	var UNREAD_DB = 'unread-db';
	// console.log(`[SW] Inc Unread`);

	return localforage.getItem(UNREAD_DB)
		.then((count) => {
			if (!count) count = 0;
			count++;
			// console.log(`[SW] Count - ${count}`);
			return localforage.setItem(UNREAD_DB, count);
		})
}

function configStorage() {
	localforage.config({
		name: 'PeakPwa',
		version: 1.0,
		storeName: `PeakPwaStore`,
		description: 'A storage for PeakPwa specific items.'
	});
}

function isPwaSupported() {
	var browser_list = PWA_SUPPORTED_BROWSERS[bowser.mobile ? 'mobile' : 'desktop'];
	// Exception for chrome as it supports only after v66
	if (bowser.name == 'Chrome' && parseInt(bowser.version) < 66) return false;
	return (browser_list.indexOf(bowser.name) >= 0) ? true : false;
}

function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (var i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}