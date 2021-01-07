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

import {withRouter} from "react-router-dom";
import {fetchData} from "../../helpers/helpers";
import {withSnackbar} from "notistack";

import FromContainer from "./../../Components/FormContainer";

import Constants from "./../../constants";
import LoadingButton from "./../../Components/LoadingButton";

import {api} from "./../../services/customer-data-service";

class MarketingActivityForm extends React.Component {
	constructor(props) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);

		this.state = {
			camps_count: "",
			camp_location: "",
			posters_count: "",
			leaflets_count: "",
			other_activity: "",

			formError: null,
			isLoading: props.match.params.id ? true : false,
		};

		if (props.match.params.id) {
			// this.state = AadharDataService.get
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
			isLoading: true,
		});

		try {
			if (this.state.isUpdate) {
				await api.put(`/aadhaar/marketingactivity/${this.props.match.params.id}/`, this.state);
			} else {
				await api.post(`/aadhaar/marketingactivity/`, this.state);
			}

			this.props.enqueueSnackbar(`Marketing Activity ${this.state.isUpdate ? "Updated" : "Created"}`, {
				variant: "success",
			});

			this.props.history.goBack();
		} catch (err) {
			this.setState({
				isLoading: false,
			});
			if (err.response && err.response.data) {
				this.setState({formError: err.response.data});
			}
			// for (const key in err.response) {
			// 	if (key == "non_field_errors" || key == "detail") {
			// 		this.setState({
			// 			general_error: err.response[key],
			// 		});
			// 	}
			// }
		}
	}

	componentDidMount() {
		if (this.props.match.params.id) {
			let self = this;
			api.get(`/aadhaar/marketingactivity/${this.props.match.params.id}/`).then(function (data) {
				self.setState(data);
				self.setState({isLoading: false});
			});
		}
	}

	render() {
		let formError = this.state.formError;
		return (
			<FromContainer>
				<form className="login-form" autoComplete="off" onSubmit={this.handleSubmit}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Typography variant="h5">
								{this.state.isUpdate ? "Update Marketing Activity" : "Add Marketing Activity"}
							</Typography>
						</Grid>
						{this.state.general_error ? (
							<Grid item xs={12}>
								<Alert severity="error">{this.state.general_error}</Alert>
							</Grid>
						) : (
							""
						)}

						{formError && formError.non_field_errors ? (
							<Grid item xs={12}>
								<Alert severity="error">{formError.non_field_errors.join("\n")}</Alert>
							</Grid>
						) : (
							""
						)}

						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="camps_count"
								label="Number of Camps"
								variant="outlined"
								value={this.state.camps_count}
								error={Boolean(this.state.formError?.camps_count)}
								helperText={this.state.formError?.camps_count?.join("\n")}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControl variant="outlined" fullWidth>
								<InputLabel id="select-camp_location">Camp done at</InputLabel>
								<Select
									labelId="select-camp_location"
									name="camp_location"
									value={this.state.camp_location}
									error={Boolean(this.state.formError?.camp_location)}
									helperText={this.state.formError?.camp_location?.join("\n")}
									onChange={(event) => this.setState({[event.target.name]: event.target.value})}
									label="Camp done at"
									required>
									<MenuItem value={"corporate"}>Corporate</MenuItem>
									<MenuItem value={"school"}>School</MenuItem>
									<MenuItem value={"govtoffice"}>Govt. Office</MenuItem>
									<MenuItem value={"society"}>Society</MenuItem>
									<MenuItem value={"others"}>Others</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="leaflets_count"
								label="Number of Leaflets"
								variant="outlined"
								value={this.state.leaflets_count}
								error={Boolean(this.state.formError?.leaflets_count)}
								helperText={this.state.formError?.leaflets_count?.join("\n")}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								name="posters_count"
								label="Number of Posters"
								variant="outlined"
								value={this.state.posters_count}
								error={Boolean(this.state.formError?.posters_count)}
								helperText={this.state.formError?.posters_count?.join("\n")}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								multiline
								rows={4}
								name="other_activity"
								label="Other Activity Done"
								variant="outlined"
								value={this.state.other_activity}
								error={Boolean(this.state.formError?.other_activity)}
								helperText={this.state.formError?.other_activity?.join("\n")}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								// required
							/>
						</Grid>
						<Grid item xs={12}>
							<LoadingButton
								btnText={this.state.isUpdate ? "Update Marketing Activity" : "Add Marketing Activity"}
								loadingText={this.state.isUpdate ? "Update Marketing Activity" : "Add Marketing Activity"}
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
export default withSnackbar(withRouter(MarketingActivityForm));
