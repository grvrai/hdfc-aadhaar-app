import React from "react";
import PeakPwa from "./../../services/peakpwa";

import NotificationPage from "./NotificationPage";

export default class NotificationContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isPermGranted: PeakPwa.getPermissionStatus() == "granted",
			isPushRecieved: false,
			error: null,
			data: null,
		};

		// this.handlePermissionChange = this.handlePermissionChange.bind(this);
		this.handlePushReceived = this.handlePushReceived.bind(this);
		this.deleteNotification = this.deleteNotification.bind(this);
	}

	async componentDidMount() {
		navigator.serviceWorker.addEventListener("message", this.handlePushReceived);

		this.setState({
			error: null,
		});

		try {
			this.setState({
				data: await PeakPwa.webapp.getNotifications(true),
			});
		} catch (err) {
			console.log(err);
			this.setState({
				error: err,
			});
		}
	}

	componentWillUnmount() {
		// document.removeEventListener('onSubscriptionChange', this.handlePermissionChange);
		navigator.serviceWorker.removeEventListener("message", this.handlePushReceived);
	}

	handlePermissionChange() {
		console.log("handlePermissionChange");
		this.setState({
			isPermGranted: PeakPwa.getPermissionStatus() == "granted",
		});
	}

	async handlePushReceived(e) {
		if (e.data.action == "push_received") {
			this.setState({
				data: await PeakPwa.webapp.getNotifications(),
			});
		}
	}

	async deleteNotification(id) {
		let res = await PeakPwa.deleteNotification(id);
		this.setState({
			data: await PeakPwa.webapp.getNotifications(true),
		});
	}

	render() {
		return (
			<NotificationPage items={this.state.data} deleteNotification={this.deleteNotification} error={this.state.error} />
		);
	}
}
