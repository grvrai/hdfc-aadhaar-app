import React, {useEffect, useState} from "react";

import AadharDataService from "./../../services/customer-data-service";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";

import GroupAddIcon from "@material-ui/icons/GroupAdd";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import ErrorIcon from "@material-ui/icons/Error";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import DoneIcon from "@material-ui/icons/Done";
import CircularProgress from "@material-ui/core/CircularProgress";

import {makeStyles} from "@material-ui/core/styles";

import {useHistory} from "react-router-dom";
import {Box, Divider} from "@material-ui/core";
import {useSnackbar} from "notistack";

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: "1rem",
	},
	highlightButton: {
		// backgroundColor: theme.palette.background.paper,
		color: theme.palette.info.dark,
	},
}));

export default function CustomerDataWidget() {
	const [path, setPath] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [records, setRecords] = useState([]);

	let history = useHistory();
	const {enqueueSnackbar, closeSnackbar} = useSnackbar();

	const classes = useStyles();
	//   let records = await AadharDataService.getUnsyncedRecord();

	useEffect(async () => {
		let records = await AadharDataService.getUnsyncedRecords();
		setRecords(records);
	}, []);

	const uploadRecords = async function () {
		if (!window.navigator.onLine) {
			enqueueSnackbar("You currently have no network connection.", {
				variant: "error",
			});
			return;
		}
		setIsUploading(true);
		await AadharDataService.uploadRecords();
		let records = await AadharDataService.getUnsyncedRecords();
		setRecords(records);
		setIsUploading(false);
	};

	return (
		<Card className={classes.root}>
			<CardContent>
				<Box display="flex" alignItems="center" color="primary.main">
					<PeopleAltIcon style={{marginRight: "1rem"}} />
					<Typography variant="h6">Customer Data</Typography>
				</Box>

				{records && records.length ? (
					<Box display="flex" alignItems="center" color="warning.main" marginTop="1rem">
						<ErrorIcon style={{marginRight: "1rem"}} />
						<Typography variant="body2">
							You have <b>{records.length} pending records</b> to upload. Please tap the upload records button below to
							upload
						</Typography>
					</Box>
				) : (
					<Box display="flex" alignItems="center" color="success.dark" marginTop="1rem">
						<DoneIcon style={{marginRight: "1rem"}} />
						<Typography variant="body2">
							You have no pending uploads remaining. You can add customer records by tapping add below
						</Typography>
					</Box>
				)}
			</CardContent>
			<Divider />
			<List component="nav" aria-label="main mailbox folders">
				{records && records.length ? (
					<ListItem button onClick={uploadRecords} className={classes.highlightButton}>
						<ListItemIcon>
							{isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon className={classes.highlightButton} />}
						</ListItemIcon>
						<ListItemText primary={isUploading ? "Uploading Pending Records" : "Upload Pending Records"} />
					</ListItem>
				) : (
					""
				)}
				<ListItem
					button
					onClick={(e) => {
						history.push("/customerdata/");
					}}>
					<ListItemIcon>
						<FormatListBulletedIcon />
					</ListItemIcon>
					<ListItemText primary="View Records" />
				</ListItem>
				<ListItem
					button
					onClick={(e) => {
						history.push("/customerdata/add");
					}}>
					<ListItemIcon>
						<GroupAddIcon />
					</ListItemIcon>
					<ListItemText primary="Add New Customer Data" />
				</ListItem>
			</List>
		</Card>
	);
}
