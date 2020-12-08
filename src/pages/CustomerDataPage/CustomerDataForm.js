import React from 'react';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CustomerDataService from '../../services/CustomerDataService';
import { withRouter } from "react-router-dom";

class CustomerDataForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            customer_name: '',
            contact_no: '',
            gender: 'male',
            general_error: '',
            customer_type: '',
            service_type: '',
            cross_sell_lead: '',
            crm_no: '',
            isLoading: false
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({
            general_error: '',
            isLoading: true
        });

        try {
            await CustomerDataService.addRecordToCache(this.state);
            this.props.history.push('/');
            // let {user_data, state_data} = await AuthService.auth(this.state.username, this.state.password)           
            // this.props.onLoginSuccess(user_data, state_data);        
        } catch (err) {
            console.log(err)
            for (const key in err.response) {
				if(key == 'non_field_errors' || key == 'detail') {
                    this.setState({
                        general_error: err.response[key],
                        isLoading: false                        
                    });
				}
			}
        }        
    }

    render() {
        return <Container maxWidth="sm" className="" bgcolor="">
            <div style={{marginTop:'2rem'}}>
                <form className='login-form' autoComplete="off" onSubmit={this.handleSubmit}>                   
                    <Grid container spacing={3}>
                        {this.state.general_error 
                            ? <Grid item xs={12}>
                                <Alert severity="error">{this.state.general_error}</Alert>
                                </Grid>                                   
                            : ''
                        }
                        
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                name="customer_name" 
                                label="Customer Name" 
                                variant="outlined" 
                                value={this.state.customer_name} 
                                onChange={(event) => this.setState({ [event.target.name]: event.target.value })}
                                disabled={this.state.isLoading}
                                required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                name="contact_no" 
                                label="Contact Number" 
                                variant="outlined" 
                                value={this.state.contact_no} 
                                onChange={(event) => this.setState({ [event.target.name]: event.target.value })}
                                disabled={this.state.isLoading}
                                type="number"
                                required />
                        </Grid>
                        <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel id="select-gender">Gender</InputLabel>
                            <Select
                                labelId="select-gender"
                                name="gender" 
                                value={this.state.gender}
                                onChange={(event) => this.setState({ [event.target.name]: event.target.value })}
                                label="Age" >
                                <MenuItem value={'male'}>Male</MenuItem>
                                <MenuItem value={'female'}>Female</MenuItem>
                            </Select>
                        </FormControl>

                        </Grid>
                        <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel id="select-customer_type">Customer Type</InputLabel>
                            <Select
                                labelId="select-customer_type"
                                name="customer_type" 
                                value={this.state.customer_type}
                                onChange={(event) => this.setState({ [event.target.name]: event.target.value })}
                                label="Age" >
                                <MenuItem value={'non_hdfc_customer'}>Non HDFC Bank Customer</MenuItem>
                                <MenuItem value={'hdfc_customer'}>HDFC Bank Customer</MenuItem>
                            </Select>
                        </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel id="select-service_type">Type of Service Availed</InputLabel>
                            <Select
                                labelId="select-service_type"
                                name="service_type" 
                                value={this.state.service_type}
                                onChange={(event) => this.setState({ [event.target.name]: event.target.value })}
                                label="Age" >
                                    {['New Enrolment', 'Mandatory Biometric update',  'Biometric update with or without Demographic update', 'Demographic update'].map((item, i) => 
                                        <MenuItem value={item}>{item}</MenuItem>
                                    )}                         
                                
                            </Select>
                        </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel id="select-cross_sell_lead">Cross Sell Lead</InputLabel>
                            <Select
                                labelId="select-cross_sell_lead"
                                name="cross_sell_lead" 
                                value={this.state.cross_sell_lead}
                                onChange={(event) => this.setState({ [event.target.name]: event.target.value })}
                                label="Age" >
                                    {['SA', 'CA', 'CSA', 'FD','PL', 'GL' , 'BL' ,'HL', 'AL' ,'TW', 'CC','LAP'].map((item, i) => 
                                        <MenuItem value={item}>{item}</MenuItem>
                                    )}                         
                                
                            </Select>
                        </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                name="crm_no" 
                                label="CRM Number" 
                                variant="outlined" 
                                value={this.state.crm_no} 
                                onChange={(event) => this.setState({ [event.target.name]: event.target.value })}
                                disabled={this.state.isLoading}
                                type="number"
                                required />
                        </Grid>
                        <Grid item xs={12}>
                            <Button 
                                color="secondary" 
                                fullWidth 
                                type="submit" 
                                variant="contained" 
                                size="large"
                                disabled={this.state.isLoading}>
                                {this.state.isLoading 
                                    ? <Grid container alignItems="center" justify="center">
                                        <CircularProgress color="secondary" size={16} style={{marginRight: '1rem'}}/> Adding Record
                                        </Grid>
                                    : 'Add Customer Record'
                                }                                
                            </Button> 
                        </Grid>
                    </Grid>                
                </form>               
            </div>
        </Container>
    }
}

// export default CustomerDataForm;
export default withRouter(CustomerDataForm);