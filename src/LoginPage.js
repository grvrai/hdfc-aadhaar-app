import React from 'react';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { Button, Paper } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
import logo from './logo.png'

import Constants from './constants'
// const useStyles = makeStyles((theme) => ({
//     container: {
//       padding: theme.spacing(3),
//     },
//   }));

class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            username: '',
            passowrd: ''
        }
    }

    async handleSubmit(e) {
        console.log('handleSubmit');
        e.preventDefault();

        try {
            let url = `${Constants.domain}/api/login/`
            let headers = new Headers();
            headers.set('Authorization', 'Basic ' + btoa(this.state.username + ":" + this.state.password));
            // let response = await fetchData('POST', url, {}, headers);
            let res = await fetch(url, {
                headers: headers,
                method: 'POST',
            })

            res = await res.json();


        } catch (err) {
            console.log(err.status);
            // self.showFormErrors(err);
        }
        
        
    }

    render() {
        // let classes = useStyles();
        return <Container maxWidth="sm" className="">
            <div style={{padding: '2rem'}}>
                
                <form className='login-form' noValidate autoComplete="off" onSubmit={this.handleSubmit}>
                    <img src={logo} className="App-logo" alt="logo" />
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome to HDFC Adhaar Employee
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField fullWidth name="username" label="Username/Email" variant="outlined" value={this.state.username} onChange={(event) => this.setState({ [event.target.name]: event.target.value })} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth name="password" label="Password" type="Password" variant="outlined" value={this.state.password} onChange={(event) => this.setState({ [event.target.password]: event.target.value })} required />
                        </Grid>
                        <Grid item xs={12}>
                            <Button color="secondary" fullWidth type="submit" variant="contained">
                                Login
                            </Button> 
                        </Grid>
                    </Grid>                
                </form>               
            </div>
        </Container>
    }
}



export default LoginPage;