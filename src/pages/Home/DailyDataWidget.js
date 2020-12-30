import React, { useEffect, useState } from 'react'

import AadharDataService from './../../services/customer-data-service'
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import Divider from '@material-ui/core/Divider';
import ErrorIcon from '@material-ui/icons/Error';
import DoneIcon from '@material-ui/icons/Done';
import EditIcon from '@material-ui/icons/Edit';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import CircularProgress from '@material-ui/core/CircularProgress';

import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: '1rem'
    },
    highlightButton: {
        // backgroundColor: theme.palette.background.paper,
        color: theme.palette.info.dark
    },
}));


export default function DailyActivityWidget() {
  
    const [path, setPath] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [record, setRecord] = useState(null)

    let history = useHistory();

    const classes = useStyles();
    //   let records = await AadharDataService.getUnsyncedRecord();
    
    useEffect(async () => {
        let record = await AadharDataService.getCurrentDailyRecord();
        setRecord(record);
    }, [])


    // const uploadRecords =  async function() {
    //     setIsUploading(true);
    //     await AadharDataService.uploadRecords();
    //     let records = await AadharDataService.getUnsyncedRecords();
    //     setRecords(records);
    //     setIsUploading(false);
    // }

    return (
        <Card className={classes.root}>
            <CardContent>
                <Box display="flex" alignItems="center" color="primary.main">
                    <EventAvailableIcon style={{marginRight: '1rem'}}/>
                    <Typography variant="h6">
                        Daily Enrollments
                    </Typography>
                </Box>
                {!record 
                    ?   <Box display="flex" alignItems="center" color="warning.main" marginTop="1rem"> 
                            <ErrorIcon style={{marginRight: '1rem'}}/>
                            <Typography variant="body2">You have not submitted a daily enrollment data for <b>{new Date().toLocaleDateString()}</b></Typography>
                        </Box>
                    :   <Box display="flex" alignItems="center" color="success.main" marginTop="1rem"> 
                            <DoneIcon style={{marginRight: '1rem'}}/>
                            <Typography variant="body2">You have already submitted a daily enrollment update for <b>{new Date().toLocaleDateString()}</b>. You can update it by tapping update below.</Typography>
                        </Box>
                }
            </CardContent>
            <Divider/>
            <List component="nav" aria-label="main mailbox folders">
                { record
                    ?   <ListItem button onClick={(e) => {history.push(`/dailyactivity/edit/${record.id}/`)}} >
                            <ListItemIcon>
                                <EditIcon />
                            </ListItemIcon>
                            <ListItemText primary="Update Daily Report" />
                        </ListItem>
                    :   <ListItem button onClick={(e) => {history.push('/dailyactivity/add/')}} >
                            <ListItemIcon>
                                <AddCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary='Submit Daily Report' />
                        </ListItem>
                }
            </List>
        </Card>
    )
}
