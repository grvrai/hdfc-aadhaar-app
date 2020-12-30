import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import HomeIcon from '@material-ui/icons/Home';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ErrorIcon from '@material-ui/icons/Error';

import { useHistory } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    // width: 500,
    zIndex: 1,
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0
  },
});

export default function BottomNav() {
  const classes = useStyles();
  const [path, setPath] = React.useState('/');

  let history = useHistory();
//   const { pathname } = useLocation();

  React.useEffect(() => {
    history.listen((location)=> {
      setPath(location.pathname);
    });  
  }, []);

  return (
    <BottomNavigation
      value={path}
      onChange={(event, newValue) => {
		setPath(newValue);
		history.push(newValue)
      }}
      showLabels
      className={classes.root}
      position="fixed">
      <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />}/>
      <BottomNavigationAction label="Notifications" value="/notifications" icon={<NotificationsIcon />} />
      <BottomNavigationAction label="Issues" value="/issues" icon={<ErrorIcon />} />
    </BottomNavigation>
  );
}