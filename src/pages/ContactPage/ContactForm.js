import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import LoadingButton from "./../../Components/LoadingButton";
import Constants from "../../constants";
import {useHistory} from "react-router";
import {api} from "./../../services/customer-data-service";
import FormContainer from "../../Components/FormContainer";
import {useSnackbar} from "notistack";

export default function ContactForm({onLoginSuccess}) {
	const [state, setState] = React.useState({
		general_error: "",
		isLoading: false,
	});

	const [name, setName] = React.useState("");
	const [phone, setPhone] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [formError, setFormError] = React.useState("");

	let history = useHistory();
	const {enqueueSnackbar, closeSnackbar} = useSnackbar();

	// const validate = () => {
	// 	errs = {}
	// 	let array = [name, phone, message];
	// 	for (let index = 0; index < array.length; index++) {
	// 		const element = array[index];
	// 		if(!array[index]) {
	// 			err[array[index]]
	// 		}
	// 	}
	// }

	const handleSubmit = async function (e) {
		e.preventDefault();
		if (!window.navigator.onLine) {
			setState({
				general_error: "You are currently offline. Please connect to the internet to perform this action.",
				isLoading: false,
			});
			return;
		}

		setState({
			general_error: "",
			isLoading: true,
		});

		try {
			api.post(
				"/api/email/",
				{
					tolist: ["grv.rai@live.in"],
					subj: "Aadhaar Seva Kendra App Issue",
					body: "Name:" + name + "\n\nPhone:" + phone + "\n\nComments :" + message + "\n\nVersion: " + process.env.VERSION,
				},
				{
					baseURL: Constants.domain,
				}
			);
			setState({isLoading: false});
			enqueueSnackbar("Your issue has been reported.", {
				variant: "success",
			});
			history.goBack();
		} catch (err) {
			console.log(err);
			setState({isLoading: false});

			for (const key in err.response) {
				if (key == "non_field_errors" || key == "detail") {
					setState({
						general_error: err.response[key],
					});
				}
			}
		}
	};

	return (
		<FormContainer>
			<form className="login-form" autoComplete="off" onSubmit={handleSubmit}>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Typography variant="h5">Report App Issue</Typography>
						<Typography variant="body1" color="textSecondary">
							Use this page if you face any issues with the app functionality. We will get in touch with you as soon as
							possible
						</Typography>
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
							name="name"
							label="Name"
							type="text"
							variant="outlined"
							value={name}
							error={Boolean(formError?.phone)}
							helperText={formError?.phone?.join("\n")}
							onChange={(event) => {
								setName(event.target.value);
							}}
							disabled={state.isLoading}
							required
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							name="phone"
							label="Phone"
							type="number"
							variant="outlined"
							value={phone}
							error={Boolean(formError?.phone)}
							helperText={formError?.phone?.join("\n")}
							onChange={(event) => {
								setPhone(event.target.value);
							}}
							disabled={state.isLoading}
							required
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							multiline
							rows={4}
							name="message"
							label="Issue"
							type="text"
							variant="outlined"
							value={message}
							error={Boolean(formError?.message)}
							helperText={formError?.message?.join("\n")}
							onChange={(event) => {
								setMessage(event.target.value);
							}}
							disabled={state.isLoading}
							required
						/>
					</Grid>
					<Grid item xs={12}>
						<LoadingButton
							btnText="Report App Issue"
							loadingText="Reporting Issue"
							isLoading={state.isLoading}
							color="secondary"
							fullWidth
							type="submit"
							variant="contained"
							size="large"
						/>
					</Grid>

					<Grid item xs={12}>
						<Typography variant="body1" color="textSecondary" style={{textAlign:'center'}}>
							v{process.env.VERSION}
						</Typography>
					</Grid>
					
				</Grid>
			</form>
		</FormContainer>
	);
}
