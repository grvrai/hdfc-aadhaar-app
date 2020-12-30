import React from 'react';
import logo from './../../logo.png';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { Button, Paper } from '@material-ui/core';

import NotificationPermissionWidget from './NotificationPermWidget'
import RecentNotification from './RecentNotification'
import UserCard from './UserCard'
import HomeActionsList from './HomeActionsList'
import CustomerDataWidget from './CustomerDataWidget'
import DailyDataWidget from './DailyDataWidget'

import PeakPwa from './../../services/peakpwa'



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
	console.log(e.data);
    if(e.data.action == 'push_received') {
      this.setState({
        isPushRecieved: true
      });
    }
  }

  render() {
    return (
      <Container style={{padding: '1rem'}}>
        <RecentNotification />
        <UserCard state={this.props.state} />
        {!this.state.isPermGranted ? <NotificationPermissionWidget /> : ''}
        <CustomerDataWidget />
        <DailyDataWidget />
        <HomeActionsList />     
      </Container>
  );
  }
 }



export default HomeView;