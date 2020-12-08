import React from 'react';
import logo from './../../logo.png';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { Button, Paper } from '@material-ui/core';

import NotificationPermissionWidget from './NotificationPermWidget'
import UserCard from './UserCard'
import HomeActionsList from './HomeActionsList'

import PeakPwa from './../../services/peakpwa'

// function HomeView() {
  
//   let isPermGranted = PeakPwa.getPermissionStatus() == 'granted';

//   return (
//       <Container maxWidth="sm" className="">
        
//         <Paper>
//           <img src={logo} className="App-logo" alt="logo" />
//           <Typography variant="h4" component="h1" gutterBottom>
            
//           </Typography>
//           <Button variant="contained" color="primary">
//             Primary Button
//           </Button>
//         </Paper>

//         {!isPermGranted ? <NotificationPermissionWidget /> : ''}        
//       </Container>
//   );
// }

class HomeView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isPermGranted: PeakPwa.getPermissionStatus() == 'granted',
      isPushRecieved: false
    }

    this.handlePermissionChange = this.handlePermissionChange.bind(this);
    this.handlePushReceived = this.handlePushReceived.bind(this);
  }

  componentDidMount() {
    document.addEventListener('onSubscriptionChange', this.handlePermissionChange);

    navigator.serviceWorker.addEventListener('message', this.handlePushReceived);
  }

  componentWillUnmount() {
    document.removeEventListener('onSubscriptionChange', this.handlePermissionChange);
    navigator.serviceWorker.removeEventListener('message', this.handlePushReceived);
  }

  handlePermissionChange() {
    console.log('handlePermissionChange')
    this.setState({
      isPermGranted: PeakPwa.getPermissionStatus() == 'granted'
    });
  }

  handlePushReceived(e) {
    console.log('handlePushReceived');
    if(e.data.action == 'push_received') {
      this.setState({
        isPushRecieved: true
      });
    }
  }

  render() {
    console.log(this.props)
    return (
      <Container maxWidth="sm" className="" disableGutters>
        <UserCard state={this.props.state} />
        {!this.state.isPermGranted ? <NotificationPermissionWidget /> : ''}   
        <HomeActionsList />     
      </Container>
  );
  }
 }

export default HomeView;