import React from 'react';
import logo from './logo.png';
import './App.css';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Button, Paper } from '@material-ui/core';


import LoginPage from './LoginPage'
import MainView from './MainView'

// function App() {
//   return (
//     <Container maxWidth="sm" className="App">
//       <Paper>
//         <img src={logo} className="App-logo" alt="logo" />
//         <Typography variant="h4" component="h1" gutterBottom>
//           Create React App + Material-UI
//         </Typography>
//         <Button variant="contained" color="primary">
//           Primary Button
//         </Button>
//       </Paper>
//     </Container>
//   );
// }

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: localStorage.getItem('token')
    }
  }

  render() {
    if (!this.state.isLoggedIn) {
      return <LoginPage />
    } else {
      return <MainView />
    }
  }
}

export default App;