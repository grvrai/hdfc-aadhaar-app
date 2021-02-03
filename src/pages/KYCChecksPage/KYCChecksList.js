import React, {useEffect, useState} from "react";

import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Fab from "@material-ui/core/Fab";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import ErrorIcon from "@material-ui/icons/Error";
import AccessTimeIcon from "@material-ui/icons/AccessTime";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import PageHeader from "./../../Components/PageHeader";
import {useConfirmationDialog} from "./../../Components/ConfirmationDialogProvider";
import {useSnackbar} from "notistack";

import {api} from "./../../services/customer-data-service";

export default function KYCChecksList({history, match}) {
	const {path} = match;
	const [items, setItems] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState(false);
	const {enqueueSnackbar, closeSnackbar} = useSnackbar();
	const {getConfirmation} = useConfirmationDialog();
	// const classes = useStyles()

	useEffect(() => {
		setError(null);
		api
			.get(`/aadhaar/kycchecks/`)
			.then(function (data) {
				setItems(data.data.results);
			})
			.catch(function (err) {
				setError(err);
				setItems([]);
			});
	}, []);

	const editItem = (id) => {
		if (!window.navigator.onLine) {
			enqueueSnackbar("You currently have no network connection.", {
				variant: "error",
			});
			return;
		}
		history.push(path + "/edit/" + id);
	};

	const deleteItem = async (id) => {
		if (!window.navigator.onLine) {
			enqueueSnackbar("You currently have no network connection.", {
				variant: "error",
			});
			return;
		}

		const confirmed = await getConfirmation({
			title: "Delete KYC Check",
			message: "Are you sure you want to delete this item?",
			btnConfirmText: "Delete",
		});

		if (!confirmed) return;

		setItems(
			items.map((x) => {
				if (x.id === id) {
					x.isDeleting = true;
				}
				return x;
			})
		);

		try {
			await api.delete(`/aadhaar/kycchecks/${id}/`);
			setItems((items) => items.filter((x) => x.id !== id));
		} catch (err) {}
	};

	return (
		<div>
			<PageHeader icon={<ErrorIcon />} title={"KYC Checks"} />

			{/* {items && items.length > 0 && items.map(item => 
                <Card key={item.id}>
                    <Grid container style={{padding: '1rem'}} spacing={2}>
                        <Grid item xs={7}>
                            <Typography variant="overline" style={{lineHeight: 1}}>Issue</Typography>
                            <Typography variant="body1" color="primary">{item.issue}</Typography>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant="overline" style={{lineHeight: 1}}>Reported On</Typography>
                            <Typography variant="body2" color="primary">{new Date(item.createdAt).toLocaleDateString()}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button startIcon={<EditIcon/>} color="default" onClick={(e) => {editItem(item.id)}}>Edit</Button>
                            <Button startIcon={<DeleteIcon/>} color="default" onClick={(e) => {deleteItem(item.id)}}>Delete</Button>
                        </Grid> 
                    </Grid>
                </Card>
            )} */}
			{items && items.length > 0 && (
				<Box boxShadow={2} bgcolor="primary.contrastText">
					<List>
						{items.map((item) => (
							<ListItem divider style={{paddingTop: 16, paddingBottom: 16}} key={item.id}>
								<Box>
									<Grid container spacing={1} style={{marginBottom: 7}}>
										<Grid item xs={12}>
											<Typography variant="overline" style={{lineHeight: 1}}>
												Supervisor Name
											</Typography>
											<Typography variant="subtitle1" color="primary" >
												{item.supervisor_name}
											</Typography>
										</Grid>
										<Grid item xs={12} style={{display:'flex', alignItems: 'center'}}>
											<Typography variant="overline" style={{lineHeight: 1, marginRight: 10}}>
												Checks
											</Typography>
											<Typography variant="subtitle1" color="primary" >
												{item.kyc_checks_done}
											</Typography>
										</Grid>
									</Grid>

									<Box display="flex" alignItems="center">
										<AccessTimeIcon
											fontSize="inherit"
											style={{
												marginRight: "0.25rem",
												height: "0.9rem",
												width: "0.9rem",
											}}
										/>
										<Typography variant="subtitle2" align="center">
											{new Date(item.createdAt).toLocaleDateString()}
										</Typography>
									</Box>
								</Box>

								<ListItemSecondaryAction>
									<IconButton
										edge="end"
										aria-label="delete"
										onClick={(e) => {
											deleteItem(item.id);
										}}>
										<DeleteIcon />
									</IconButton>
									<IconButton
										edge="end"
										aria-label="edit"
										onClick={(e) => {
											editItem(item.id);
										}}>
										<EditIcon />
									</IconButton>
								</ListItemSecondaryAction>
							</ListItem>
						))}
					</List>
				</Box>
			)}

			{!items && (
				<Grid container alignItems="center" justify="center" style={{padding: "2rem"}}>
					<CircularProgress color="secondary" size={20} />
				</Grid>
			)}

			{error && (
				<Grid container justify="center" alignItems="center" style={{padding: "2rem"}}>
					<Box color="primary.contrastText" textAlign="center">
						<ErrorIcon />
						<Typography variant="subtitle1" align="center">
							{error.message == "Network Error"
								? "There was a network error in fetching your data. Please check your network and try again"
								: ""}

							{/* There was an error in fetching your data. Please try later. */}
							{/* {JSON.stringify(error)} */}
						</Typography>
					</Box>
				</Grid>
			)}

			{items && !items.length && !error && (
				<Grid container justify="center" alignItems="center" style={{padding: "2rem"}}>
					<Box color="primary.contrastText">
						<Typography variant="subtitle1" align="center" color="inherit">
							You have not reported any KYC checks yet.
						</Typography>
					</Box>
				</Grid>
			)}
			<Fab
				variant="extended"
				size="medium"
				color="default"
				aria-label="upload records"
				onClick={() => {
					history.push(path + "/add");
				}}
				style={{position: "fixed", bottom: "72px", right: "16px"}}>
				<AddIcon />
				Add KYC Check
			</Fab>
			{/* <Button variant="contained" color="primary" onClick={() => {history.push(path + '/add')}}>Add New</Button> */}
		</div>
	);
}
