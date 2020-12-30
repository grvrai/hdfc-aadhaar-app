import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.primary.main,
        top: 56
    },
}));


export default function PageHeader(props) {
    const classes = useStyles();
    return (
        <AppBar position="sticky" className={classes.root}>
            <Toolbar>
            <IconButton edge="start"  color="inherit" aria-label="menu">
                {props.icon}
            </IconButton>
            {/* <img src={process.env.PUBLIC_URL + '/hdfc-logo-256x256.png'} style={{height: '30px', marginRight: '1rem'}}/> */}
            <Typography variant="h6" >
                {props.title}
            </Typography>
            </Toolbar>
        </AppBar>
    )
}