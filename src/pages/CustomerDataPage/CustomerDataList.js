
import React, { useEffect, useState } from 'react'

import { Box, Button, Card, CardActions, CardContent, Grid, Paper, Fab } from '@material-ui/core'
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import CustomerDataService from './../../services/CustomerDataService'

export default function CustomerDataList({ history, match }) {
    const { path } = match;
    const [items, setItems] = useState(null);

    useEffect(() => {
        CustomerDataService.getUnsyncedRecords().then(function(data) {
            setItems(data);
        });
    }, []);

    const editItem = (id) => {
        history.push(path + '/edit/' + id);
    }

    const deleteItem = async (id) => {
        setItems(items.map(x => {
            if (x.id === id) { x.isDeleting = true; }
            return x;
        }));
        // this.props.history.push(path + '/' + id)
        await CustomerDataService.deleteRecordFromCache(id);
        setItems(items => items.filter(x => x.id !== id));
    }

    const uploadRecords = async () => {
        await CustomerDataService.uploadRecords();
        CustomerDataService.getUnsyncedRecords().then(function(data) {
            setItems(data);
        });
    }


    return (
        <div>
            {items && items.length > 0 &&
                <Card style={{margin: '1rem 0'}}>
                    {/* <Box bgcolor="info.main" color="white">                     */}
                        <CardContent>
                            You have not uploaded <b>{items.length} records</b>. Tap the button below to upload the records.
                        </CardContent>
                        <CardActions>
                            <Button size="small" color="secondary" onClick={uploadRecords}>Upload Records</Button>
                        </CardActions>
                    {/* </Box> */}
                </Card>
            }

            {items && items.length > 0 && items.map(customerData => 
                <Card key={customerData.id}>
                    <Grid container style={{padding: '1rem'}} spacing={2}>
                        <Grid item xs={7}>
                            <Typography variant="overline" style={{lineHeight: 1}}>Customer Name</Typography>
                            <Typography variant="body1" color="primary">{customerData.customer_name}</Typography>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant="overline" style={{lineHeight: 1}}>Created At</Typography>
                            <Typography variant="body2" color="primary">{new Date(customerData.createdAt).toLocaleDateString()}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="overline" style={{lineHeight: 1}}>Service Availed</Typography>
                            <Typography variant="body2" color="primary">{customerData.service_type}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button startIcon={<EditIcon/>} color="default" onClick={(e) => {editItem(customerData.id)}}>Edit</Button>
                            <Button startIcon={<DeleteIcon/>} color="default" onClick={(e) => {deleteItem(customerData.id)}}>Delete</Button>
                        </Grid>
                    </Grid>
                    
                </Card>
            )}
            
            {!items && 
                <Grid container alignItems="center" justify="center" style={{padding: '2rem'}}>
                    <CircularProgress color="primary" size={20} />
                </Grid>
            }
            {items && !items.length &&
                <Grid container justify="center" alignItems="center" style={{padding: '2rem'}}>
                    <Typography variant="subtitle1" align="center">
                        You have not added any Customer Data yet.
                    </Typography>
                </Grid>
            }
            <Fab
                variant="extended"
                size="medium"
                color="primary"
                aria-label="upload records"
                onClick={() => {history.push(path + '/add')}}
                style={{position: 'fixed', bottom: '72px', right: '16px' }} >
                <AddIcon />
                Add Record
            </Fab>
            {/* <Button variant="contained" color="primary" onClick={() => {history.push(path + '/add')}}>Add New</Button> */}
        </div>
    )
}