import React from 'react';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import logo from './../../logo.png'

import AuthService from './../../services/auth-service'


class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            username: '',
            password: '',
            general_error: '',
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
            let {user_data, state_data} = await AuthService.auth(this.state.username, this.state.password)           
            this.props.onLoginSuccess(user_data, state_data);        
        } catch (err) {
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
            <div style={{padding: '2rem', textAlign: 'center'}}>
                <form className='login-form' autoComplete="off" onSubmit={this.handleSubmit}>
                    <img src={logo} className="App-logo" alt="logo" />
                   
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h5" component="h1">
                                Welcome to HDFC Adhaar Employee
                            </Typography>   
                        </Grid>
                        
                        {this.state.general_error 
                            ? <Grid item xs={12}>
                                <Alert severity="error">{this.state.general_error}</Alert>
                                </Grid>                                   
                            : ''
                        }
                        
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                name="username" 
                                label="Username/Email" 
                                variant="outlined" 
                                value={this.state.username} 
                                onChange={(event) => this.setState({ [event.target.name]: event.target.value })}
                                disabled={this.state.isLoading}
                                required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                name="password" 
                                label="Password" 
                                type="Password" 
                                variant="outlined" 
                                value={this.state.password} 
                                onChange={(event) => this.setState({ [event.target.name]: event.target.value })}
                                disabled={this.state.isLoading}
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
                                        <CircularProgress color="secondary" size={16} style={{marginRight: '1rem'}}/> Logging In
                                        </Grid>
                                    : 'Login'
                                }                                
                            </Button> 
                        </Grid>
                    </Grid>                
                </form>               
            </div>
        </Container>
    }
}

export default LoginPage;