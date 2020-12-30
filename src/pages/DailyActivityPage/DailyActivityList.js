import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import Fab from '@material-ui/core/Fab'
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import { fetchData } from '../../helpers/helpers';
import Constants from './../../constants'
import PageHeader from './../../Components/PageHeader'


export default function MarketingActivityList({ history, match }) {
    const { path } = match;
    const [items, setItems] = useState(null);
	// let path = match.path;
    useEffect(() => {
        fetchData('GET', `${Constants.aadhaar_domain}/aadhaar/dailyactivity/`)
            .then(function(data) {
                setItems(data.results);
            })
            .catch(function(err) {
                
            })
    }, []);

    const editItem = (id) => {
        history.push(path + '/edit/' + id);
    }

    const deleteItem = async (id) => {
        setItems(items.map(x => {
            if (x.id === id) { x.isDeleting = true; }
            return x;
        }));
        await fetchData('DELETE', `${Constants.aadhaar_domain}/aadhaar/dailyactivity/${id}/`)
        setItems(items => items.filter(x => x.id !== id));
    }

    return (
        <div>
            <PageHeader icon={<EventAvailableIcon/>} title={'Daily Activity'}/>
            
            {items && items.length > 0 && items.map(item => 
                <Card key={item.id}>
                    <Grid container style={{padding: '1rem'}} spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="overline" style={{lineHeight: 1}}>Date</Typography>
                            <Typography variant="body1" color="primary">{new Date(item.date).toLocaleDateString()}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="overline" style={{lineHeight: 1}}>Total Enrollments</Typography>
                            <Typography variant="body2" color="primary">{item.total_enrolments}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="overline" style={{lineHeight: 1}}>Cross Sell Leads</Typography>
                            <Typography variant="body2" color="primary">{item.total_cross_sell_leads}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button startIcon={<EditIcon/>} color="default" onClick={(e) => {editItem(item.id)}}>Edit</Button>
                            <Button startIcon={<DeleteIcon/>} color="default" onClick={(e) => {deleteItem(item.id)}}>Delete</Button>
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
                        You have not added any Daily Activity yet.
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
                Add Daily Activity
            </Fab>
            {/* <Button variant="contained" color="primary" onClick={() => {history.push(path + '/add')}}>Add New</Button> */}
        </div>
    )
}