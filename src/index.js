// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();



import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import App from './App';
import theme from './theme';
// import {BrowserRouter} from 'react-router-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { SnackbarProvider } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { ConfirmationDialogProvider } from "./Components/ConfirmationDialogProvider";
 
const useStyles = makeStyles({
  sBcontainerRoot: {
    bottom: 64,
  },
});

// import * as serviceWorker from './service-worker';

ReactDOM.render(
  <Index />,
  document.getElementById('root'),
);

function Index() {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/s/d/aadhaar/"> 
        <SnackbarProvider maxSnack={3} classes={{containerRoot: classes.sBcontainerRoot}} autoHideDuration={3000}>
          <ConfirmationDialogProvider>
            <App />
          </ConfirmationDialogProvider>
        </SnackbarProvider>
      </Router>    
    </ThemeProvider>
  )
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();