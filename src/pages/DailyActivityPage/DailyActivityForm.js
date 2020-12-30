import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import {withRouter} from "react-router-dom";
import {withSnackbar} from "notistack";

import FromContainer from "./../../Components/FormContainer";
import LoadingButton from "./../../Components/LoadingButton";

import {api} from "./../../services/customer-data-service";

class DailyActivityForm extends React.Component {
	constructor(props) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);

		let dt = new Date();
		this.state = {
			date: `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`,
			date_update: "",
			new_enrolments: 0,
			biometric_updates: 0,
			mandatory_biometric_updates: 0,
			demographic_updates: 0,
			total_enrolments: 0,
			total_cross_sell_leads: 0,

			formError: null,
			isLoading: props.match.params.id ? true : false,
		};

		if (props.match.params.id) {
			this.state.isUpdate = true;
		}
	}

	async handleSubmit(e) {
		e.preventDefault();

		if (!window.navigator.onLine) {
			this.setState({
				general_error: "You are currently offline. Please connect to the internet to perform this action.",
				isLoading: false,
			});
			return;
		}

		this.setState({
			general_error: "",
			formError: null,
			isLoading: true,
		});

		try {
			if (this.state.isUpdate) {
				await api.put(`/aadhaar/dailyactivity/${this.props.match.params.id}/`, this.state);
			} else {
				await api.post(`/aadhaar/dailyactivity/`, this.state);
			}

			this.props.enqueueSnackbar(`Daily Activity ${this.state.isUpdate ? "Updated" : "Created"}`, {
				variant: "success",
			});

			this.props.history.goBack();
		} catch (err) {
			console.log(err);
			this.setState({
				// formError: err,
				isLoading: false,
			});

			if (err.response && err.response.data) {
				this.setState({formError: err.response.data});
			}
			for (const key in err.response) {
				if (key == "non_field_errors" || key == "detail") {
					this.setState({
						general_error: err.response[key],
					});
				}
			}
		}
	}

	componentDidMount() {
		if (this.props.match.params.id) {
			let self = this;
			api.get(`/aadhaar/dailyactivity/${this.props.match.params.id}/`).then(function (data) {
				self.setState(data);
				self.setState({isLoading: false});
			});
		}
	}

	render() {
		return (
			<FromContainer>
				<form autoComplete="off" onSubmit={this.handleSubmit}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Typography variant="h5">
								{this.state.isUpdate ? "Update Daily Activity" : "Add Daily Activity"}
							</Typography>
						</Grid>
						{this.state.general_error ? (
							<Grid item xs={12}>
								<Alert severity="error">{this.state.general_error}</Alert>
							</Grid>
						) : (
							""
						)}

						<Grid item xs={12}>
							<TextField
								fullWidth
								type="date"
								name="date"
								label="Date of Reporting"
								variant="outlined"
								value={this.state.date}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControl variant="outlined" fullWidth>
								<InputLabel id="select-date-update">Date Update</InputLabel>
								<Select
									labelId="select-date-update"
									name="date_update"
									value={this.state.date_update}
									onChange={(event) => this.setState({[event.target.name]: event.target.value})}
									label="Date Update">
									<MenuItem value={""}>None</MenuItem>
									<MenuItem value={"State Holiday"}>State Holiday</MenuItem>
									<MenuItem value={"On Leave"}>On Leave</MenuItem>
									<MenuItem value={"Training"}>Training</MenuItem>
									<MenuItem value={"Technical issue"}>Technical issue at branch</MenuItem>
									{/* <MenuItem value={'others'}>Others</MenuItem> */}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="new_enrolments"
								label="New Enrolments"
								variant="outlined"
								value={this.state.new_enrolments}
								error={Boolean(this.state.formError?.new_enrolments)}
								helperText={this.state.formError?.new_enrolments?.join("\n")}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="mandatory_biometric_updates"
								label="No. of Mandatory Biometric Updates"
								variant="outlined"
								error={Boolean(this.state.formError?.mandatory_biometric_updates)}
								helperText={this.state.formError?.mandatory_biometric_updates?.join("\n")}
								value={this.state.mandatory_biometric_updates}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="biometric_updates"
								label="Biometric Updates with or without demographic updates"
								variant="outlined"
								error={Boolean(this.state.formError?.biometric_updates)}
								helperText={this.state.formError?.biometric_updates?.join("\n")}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="demographic_updates"
								label="Demographic Updates"
								variant="outlined"
								value={this.state.demographic_updates}
								error={Boolean(this.state.formError?.demographic_updates)}
								helperText={this.state.formError?.demographic_updates?.join("\n")}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="total_enrolments"
								label="Total Enrolments & Updates"
								variant="outlined"
								value={this.state.total_enrolments}
								error={Boolean(this.state.formError?.total_enrolments)}
								helperText={this.state.formError?.total_enrolments?.join("\n")}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="total_cross_sell_leads"
								label="Total cross sell leads"
								variant="outlined"
								value={this.state.total_cross_sell_leads}
								error={Boolean(this.state.formError?.total_cross_sell_leads)}
								helperText={this.state.formError?.total_cross_sell_leads?.join("\n")}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>

						<Grid item xs={12}>
							<LoadingButton
								btnText={this.state.isUpdate ? "Update Daily Activity" : "Add Daily Activity"}
								loadingText={this.state.isUpdate ? "Updating Record" : "Adding Record"}
								isLoading={this.state.isLoading}
								color="secondary"
								fullWidth
								type="submit"
								variant="contained"
								size="large"
							/>
						</Grid>
					</Grid>
				</form>
			</FromContainer>
		);
	}
}

// export default CustomerDataForm;
export default withSnackbar(withRouter(DailyActivityForm));
