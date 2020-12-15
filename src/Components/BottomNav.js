import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import HomeIcon from '@material-ui/icons/Home';
import NotificationsIcon from '@material-ui/icons/Notifications';

import { Redirect, BrowserRouter as Router, } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    // width: 500,
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0
  },
});

export default function BottomNav() {
  const classes = useStyles();
  const [path, setPath] = React.useState('/');

  return (
    <BottomNavigation
      value={path}
      onChange={(event, newValue) => {
        setPath(newValue);
      }}
      showLabels
      className={classes.root}
      position="fixed">
      {path ? <Redirect to={path} /> : ''}
      <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
      <BottomNavigationAction label="Notifications" value="/notifications" icon={<NotificationsIcon />} />
      {/* <BottomNavigationAction label="Nearby" value="/" icon={<LocationOnIcon />} /> */}
    </BottomNavigation>
  );
}