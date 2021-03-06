import React from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import LoadingButton from "./../../Components/LoadingButton";
import {withRouter} from "react-router-dom";
import {withSnackbar} from "notistack";
import FromContainer from "./../../Components/FormContainer";

import AuthService from "./../../services/auth-service";
import {api} from "./../../services/customer-data-service";

class DailyActivityForm extends React.Component {
	constructor(props) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);

		this.state = {
			issue: "",
			branch_code: "",
			branch_name: "",
			operator_name: "",
			operator_phone: "",
			supervisor_name: "",
			supervisor_phone: "",
			remarks: "",

			isLoading: props.match.params.id ? true : false,
		};

		if (props.match.params.id) {
			this.state.isUpdate = true;
		}
	}

	async handleSubmit(e) {		
		e.preventDefault();

		// if (!window.navigator.onLine) {
		// 	this.setState({
		// 		general_error: "You are currently offline. Please connect to the internet to perform this action.",
		// 		isLoading: false,
		// 	});
		// 	return;
		// }

		if (!window.navigator.onLine) {
			this.setState({
				general_error: "You are currently offline. Please connect to the internet to perform this action.",
				isLoading: false,
			});
			window.scrollTo(0,0);
			return;
		}

		this.setState({
			general_error: "",
			isLoading: true,
		});

		try {
			if (this.state.isUpdate) {
				var resp = await api.put(`/aadhaar/technicalissue/${this.props.match.params.id}/`, this.state);
			} else {
				resp = await api.post(`/aadhaar/technicalissue/`, this.state);
			}

			this.props.enqueueSnackbar(`Technical Issue ${this.state.isUpdate ? "Updated" : "Reported"}`, {
				variant: "success",
			});

			// this.props.history.goBack();
			console.log(resp)
		} catch (err) {
			console.log(err);
			this.setState({
				isLoading: false,
			});
			for (const key in err.response.data) {
				if (key == "non_field_errors" || key == "detail") {
					this.setState({
						general_error: err.response.data[key],
					});
				}
			}
		}
	}

	componentDidMount() {
		let self = this;
		if (this.props.match.params.id) {
			try {
				api.get(`/aadhaar/technicalissue/${this.props.match.params.id}/`).then(function (data) {
					self.setState(data.data);
					self.setState({isLoading: false});
				});
			} catch (err) {
				this.props.enqueueSnackbar("There was an error in loading this item", {
					variant: "error",
				});
				this.props.history.goBack();
			}
		} else {
			let state_data = AuthService.getUserState();
			self.setState({
				operator_name: state_data.name,
				operator_phone: state_data.phone,
				branch_code: state_data.filter4,
				branch_name: state_data.filter3,
			});
		}
	}

	render() {
		return (
			<FromContainer>
				<form autoComplete="off" onSubmit={this.handleSubmit}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Typography variant="h5">{this.state.isUpdate ? "Update Issue" : "Submit Issue"}</Typography>
						</Grid>
						{this.state.general_error ? (
							<Grid item xs={12}>
								<Alert severity="error">{this.state.general_error}</Alert>
							</Grid>
						) : (
							""
						)}

						<Grid item xs={12}>
							<FormControl variant="outlined" fullWidth>
								<InputLabel id="select-issue-type">Issue Type</InputLabel>
								<Select
									labelId="select-issue-type"
									name="issue"
									value={this.state.issue}
									onChange={(event) => this.setState({[event.target.name]: event.target.value})}
									label="Issue Type">
									<MenuItem value={"GPS Issue"}>GPS Issue</MenuItem>
									<MenuItem value={"Iris Issue"}>Iris Issue</MenuItem>
									<MenuItem value={"Web Camera Issue"}>Web Camera Issue</MenuItem>
									<MenuItem value={"Dongle Issue"}>Dongle Issue</MenuItem>
									<MenuItem value={"Morpho Issue"}>Morpho Issue</MenuItem>
									<MenuItem value={"Printer Issue"}>Printer Issue</MenuItem>
									<MenuItem value={"Laptop/System Issue"}>Laptop/System Issue</MenuItem>
									<MenuItem value={"Operator Sync Issue"}>Operator Sync Issue</MenuItem>
									<MenuItem value={"Other Issue"}>Other Issue</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								multiline
								rows={4}
								type="number"
								name="remarks"
								label="Remarks"
								variant="outlined"
								value={this.state.remarks}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="text"
								name="operator_name"
								label="Operator Name"
								variant="outlined"
								value={this.state.operator_name}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="text"
								name="branch_code"
								label="Branch Code"
								variant="outlined"
								value={this.state.branch_code}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="text"
								name="branch_name"
								label="Branch Name"
								variant="outlined"
								value={this.state.branch_name}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								type="text"
								name="supervisor_name"
								label="Supervisor Name"
								variant="outlined"
								value={this.state.supervisor_name}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="supervisor_phone"
								label="Supervisor Phone"
								variant="outlined"
								value={this.state.supervisor_phone}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>

						<Grid item xs={12}>
							<LoadingButton
								btnText={this.state.isUpdate ? "Update Issue" : "Submit Issue"}
								loadingText={this.state.isUpdate ? "Updating Issue" : "Submitting Issue"}
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
