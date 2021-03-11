import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
import logo from "./../../logo.png";

import AuthService from "./../../services/auth-service";

import LoadingButton from "./../../Components/LoadingButton";
import Constants from "../../constants";
import { fetchData, getQueryParam } from "./../../helpers/helpers";
import { Box } from "@material-ui/core";
import { useHistory } from "react-router";
import { Switch, Route } from "react-router-dom";

class LoginPage extends React.Component {
  render() {
    let path = this.props.match.path;
    console.log("LoginPage");
    console.log(path);
    return (
      <Container maxWidth="sm" className="">
        <Paper
          style={{ padding: "2rem", textAlign: "center", marginTop: "1rem" }}>
          <img
            src={process.env.PUBLIC_URL + "/ASK-Color-512.png"}
            className="App-logo"
            alt="logo"
            style={{ padding: "1rem" }}
          />
          <Grid container style={{ marginBottom: "1rem" }}>
            <Grid item xs={12}>
              <Typography variant="h5" component="h1">
                Welcome to Adhaar Reporting App
              </Typography>
            </Grid>
          </Grid>
          <Switch>
            <Route path={path} exact>
              <LoginForm onLoginSuccess={this.props.onLoginSuccess} />
            </Route>
            <Route path={"/passwordreset/"} exact>
              <PasswordResetRequestForm />
            </Route>
            <Route path={"/passwordreset/validate"} exact>
              <PasswordResetConfirmForm />
            </Route>
          </Switch>
        </Paper>
      </Container>
    );
  }
}

function LoginForm({ onLoginSuccess }) {
  const [state, setState] = React.useState({
    general_error: "",
    isLoading: false,
  });
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  //   const [username, setUsername] = React.useState('');
  //   const [username, setUsername] = React.useState('');
  let history = useHistory();
	
	const handleSubmit = async function (e) {
    e.preventDefault();
    if (!window.navigator.onLine) {
      setState({
        general_error:
          "You are currently offline. Please connect to the internet to perform this action.",
        isLoading: false,
      });
      return;
    }

    setState({
      general_error: "",
      isLoading: true,
    });

    try {
      let { user_data, state_data } = await AuthService.auth(
        username,
        password
      );
      onLoginSuccess(user_data, state_data);
    } catch (err) {
      console.log(err);
      setState({ isLoading: false });

      for (const key in err.response) {
        if (key == "non_field_errors" || key == "detail") {
          setState({
            general_error: err.response.data[key],
          });
        }
      }
    }
  };

  return (
    <form className="login-form" autoComplete="off" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {state.general_error ? (
          <Grid item xs={12}>
            <Alert severity="error">{state.general_error}</Alert>
          </Grid>
        ) : (
          ""
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="username"
            label="Phone No (10-digit)"
            variant="outlined"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            disabled={state.isLoading}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="password"
            label="Password"
            type="Password"
            variant="outlined"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            disabled={state.isLoading}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <LoadingButton
            btnText="Login"
            loadingText="Logging In"
            isLoading={state.isLoading}
            color="secondary"
            fullWidth
            type="submit"
            variant="contained"
            size="large"
          />
          <Button
            style={{ marginTop: "1rem" }}
            onClick={() => {
              history.push("/passwordreset/");
            }}
            color="secondary"
            variant="text">
            Set/Reset Password
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

function PasswordResetRequestForm({}) {
  let history = useHistory();
  const [isSuccess, setSuccess] = React.useState(null);
  const [state, setState] = React.useState({
    general_error: "",
    isLoading: false,
  });

  const [username, setUsername] = React.useState("");

  const handleSubmit = async function (e) {
    if (!window.navigator.onLine) {
      setState({
        general_error:
          "You are currently offline. Please connect to the internet to perform this action.",
        isLoading: false,
      });
      return;
    }
    e.preventDefault();
    setState({
      general_error: "",
      isLoading: true,
    });

    try {
      let resp = await fetchData(
        "POST",
        `${Constants.domain}/api/reset_password/request/`,
        {
          username: username,
          redirect_url: `${Constants.domain}/s/d/aadhaar/passwordreset/validate/`,
          send_sms: true,
        }
	  );
      setSuccess(true);
      // let {user_data, state_data} = await AuthService.auth(this.state.username, this.state.password)
      //   onLoginSuccess(user_data, state_data);
    } catch (err) {
      setState({
        isLoading: false,
      });
      for (const key in err.response) {
        if (key == "non_field_errors" || key == "detail") {
          setState({
            general_error: err.response.data[key],
          });
        }
      }
    }
  };

  return (
    <div>
      {isSuccess ? (
        <Box>
          <Typography>
            Password reset link has been sent to your email and phone.
          </Typography>
          <Button
            style={{ marginTop: "1rem" }}
            onClick={() => {
              history.push("/");
            }}
            color="secondary"
            variant="text">
            Return to Login
          </Button>
        </Box>
      ) : (
        <form
          className="password-reset-req-form"
          autoComplete="off"
          onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box textAlign="left">
                <Typography variant="body1" color="textSecondary">
                  Enter your phone number (10-digit) below to receive a password reset link.
                </Typography>
              </Box>
            </Grid>
            {state.general_error ? (
              <Grid item xs={12}>
                <Alert severity="error">{state.general_error}</Alert>
              </Grid>
            ) : (
              ""
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="username"
                label="Phone No (10-digit)"
                variant="outlined"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={state.isLoading}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <LoadingButton
                btnText="Send Password Link"
                loadingText="Sending Password Link"
                isLoading={state.isLoading}
                color="secondary"
                fullWidth
                type="submit"
                variant="contained"
                size="large"
              />
              <Button
                style={{ marginTop: "1rem" }}
                onClick={() => {
                  history.push("/");
                }}
                color="secondary"
                variant="text">
                Return to Login
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </div>
  );
}

function PasswordResetConfirmForm({}) {
  let history = useHistory();
  const [isSuccess, setSuccess] = React.useState(null);
	const [formError, setFormError] = React.useState({});
  const [state, setState] = React.useState({
    general_error: "",
    isLoading: false,
  });

  const [new_password, setPassword] = React.useState("");
  const [new_password2, setPassword2] = React.useState("");

  const handleSubmit = async function (e) {
    e.preventDefault();
    if (!window.navigator.onLine) {
      setState({
        general_error:
          "You are currently offline. Please connect to the internet to perform this action.",
        isLoading: false,
      });
      return;
    }
    if (new_password !== new_password2) {
      setState({
        general_error: "The 2 enetered passwords do not match.",
        isLoading: false,
      });
      return;
    }
    setState({
      general_error: "",
      isLoading: true,
    });

    try {
      await fetchData(
        "POST",
        `${Constants.domain}/api/reset_password/confirm/`,
        {
          new_password: new_password,
          token: getQueryParam("passwordtoken"),
          //   send_sms: true,
        }
      );
      setSuccess(true);
      // let {user_data, state_data} = await AuthService.auth(this.state.username, this.state.password)
      // onLoginSuccess(user_data, state_data);
    } catch (err) {
      console.log(err);
			setFormError(err.response);
      setState({
        isLoading: false,
      });
      for (const key in err.response) {
        if (key == "non_field_errors" || key == "detail") {
          setState({
            general_error: err.response.data[key],
            isLoading: false,
          });
        }
      }
    }
  };

  return (
    <div>
      {isSuccess ? (
        <Box>
          <Typography>Your password has been updated successfully</Typography>

          <Button
            style={{ marginTop: "1rem" }}
            onClick={() => {
              history.push("/");
            }}
            color="secondary"
            variant="text">
            Return to Login
          </Button>
        </Box>
      ) : (
        <form
          className="password-reset-req-form"
          autoComplete="off"
          onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box textAlign="left">
                <Typography variant="body1" color="textSecondary">
                  Enter your new password below to set it.
                </Typography>
              </Box>
            </Grid>

            {state.general_error ? (
              <Grid item xs={12}>
                <Alert severity="error">{state.general_error}</Alert>
              </Grid>
            ) : (
              ""
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="new_password"
                label="Password"
                variant="outlined"
                type="password"
                value={new_password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={state.isLoading}
								error={Boolean(formError.new_password)}
                helperText={
                  formError.new_password
                    ? formError.new_password.join("\r\n")
                    : ""
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="new_password2"
                type="password"
                label="Repeat Password"
                variant="outlined"
                value={new_password2}
                onChange={(event) => setPassword2(event.target.value)}
                disabled={state.isLoading}
								error={Boolean(formError.new_password2)}
                helperText={
                  formError.new_password2
                    ? formError.new_password2.join("\r\n")
                    : ""
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <LoadingButton
                btnText="Reset Password"
                loadingText="Resetting Password"
                isLoading={state.isLoading}
                color="secondary"
                fullWidth
                type="submit"
                variant="contained"
                size="large"
              />
              <Button
                style={{ marginTop: "1rem" }}
                onClick={() => {
                  history.push("/");
                }}
                color="secondary"
                variant="text">
                Return to Login
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </div>
  );
}

export default LoginPage;
