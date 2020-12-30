import React, { useEffect } from "react";

import Container from "@material-ui/core/Container";

import LoginPage from "./pages/Login/LoginPage";
import HomeView from "./pages/Home/HomeView";
import NotificationContainer from "./pages/NotificationPage/NotificationContainer";
import CustomerDataPage from "./pages/CustomerDataPage/CustomerDataPage";
import MarketingActivityPage from "./pages/MarketingActivity/MarketingActivityPage";
import DailyActivityPage from "./pages/DailyActivityPage/DailyActivityPage";
import IssuePage from "./pages/IssuePage/IssuePage";
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
} from "react-router-dom";

// import PrivateRoute from './routes/PrivateRoute'
// import RestrictedRoute from './routes/RestrictedRoute'

import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    // console.log(AuthService)
    this.state = {
      user: AuthService.getUserData(),
      state: AuthService.getUserState(),
      isLoggedIn: AuthService.isLoggedIn(),
    };

    // console.log(this.state)

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);

    PeakPwa.webapp.registerServiceWorker();
  }

  componentDidMount() {
    document.addEventListener("PeakPwaInit", function () {
      // console.log('PeakPwaInit');
    //   if (!PeakPwa.webapp.installed) PeakPwa.subscribe();
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
    // console.log(this.state);
    if (!this.state.isLoggedIn) {
      return (
        <Switch>
          <Route
            path="/"
            // exact
            render={(props) => (
              <LoginPage onLoginSuccess={this.login} {...props} />
            )}></Route>
        </Switch>
      );
    } else {
      return (
        <div>
          <MenuAppBar onLogout={this.logout} />
          <ScrollToTop />
          <Container
            disableGutters
            style={{ paddingTop: 56, paddingBottom: 56 }}>
            <Switch>
              <Route
                path="/notifications"
                render={(props) => (
                  <NotificationContainer
                    state={this.state.state}
                    user={this.state.user}
                    {...props}
                  />
                )}></Route>
              <Route
                path="/customerdata"
                render={(props) => (
                  <CustomerDataPage
                    state={this.state.state}
                    user={this.state.user}
                    {...props}
                  />
                )}></Route>
              <Route
                path="/marketingactivity"
                render={(props) => (
                  <MarketingActivityPage
                    state={this.state.state}
                    user={this.state.user}
                    {...props}
                  />
                )}></Route>
              <Route
                path="/dailyactivity"
                render={(props) => (
                  <DailyActivityPage
                    state={this.state.state}
                    user={this.state.user}
                    {...props}
                  />
                )}></Route>
              <Route
                path="/issues"
                render={(props) => (
                  <IssuePage
                    state={this.state.state}
                    user={this.state.user}
                    {...props}
                  />
                )}></Route>
              <Route
                path="/change_password"
                render={(props) => <ChangePasswordForm {...props} />}></Route>
              <Route
                path="/"
                exact
                render={(props) => (
                  <HomeView
                    state={this.state.state}
                    user={this.state.user}
                    {...props}
                  />
                )}></Route>
            </Switch>
          </Container>
          <BottomNav />
        </div>
      );
    }
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default withRouter(App);
