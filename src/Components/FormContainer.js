import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        paddingTop: 12,
        minHeight: 'calc(100vh - 112px)'
    },
}));


export default function FormContainer(props) {
    const classes = useStyles();
    return (
        <Container className={classes.root} {...props}>
           {props.children}
        </Container>
    )
}