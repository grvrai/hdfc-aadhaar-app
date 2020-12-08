import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import AuthService from './../services/auth-service'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function MenuAppBar(props) {
  const classes = useStyles();
  let auth = AuthService.isLoggedIn();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  let user_state = AuthService.getUserState()

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton> */}
          <img src={process.env.PUBLIC_URL + '/hdfc-logo-256x256.png'} style={{height: '30px', marginRight: '1rem'}}/>
          <Typography variant="h6" className={classes.title}>
            HDFC Aadhaar Employee
          </Typography>
          {auth && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit">
                <AccountCircle />
              </IconButton>
              <Popover
                id="menu-appbar"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                // close={close}
                onClose={() => {
                  setAnchorEl(null)
                }}>
                <MenuItem disabled color="primary">
                  <ListItemIcon style={{minWidth:"30px"}} color="primary">
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText color="primary" primary={user_state.name} />
                </MenuItem>
                <MenuItem onClick={()=> {
                  setAnchorEl(null);
                  props.onLogout();
                }}>
                  <ListItemIcon style={{minWidth:"30px"}}>
                    <ExitToAppIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Popover>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}


{/* <Popover 
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
>
  The content of the Popover.
</Popover> */}