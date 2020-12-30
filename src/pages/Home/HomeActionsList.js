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
import { useHistory } from 'react-router';

import GroupAddIcon from '@material-ui/icons/GroupAdd';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ErrorIcon from '@material-ui/icons/Error';


const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      marginTop: '1rem',
      backgroundColor: theme.palette.background.paper,
    },
  }));

export default function HomeActionsList() {
    const classes = useStyles();
    // const [path, setPath] = useState(0);
    const history = useHistory();

    return (
      <Paper className={classes.root}>

        <List component="nav" aria-label="secondary mailbox folders">
        {/* <ListSubheader>Other Actions</ListSubheader> */}
          <ListItem button onClick={(e) => {history.push('/marketingactivity')}} >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Report Marketing Activity" />
          </ListItem>
          <ListItem button onClick={(e) => {history.push('/issues')}} >
            <ListItemIcon>
              <ErrorIcon />
            </ListItemIcon>
            <ListItemText primary="Create New Issue" />
          </ListItem>
        </List>
      </Paper>
    );
  }