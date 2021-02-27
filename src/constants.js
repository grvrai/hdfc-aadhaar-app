// console.log('Constants');
// console.log(process.env.NODE_ENV);

var Constants = {
	// Server config
	domain: "https://ask.peakengage.com",
	aadhaar_domain: "https://ask-data.peakengage.com",
	serialno: "",
	// apns_push_id: 'web.com.peakengage',
	app: "website",
	vapid: "BCevBY0GYL4SJyZbo9A24WYLVvbE_TZUDt2sxU9UWtCYAcXTsNJd5grS-6Ex2DXWxKqjtT9QGgKWMSMukXk4FXE",

	// Resources config
	cdn: "https://d3qu4ca2fqz9dn.cloudfront.net/",
	s3_url: "https://d3qu4ca2fqz9dn.cloudfront.net/",

	// Service worker config
	// serviceWorker_path: "/s/d/aadhaar/peak-serviceworker.js",
	serviceWorker_path:
		process.env.NODE_ENV == "development" ? `${process.env.PUBLIC_URL}/peak-serviceworker.js` : "/s/d/aadhaar/peak-serviceworker.js",
	// serviceWorker_path: '/s/d/aadhaar/peak-serviceworker.js',
	scope: "/welcome/",

	action_throttles: {
		unsupported_browser: {
			days: 360,
		},
		visit_without_tracker: {
			days: 1,
		},
		visit_with_tracker: {
			minutes: 10,
		},
		daily_visit_with_tracker: {
			days: 1,
		},
		daily_pwa_visit: {
			days: 1,
		},
		pwa_visit: {
			minutes: 10,
		},
		beforeinstallprompt: {
			days: 1,
		},
		pwa_instruct_shown: {
			minutes: 10,
		},
	},
	location_update_throttle: {
		minutes: 10,
	},
	preference_defs_throttle: {
		minutes: 10,
	},
	notif_popup_throttle: {
		days: 5,
	},
	ios_a2hs_throttle: {
		days: 0,
	},
	allow_beta_users: true,
	icon_position: "bottom-right",
};

export default Constants;
