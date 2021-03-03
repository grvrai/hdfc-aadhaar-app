import React, {useEffect} from "react";

import Container from "@material-ui/core/Container";

import LoginPage from "./pages/Login/LoginPage";
import HomeView from "./pages/Home/HomeView";
import NotificationContainer from "./pages/NotificationPage/NotificationContainer";
import CustomerDataPage from "./pages/CustomerDataPage/CustomerDataPage";
import MarketingActivityPage from "./pages/MarketingActivity/MarketingActivityPage";
import DailyActivityPage from "./pages/DailyActivityPage/DailyActivityPage";
import OtherActivitiesPage from "./pages/OtherActivitiesPage/OtherActivitiesPage";
import IssuePage from "./pages/IssuePage/IssuePage";
import KYCChecksPage from "./pages/KYCChecksPage/KYCChecksPage";
import ChangePasswordForm from "./pages/Login/ChangePasswordForm";
import MenuAppBar from "./Components/MenuAppBar";
import BottomNav from "./Components/BottomNav";

import PeakPwa from "./services/peakpwa";

import Constants from "./constants";

import AuthService from "./services/auth-service";

import {
	// HashRouter as Router,
	Switch,
	Route,
	useLocation,
	withRouter,
	Redirect,
} from "react-router-dom";

// import PrivateRoute from './routes/PrivateRoute'
// import RestrictedRoute from './routes/RestrictedRoute'

import "./App.css";
import ContactForm from "./pages/ContactPage/ContactForm";

import {withConfirmationDialog} from "./Components/ConfirmationDialogProvider";
import {CircularProgress, Grid} from "@material-ui/core";

class App extends React.Component {
	constructor(props) {
		super(props);
		// console.log(AuthService)
		this.state = {
			user: AuthService.getUserData(),
			state: AuthService.getUserState(),
			isLoggedIn: AuthService.isLoggedIn(),
			isLoading: process.env.NODE_ENV != "development",
		};

		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);

		PeakPwa.webapp.registerServiceWorker();
	}

	// confirmContext = ConfirmationDialogContext

	componentDidMount() {
		navigator.serviceWorker.oncontrollerchange = function () {
			console.log("oncontrollerchange");
			window.location.reload();
		};
		var self = this;
		navigator.serviceWorker.ready.then(function (registration) {
			console.log("swready");
			registration.onupdatefound = function () {
				console.log("onupdatefound");
				self.props.context.openDialog({
					title: "App Updated",
					message: "The app has been updated, press the button below to reload",
					btnConfirmText: "Reload",
					btnDismissText: "Cancel",
					actionCallback: function (response) {
						if (!response) return;
						console.log("calling skip waiting");
						registration.waiting.postMessage({type: "SKIP_WAITING"});
					},
				});
			};
		});

		document.addEventListener("PeakPwaInit", function () {
			console.log('PeakPwaInit');
			//   if (!PeakPwa.webapp.installed) PeakPwa.subscribe();
			self.setState({
				isLoading: false
			})
		});

		// if (this.state.isLoggedIn && this.state.state) {

		// }
		PeakPwa.init(Constants, this.state.state);
	}

	login(user_data, state_data) {
		AuthService.login(user_data, state_data);

		this.setState({
			isLoggedIn: true,
			user: user_data,
			state: state_data,
		});
	}

	logout() {
		// localStorage.clear();
		AuthService.logout();

		this.setState({
			isLoggedIn: false,
			user: null,
			state: null,
		});

		this.props.history.push("/");
	}

	render() {
		if (this.state.isLoading) {
			return (
				<Grid container alignItems="center" justify="center" style={{padding: "2rem"}}>
					<CircularProgress color="secondary" size={20} />
				</Grid>
			);
		}
		if (!this.state.isLoggedIn) {
			return (
				<Switch>
					<Route path="/" render={(props) => <LoginPage onLoginSuccess={this.login} {...props} />}></Route>
					<Route render={() => <Redirect to="/" />} />
				</Switch>
			);
		} else {
			return (
				<div>
					<MenuAppBar onLogout={this.logout} />
					<ScrollToTop />
					<Container disableGutters style={{paddingTop: 56, paddingBottom: 56}}>
						<Switch>
							<Route
								path="/notifications"
								render={(props) => (
									<NotificationContainer state={this.state.state} user={this.state.user} {...props} />
								)}></Route>
							<Route
								path="/customerdata"
								render={(props) => (
									<CustomerDataPage state={this.state.state} user={this.state.user} {...props} />
								)}></Route>
							<Route
								path="/marketingactivity"
								render={(props) => (
									<MarketingActivityPage state={this.state.state} user={this.state.user} {...props} />
								)}></Route>
							<Route
								path="/dailyactivity"
								render={(props) => (
									<DailyActivityPage state={this.state.state} user={this.state.user} {...props} />
								)}></Route>
							<Route
								path="/issues"
								render={(props) => <IssuePage state={this.state.state} user={this.state.user} {...props} />}></Route>
							<Route
								path="/kyc_checks"
								render={(props) => (
									<KYCChecksPage state={this.state.state} user={this.state.user} {...props} />
								)}></Route>
							<Route
								path="/other_activities"
								render={(props) => (
									<OtherActivitiesPage state={this.state.state} user={this.state.user} {...props} />
								)}></Route>
							<Route path="/app_issue" render={(props) => <ContactForm {...props} />}></Route>
							<Route path="/change_password" render={(props) => <ChangePasswordForm {...props} />}></Route>
							<Route
								path="/"
								exact
								render={(props) => <HomeView state={this.state.state} user={this.state.user} {...props} />}></Route>
							<Route render={() => <Redirect to="/" />} />
						</Switch>
					</Container>
					<BottomNav />
				</div>
			);
		}
	}
}

function ScrollToTop() {
	const {pathname} = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

export default withRouter(withConfirmationDialog(App));
