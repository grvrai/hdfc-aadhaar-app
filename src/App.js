import React from 'react';

import Container from '@material-ui/core/Container';

import LoginPage from './pages/Login/LoginPage'
import HomeView from './pages/Home/HomeView'
import NotificationPage from './pages/NotificationPage/NotificationPage'
import CustomerDataPage from './pages/CustomerDataPage/CustomerDataPage'

import MenuAppBar from './Components/MenuAppBar'
import BottomNav from './Components/BottomNav'

import PeakPwa from './services/peakpwa'

import Constants from './constants'

import AuthService from './services/auth-service'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation
} from "react-router-dom";

import PrivateRoute from './routes/PrivateRoute'
import RestrictedRoute from './routes/RestrictedRoute'

import './App.css';
// function App() {
//   return (
//     <Container maxWidth="sm" className="App">
//       <Paper>
//         <img src={logo} className="App-logo" alt="logo" />
//         <Typography variant="h4" component="h1" gutterBottom>
//           Create React App + Material-UI
//         </Typography>
//         <Button variant="contained" color="primary">
//           Primary Button
//         </Button>
//       </Paper>
//     </Container>
//   );
// }

class App extends React.Component {

  constructor(props) {
    super(props)
    console.log(AuthService)
    this.state = {
      user: AuthService.getUserData(),
      state: AuthService.getUserState(),
      isLoggedIn: AuthService.isLoggedIn()
    }

    console.log(this.state)

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);

    PeakPwa.webapp.registerServiceWorker();
  }

  componentDidMount() {
    document.addEventListener('PeakPwaInit', function () {
      console.log('PeakPwaInit');
      if(!PeakPwa.webapp.installed) PeakPwa.subscribe();
    });

    if(this.state.isLoggedIn && this.state.state) {
      PeakPwa.init(Constants, this.state.state)
    }
  }

  login(user_data, state_data) {
    AuthService.login(user_data, state_data);
    
    this.setState({
      isLoggedIn: true,
      user: user_data,
      state: state_data
    });

    if(PeakPwa.webapp.isInit) {
      PeakPwa.subscribe();
    } else {
      PeakPwa.init(Constants, state_data);
    }
  }

  logout() {
    // localStorage.clear();
    AuthService.logout();

    this.setState({
      isLoggedIn: false,
      user: null,
      state: null
    });
  }

  render() {
    console.log(this.state);
    if (!this.state.isLoggedIn) {
      return <LoginPage onLoginSuccess={this.login}/>
    
    } else {
      return <div>
        <MenuAppBar onLogout={this.logout} />
        <Switch>
          <Route path="/notifications">
            <NotificationPage state={this.state.state} user={this.state.user} />
          </Route>
          <Route path="/customerdata">
            <CustomerDataPage state={this.state.state} user={this.state.user} />
          </Route>
          <Route path="/">
            <HomeView state={this.state.state} user={this.state.user} />
          </Route>
          
        </Switch>
        <BottomNav />
      </div>
      
    }
  }

  //   return (
  //     <Router>
  //       <Switch>
  //         {/* <PrivateRoute path="/">
  //           <LoginPage onLoginSuccess={this.login} />
  //         </PrivateRoute> */}
  //         <RestrictedRoute path="/login">
  //           <LoginPage onLoginSuccess={this.login}  />
  //         </RestrictedRoute>

  //         <PrivateRoute path="/">
  //           <MenuAppBar onLogout={this.logout} />
  //           <Switch>
  //             <Route path="/">
  //               <HomeView state={this.state.state_data} user={this.state.user} />
  //             </Route>
  //             <Route path="/notifications">
  //               <NotificationPage state={this.state.state_data} user={this.state.user} />
  //             </Route>
  //           </Switch>

  //           <BottomNav />
  //         </PrivateRoute>

  //       </Switch>
  //     </Router>
  //   )
  // }
}

export default App