import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
// import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LockIcon from '@material-ui/icons/Lock';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import AuthService from './../services/auth-service'
import { useHistory } from 'react-router';

import {useConfirmationDialog } from './ConfirmationDialogProvider'

import Constants from './../constants'

const useStyles = makeStyles((theme) => ({

  root: {
    flexGrow: 1,
  },
  backButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function MenuAppBar(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [backBtn, showBackBtn] = React.useState(null);

  let history = useHistory();

  let auth = AuthService.isLoggedIn();
  let user_state = AuthService.getUserState();

  let { getConfirmation } = useConfirmationDialog()

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  React.useEffect(() => {
    history.listen((location) => {
      showBackBtn(!(location.pathname == '/'));
    });
  }, [])

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          {backBtn
            ? <IconButton edge="start" className={classes.backButton} color="inherit" aria-label="back" onClick={() => {history.goBack()}}>
                <ArrowBackIcon />
              </IconButton>
            : <img src={process.env.PUBLIC_URL + '/Aadhar-White.svg'} className={classes.backButton} style={{height: '30px'}}/>
          }
          
          <Typography variant="h6" className={classes.title}>
            Aadhaar Reporting App
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
                open={Boolean(anchorEl)}
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
                <MenuItem button onClick={()=> {history.push('/change_password/')}}>
                  <ListItemIcon style={{minWidth:"30px"}}>
                    <LockIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText color="primary" primary="Change Password" />
                </MenuItem>
                <MenuItem onClick={async ()=> {
                  setAnchorEl(null);
                  const confirmed = await getConfirmation({
                    title: 'Logout', 
                    message: 'Are you sure you want to logout? Any pending upload data will be lost.',
                    btnConfirmText: 'Logout'
                  });
                
                  if(!confirmed) return;
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
