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

import FormContainer from "./../../Components/FormContainer";

export default function ChangePasswordForm({}) {
  let history = useHistory();
  const [isSuccess, setSuccess] = React.useState(null);
  const [formError, setFormError] = React.useState({});
  const [state, setState] = React.useState({
    general_error: "",
    isLoading: false,
  });

  const [old_password, setOldPassword] = React.useState("");
  const [new_password, setNewPassword] = React.useState("");
  const [new_password2, setNewPassword2] = React.useState("");

  const handleSubmit = async function (e) {
    e.preventDefault();
    if (!window.navigator.onLine) {
      this.setState({
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
        "PUT",
        `${Constants.domain}/api/update_password/?self=true`,
        {
          old_password: old_password,
          new_password: new_password,
          //   send_sms: true,
        }
      );
      setSuccess(true);
      // let {user_data, state_data} = await AuthService.auth(this.state.username, this.state.password)
      // onLoginSuccess(user_data, state_data);
    } catch (err) {
      //   console.log(err);
      setFormError(err.response);
      setState({
        isLoading: false,
      });
      for (const key in err.response.data) {
        // setState({
        // 	general_error: err.response.data[key],
        // 	isLoading: false,
        // });
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
    <FormContainer>
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
            Return to Home
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
                  Enter your old and new password below to update it.
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
                name="old_password"
                label="Password"
                variant="outlined"
                type="password"
                error={Boolean(formError.old_password)}
                helperText={
                  formError.old_password
                    ? formError.old_password.join("\r\n")
                    : ""
                }
                value={old_password}
                onChange={(event) => setOldPassword(event.target.value)}
                disabled={state.isLoading}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="new_password"
                type="password"
                label="New Password"
                variant="outlined"
                value={new_password}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={state.isLoading}
                error={Boolean(formError.new_password)}
                helperText={
                  formError.new_password
                    ? formError.new_password.join("\n")
                    : ""
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="new_password"
                type="password"
                label="Repeat New Password"
                variant="outlined"
                value={new_password2}
                onChange={(event) => setNewPassword2(event.target.value)}
                disabled={state.isLoading}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <LoadingButton
                btnText="Update Password"
                loadingText="Updating Password"
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
                Return to Home
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </FormContainer>
  );
}
