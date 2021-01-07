import React, {useEffect, useState} from "react";

import {Box, Button, Card, CardActions, CardContent, Grid, Paper, Fab} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import DoneIcon from "@material-ui/icons/Done";
import ErrorIcon from '@material-ui/icons/Error';
import Select from "@material-ui/core/Select";
import PageHeader from "./../../Components/PageHeader";

import {useConfirmationDialog} from "./../../Components/ConfirmationDialogProvider";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import Avatar from "@material-ui/core/Avatar";

import FormContainer from "./../../Components/FormContainer";

import AadharDataService from "./../../services/customer-data-service";
import { useSnackbar } from "notistack";

export default function CustomerDataList({history, match}) {
	const {path} = match;
	let [items, setItems] = useState(null);
	const [unSyncedItems, setUnSyncedItems] = useState(null);
	const [syncedItems, setSyncedItems] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState(null);

	const {getConfirmation} = useConfirmationDialog();
	const {enqueueSnackbar, closeSnackbar} = useSnackbar()

	let dateOptions = [];
	let current_date = new Date();
	current_date.setHours(0, 0, 0, 0);
	const [selectedDate, setSelectedDate] = useState(current_date.toISOString());
	dateOptions.push(
		<MenuItem key={0} aria-label={current_date.toISOString()} value={current_date.toISOString()}>
			{current_date.toLocaleDateString()}
		</MenuItem>
	);
	for (let index = 0; index < 5; index++) {
		current_date.setDate(current_date.getDate() - 1);
		dateOptions.push(
			<MenuItem key={index + 1} aria-label={current_date.toISOString()} value={current_date.toISOString()}>
				{current_date.toLocaleDateString()}
			</MenuItem>
		);
	}

	useEffect(() => {
		loadList();
	}, [selectedDate]);

	const loadList = async () => {
		setError(null);
		setItems(null);
		let total_items = [];
		let unsynced_items = await AadharDataService.getUnsyncedRecords(new Date(selectedDate));
		console.log(unsynced_items);
		total_items.push(...unsynced_items);
		setUnSyncedItems(unsynced_items);
		// setItems(total_items);

		// if(!navigator.onLine) {
		//     setItems(total_items);
		//     return;
		// }
		try {
			let data = await AadharDataService.getRecords(new Date(selectedDate));
			total_items.push(...data.data.results);
		} catch (err) {
			console.log(err);
			setError(err);
		}
		setItems(total_items);
	};

	const editItem = (id) => {
		history.push(path + "/edit/" + id);
	};

	const deleteItem = async (id) => {
		const confirmed = await getConfirmation({
			title: "Delete Customer Data",
			message: "Are you sure you want to delete this Customer Data?",
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
		// this.props.history.push(path + '/' + id)
		await AadharDataService.deleteRecordFromCache(id);
		setItems((items) => items.filter((x) => x.id !== id));
	};

	const uploadRecords = async () => {
		if (!window.navigator.onLine) {
			enqueueSnackbar("You currently have no network connection.", {
				variant: "error",
			});
			return;
		}
		setIsUploading(true);
		await AadharDataService.uploadRecords();
		loadList().then(function () {
			setIsUploading(false);
		});
	};

	// items = syncedItems.push(unSyncedItems);
	// console.log(items)
	return (
		<Container style={{minHeight: "calc(100vh - 112px)"}} disableGutters bgcolor="primary.contrastText">
			<PageHeader icon={<GroupAddIcon />} title={"Customer Data"} />

			<Box bgcolor="primary.contrastText" style={{padding: "1rem"}} boxShadow={1}>
				<FormControl variant="outlined" fullWidth>
					<InputLabel id="select-list-date">Select Date</InputLabel>
					<Select
						labelId="select-list-date"
						name="list-date"
						onChange={(event) => setSelectedDate(event.target.value)}
						value={selectedDate}
						label="Select Date">
						{dateOptions}
					</Select>
				</FormControl>
			</Box>

			{unSyncedItems && unSyncedItems.length > 0 && (
				<Box bgcolor="success.main" color="primary.contrastText" padding={2}>
					<Typography color="inherit" variant="body2" style={{marginBottom: "1rem"}}>
						You have not uploaded <b>{unSyncedItems.length} records</b> for{" "}
						<b>{new Date(selectedDate).toLocaleDateString()}</b>. Tap the button below to upload the records.
					</Typography>
					<Button variant="contained" size="small" color="default" onClick={uploadRecords} disabled={isUploading}>
						{isUploading ? (
							<Grid container alignItems="center" justify="center">
								<CircularProgress color="secondary" size={12} style={{marginRight: "0.5rem"}} /> Uploading Records
							</Grid>
						) : (
							"Upload Records"
						)}
					</Button>
				</Box>
			)}

			{items && items.length > 0 && (
				<Box boxShadow={2} bgcolor="primary.contrastText" marginBottom="2rem">
					<List>
						{items.map((customerData) => (
							<ListItem divider style={{paddingTop: 16, paddingBottom: 16}} key={customerData.id}>
								<ListItemAvatar>
									<Avatar>
										<AccountCircleIcon style={{color: "white"}} />
									</Avatar>
								</ListItemAvatar>
								<Box>
									<Typography variant="body1">{customerData.name}</Typography>
									<Typography variant="caption">{customerData.service_availed}</Typography>
								</Box>

								{customerData.unsynced ? (
									<ListItemSecondaryAction>
										<IconButton
											edge="end"
											aria-label="delete"
											onClick={(e) => {
												deleteItem(customerData.id);
											}}>
											<DeleteIcon />
										</IconButton>
										<IconButton
											edge="end"
											aria-label="edit"
											onClick={(e) => {
												editItem(customerData.id);
											}}>
											<EditIcon />
										</IconButton>
									</ListItemSecondaryAction>
								) : (
									<ListItemSecondaryAction>
										<Box color="success.main">
											<DoneIcon />
										</Box>
									</ListItemSecondaryAction>
								)}
							</ListItem>
						))}
					</List>
				</Box>
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

			{!items && (
				<Grid container alignItems="center" justify="center" style={{padding: "2rem"}}>
					<CircularProgress color="secondary" size={20} />
				</Grid>
			)}
			
			{items && !items.length && !error && (
				<Grid container justify="center" alignItems="center" style={{padding: "2rem"}}>
					<Box color="primary.contrastText">
						<Typography variant="subtitle1" align="center">
							You have not added any Customer Data for <b>{new Date(selectedDate).toLocaleDateString()}</b> yet.
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
		</Container>
	);
}
