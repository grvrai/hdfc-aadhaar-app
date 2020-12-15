import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
// import ListItemLink from '@material-ui/core/ListItemLink';
import Divider from '@material-ui/core/Divider';
import { Redirect } from 'react-router';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import GroupAddIcon from '@material-ui/icons/GroupAdd';


const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      marginTop: '1rem',
      backgroundColor: theme.palette.background.paper,
    },
  }));

export default function HomeActionsList() {
    const classes = useStyles();
    const [path, setPath] = useState(0);
    console.log(path);
    return (
      <Paper className={classes.root}>
        {path ? <Redirect to={path} /> : ''}
        <List component="nav" aria-label="main mailbox folders">
        <ListSubheader>Reporting Actions</ListSubheader>
          <ListItem button onClick={(e) => {setPath('/customerdata')}}>
            <ListItemIcon>
              <GroupAddIcon />
            </ListItemIcon>
            <ListItemText primary="Report Customer Data" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <EventAvailableIcon />
            </ListItemIcon>
            <ListItemText primary="Report Daily Data" />
          </ListItem>
        </List>
        <Divider />
        <List component="nav" aria-label="secondary mailbox folders">
        <ListSubheader>Other Actions</ListSubheader>
          <ListItem button>
            <ListItemText primary="Raise Issue" />
          </ListItem>
        </List>
      </Paper>
    );
  }