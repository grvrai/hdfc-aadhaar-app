import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import PeakPwa from './../../services/peakpwa'

const useStyles = makeStyles({
  root: {
    // maxWidth: 345,
    // marginTop: '1rem',
    padding: '1rem'
  },
  media: {
    // height: 140,
  },
});

export default function UserCard(props) {
  const classes = useStyles();
  const [isLoading, setLoading] = useState(false);

  const handleClick = (e) => {
    setLoading(true);
    // PeakPwa.requestNotificationPermissionAndSubscribe();
  }

  return (
     <Paper className={classes.root}>
        <Grid container spacing={1}>
            <Grid item xs={12} container spacing={2} alignItems="center">
                <Grid item xs={2} >
                    <Avatar color="primary">
                        <AccountCircleIcon />
                    </Avatar>
                </Grid>
                <Grid item xs={10}>
                    {/* <Typography variant="caption" style={{lineHeight: 1}}>Employee Name</Typography> */}
                    <Typography variant="h6" color="primary">{props.state.name}</Typography>
                </Grid>
            </Grid>
            <Grid item xs={12} container spacing={1}>
                <Grid item xs={2}></Grid>
                <Grid item xs={5}>
                    <Typography variant="caption" component="div" style={{lineHeight: 1.5}}>Staff Code</Typography>
                    <Typography variant="body1" component="div" color="primary">{props.state.xid}</Typography>
                </Grid>
                <Grid item xs={5}>
                    <Typography variant="caption" component="div"  style={{lineHeight: 1.5}}>Branch Name</Typography>
                    <Typography variant="body1" component="div" color="primary">{props.state.filter3}</Typography>
                </Grid>
            </Grid>
        </Grid>
     </Paper>
  );
}

