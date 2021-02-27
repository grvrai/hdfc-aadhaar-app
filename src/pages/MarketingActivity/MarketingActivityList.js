import React, {useEffect, useState} from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Fab from "@material-ui/core/Fab";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ErrorIcon from '@material-ui/icons/Error';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
// import ListItemAvatar from "@material-ui/core/ListItemAvatar";
// import ListItemIcon from "@material-ui/core/ListItemIcon";
// import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
// import Avatar from "@material-ui/core/Avatar";

import PageHeader from "./../../Components/PageHeader";
import {useConfirmationDialog} from "./../../Components/ConfirmationDialogProvider";
import {useSnackbar} from "notistack";

import {api} from "./../../services/customer-data-service";

export default function MarketingActivityList({history, match}) {
	const {path} = match;
	const [items, setItems] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState(null);

	const {getConfirmation} = useConfirmationDialog();
	const {enqueueSnackbar, closeSnackbar} = useSnackbar();

	useEffect(async () => {
		setError(null);
		let d = new Date();
		d.setHours(0, 0, 0);
		api
			.get(`/aadhaar/marketingactivity/?createdAt__gte=${d.toISOString()}`)
			.then(function (data) {
				setItems(data.data.results);
			})
			.catch(function (err) {
				setError(err);
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
			title: "Delete Marketing Activity",
			message: "Are you sure you want to delete this Marketing Activity?",
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
			await api.delete(`/aadhaar/marketingactivity/${id}/`);
			setItems((items) => items.filter((x) => x.id !== id));
		} catch (err) {
			enqueueSnackbar("There was an error in deleting this item.", {
				variant: "error",
			});
			console.log(err);
		}
	};

	console.log(isUploading);
	return (
		<div>
			<PageHeader icon={<AssignmentIcon />} title={"Marketing Activity"} />

			{items && items.length > 0 && (
				<Box boxShadow={2} bgcolor="primary.contrastText" marginBottom="2rem">
					<List>
						{items.map((marketingActivity) => (
							<ListItem divider style={{paddingTop: 16, paddingBottom: 16}} key={marketingActivity.id}>
								{/* <ListItemAvatar>
					<Avatar>
						<AccountCircleIcon style={{color:'white'}}/>
					</Avatar>
				</ListItemAvatar> */}
								<Box>
									<Typography variant="overline" style={{lineHeight: 1}}>
										Camp Location
									</Typography>
									<Typography variant="subtitle1" color="primary" style={{marginBottom: "8px"}}>
										{marketingActivity.camp_location}
									</Typography>
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
											{" "}
											{new Date(marketingActivity.createdAt).toLocaleDateString()}
										</Typography>
									</Box>
								</Box>

								<ListItemSecondaryAction>
									<IconButton
										edge="end"
										aria-label="delete"
										onClick={(e) => {
											deleteItem(marketingActivity.id);
										}}>
										<DeleteIcon />
									</IconButton>
									<IconButton
										edge="end"
										aria-label="edit"
										onClick={(e) => {
											editItem(marketingActivity.id);
										}}>
										<EditIcon />
									</IconButton>
								</ListItemSecondaryAction>
							</ListItem>
						))}
					</List>
				</Box>
			)}

			{!items && !error && (
				<Grid container alignItems="center" justify="center" style={{padding: "2rem"}}>
					<CircularProgress color="secondary" size={20} />
				</Grid>
			)}

			{error && (
				<Grid container justify="center" alignItems="center" style={{padding: "2rem"}}>
					<Box color="primary.contrastText">
						<ErrorIcon/>
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
						<Typography variant="subtitle1" align="center">
							You have not added any Marketing Activity for {new Date().toLocaleDateString()}.
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
				Add Record
			</Fab>
			{/* <Button variant="contained" color="primary" onClick={() => {history.push(path + '/add')}}>Add New</Button> */}
		</div>
	);
}
