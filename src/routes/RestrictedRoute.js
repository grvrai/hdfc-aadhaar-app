import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import AuthService from '../services/auth-service';

// const PrivateRoute = ({component: Component, ...rest}) => {
//     console.log('PrivateRoute');
//     console.log(AuthService.isLoggedIn());

//     return (       
//         // Show the component only when the user is logged in
//         // Otherwise, redirect the user to /signin page
//         <Route {...rest} render={props => (
//             AuthService.isLoggedIn() ?
//                 <Component {...props} />
//             : <Redirect to="/login" />
//         )} />
//     );
// };

function RestrictedRoute({ children, ...rest }) {
    let auth = AuthService.isLoggedIn();
    return (
      <Route
        {...rest}
        render={({ location }) =>
          !auth ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/",
                state: { from: location }
              }}
            />
          )
        }
      />
    );
  }

export default RestrictedRoute;