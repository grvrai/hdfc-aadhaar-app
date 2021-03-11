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
import LoadingButton from "../../Components/LoadingButton";
import {withRouter} from "react-router-dom";
import {withSnackbar} from "notistack";
import FromContainer from "../../Components/FormContainer";

import AuthService from "../../services/auth-service";
import {api} from "../../services/customer-data-service";

class OtherActivityForm extends React.Component {
	constructor(props) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);

		this.state = {
			title: "",
			description: "",
			isLoading: props.match.params.id ? true : false,
		};

		if (props.match.params.id) {
			this.state.isUpdate = true;
		}
	}

	async handleSubmit(e) {		
		e.preventDefault();
		console.log('handleSubmit - OtherActivities')

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
				await api.put(`/aadhaar/otheractivities/${this.props.match.params.id}/`, this.state);
			} else {
				await api.post(`/aadhaar/otheractivities/`, this.state);
			}

			this.props.enqueueSnackbar(`Other Activity ${this.state.isUpdate ? "Updated" : "Added"}`, {
				variant: "success",
			});

			this.props.history.goBack();
		} catch (err) {
			console.log(err);
			this.setState({
				isLoading: false,
			});
			for (const key in err.response.data) {
				console.log(key)
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
		if (!window.navigator.onLine) {
			this.setState({
				general_error: "You are currently offline. Please connect to the internet to perform this action.",
				isLoading: false,
			});
			// return;
		}

		if (this.props.match.params.id) {
			try {
				api.get(`/aadhaar/otheractivities/${this.props.match.params.id}/`).then(function (data) {
					console.log(data.data)
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
			// let state_data = AuthService.getUserState();
			// self.setState({
			// 	operator_name: state_data.name,
			// 	operator_phone: state_data.phone,
			// 	branch_code: state_data.filter3,
			// 	branch_name: state_data.filter4,
			// });
		}
	}

	render() {
		return (
			<FromContainer>
				<form autoComplete="off" onSubmit={this.handleSubmit}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Typography variant="h5">{this.state.isUpdate ? "Update Activity" : "Submit Activity"}</Typography>
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
								type="text"
								name="title"
								label="Activity Title"
								variant="outlined"
								value={this.state.title}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								type="text"
								rows={4}
								multiline
								name="description"
								label="Activity Description"
								variant="outlined"
								value={this.state.description}
								onChange={(event) => this.setState({[event.target.name]: event.target.value})}
								disabled={this.state.isLoading}
								required
							/>
						</Grid>

						<Grid item xs={12}>
							<LoadingButton
								btnText={this.state.isUpdate ? "Update Activity" : "Add Activity"}
								loadingText={this.state.isUpdate ? "Updating Activity" : "Adding Activity"}
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
export default withSnackbar(withRouter(OtherActivityForm));
