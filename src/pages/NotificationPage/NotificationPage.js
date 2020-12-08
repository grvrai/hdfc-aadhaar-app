import React from 'react';
import logo from './../../logo.png';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { Paper, Grid, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

import CircularProgress from '@material-ui/core/CircularProgress';

import PeakPwa from './../../services/peakpwa'

class NotificationPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isPermGranted: PeakPwa.getPermissionStatus() == 'granted',
      isPushRecieved: false,
      data: null
    }

    // this.handlePermissionChange = this.handlePermissionChange.bind(this);
    this.handlePushReceived = this.handlePushReceived.bind(this);
    this.deleteNotification = this.deleteNotification.bind(this);
  }

  async componentDidMount() {
    navigator.serviceWorker.addEventListener('message', this.handlePushReceived);

    this.setState({
      data: await PeakPwa.webapp.getNotifications(true)
    })
  }

  componentWillUnmount() {
    // document.removeEventListener('onSubscriptionChange', this.handlePermissionChange);
    navigator.serviceWorker.removeEventListener('message', this.handlePushReceived);
  }

  handlePermissionChange() {
    console.log('handlePermissionChange')
    this.setState({
      isPermGranted: PeakPwa.getPermissionStatus() == 'granted'
    });
  }

  async handlePushReceived(e) {
    console.log('handlePushReceived');
    if(e.data.action == 'push_received') {
      this.setState({
        data: await PeakPwa.webapp.getNotifications()
      })
    }
  }

  async deleteNotification(id) {
    console.log(id);
    let res = await PeakPwa.deleteNotification(id);
    this.setState({
      data: await PeakPwa.webapp.getNotifications(true)
    })
  }

  render() {
    return  <Container maxWidth="sm" className="" disableGutters>
        {/* <Paper>
          <p>Test</p>
          <Button variant="contained" color="primary">
            Primary Button
          </Button>
        </Paper> */}

        {this.state.data 
          ? < NotificationList data={this.state.data} deleteNotification={this.deleteNotification} />  
          : <Grid container alignItems="center" justify="center" style={{padding: '2rem'}}>
              <CircularProgress color="primary" size={20} />
            </Grid>}
      </Container>
  }
 }

class NotificationList extends React.Component {
  render() {
    return (
      <div >
        {this.props.data && this.props.data.length 
          ? this.props.data.map((notif, index) =>
              <NotificationListItem notif={notif} key={notif.id} deleteNotification={this.props.deleteNotification} />
            ) 
          : <Grid container justify="center" alignItems="center" style={{padding: '2rem'}}>
              <Typography variant="subtitle1" align="center">
                You have no notifications. When you receive notifications, they will show up in this list.
              </Typography>
            </Grid>
        }
      </div>
    )
  }
}

class NotificationListItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isDeleting: false
    }
    // this.deleteItem = this.deleteItem.bind(this);
  }

  render() {
    console.log(this.props)
    return (
      <Paper>
        <div style={{padding: '1rem'}}>
          <Grid container>
            <Grid container xs={12} style={{ flexWrap:'nowrap'}}>
              <Grid item style={{flex: '1 1 100%'}}>
                <Typography variant="body1" style={{fontWeight: "bold"}}>{this.props.notif.changeMessage}</Typography>
                <Typography variant="body2">{this.props.notif.changeTitle}</Typography>
              </Grid>
              <Grid item>
                {this.state.isDeleting 
                  ? <CircularProgress color="secondary" size={20} /> 
                  : <IconButton 
                      size="small"
                      aria-label="delete" 
                      onClick={(e) => { 
                        this.props.deleteNotification(this.props.notif.id);
                        this.setState({
                          isDeleting: true
                        })
                      }}>
                      <DeleteIcon/>
                    </IconButton>
                }
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {this.props.notif.image 
                ? <img src={this.props.notif.image} style={{borderRadius: '4px', width: '100%', margin: '1rem 0'}} />
                : ''
              }
            </Grid>  
            <Grid container alignItems="center" xs={12} >
              <Typography style={{display:'flex'}} variant="subtitle2" fontSize="">
                <AccessTimeIcon fontSize="small" style={{marginRight: '5px'}} color="action"  />
                {this.props.notif.createdAt}
              </Typography>
            </Grid>
          </Grid>
        </div>  
      </Paper> 
    )
  }
}

export default NotificationPage;