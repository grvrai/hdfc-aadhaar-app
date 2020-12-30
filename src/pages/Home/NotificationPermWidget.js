import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';

import PeakPwa from './../../services/peakpwa'

const useStyles = makeStyles((theme) =>({
  root: {
    // maxWidth: 345,
    // backgroundColor: '#',
    marginTop: '1rem'
  },
  media: {
    // height: 140,
  },
}));

export default function NotificationPermissionWidget() {
  const classes = useStyles();
  const [isLoading, setLoading] = useState(false);

  const handleClick = (e) => {
    setLoading(true);
    PeakPwa.requestNotificationPermissionAndSubscribe();
  }

  return (
      <Card className={classes.root}>
        <CardContent>
          <Typography gutterBottom variant="h6">
              Enable Push
          </Typography>
          <Typography variant="body2" component="p">
              Enable push notification to get updates and reminders about uploads.
          </Typography>
        </CardContent>
        <CardActions>
            <Button 
              // variant="outlined" 
              // fullWidth 
              color="primary" 
              onClick={handleClick}
              startIcon={!isLoading ? <NotificationsActiveIcon /> : ''}>
              {isLoading 
                  ? <Grid container alignItems="center" justify="center">
                      <CircularProgress color="primary" size={16} style={{marginRight: '14px'}}/> Enabling Notifications
                    </Grid>
                  : 'Enable Notifications'
              }              
            </Button>
        </CardActions>          
      </Card>
  );
}

