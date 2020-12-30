import React from "react";

import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Avatar from "@material-ui/core/Avatar";
import DeleteIcon from "@material-ui/icons/Delete";
import ErrorIcon from "@material-ui/icons/Error";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function NotificationPage({items, deleteNotification, error}) {
	return (
		<Container maxWidth="sm" className="" disableGutters>
			{!items && !error && (
				<Grid container alignItems="center" justify="center" style={{padding: "2rem"}}>
					<CircularProgress color="secondary" size={20} />
				</Grid>
			)}

			{items && items.length > 0 && (
				<Box boxShadow={2} bgcolor="primary.contrastText" marginBottom="2rem">
					<List>
						{items.map((item) => (
							<NotificationListItem item={item} deleteNotification={deleteNotification} />
						))}
					</List>
				</Box>
			)}

			{error && (
				<Grid container justify="center" alignItems="center" style={{padding: "2rem"}}>
					<Box color="primary.contrastText" textAlign="center">
						<ErrorIcon />
						<Typography variant="subtitle1" align="center">
							{error.message == "Network Error" || error.message == "Failed to fetch"
								? "There was a network error in fetching your data. Please check your network and try again"
								: ""}

							{/* There was an error in fetching your data. Please try later. */}
							{JSON.stringify(error)}
						</Typography>
					</Box>
				</Grid>
			)}

			{items && !items.length && !error && (
				<Grid container justify="center" alignItems="center" style={{padding: "2rem"}}>
					<Box color="primary.contrastText">
						<Typography variant="subtitle1" align="center">
							You have no notifications. When you receive notifications, they will show up in this list.
						</Typography>
					</Box>
				</Grid>
			)}
		</Container>
	);
}

function NotificationListItem({item, deleteNotification}) {
	const [isDeleting, setIsDeleting] = React.useState(false);

	return (
		<ListItem divider style={{paddingTop: 16, paddingBottom: 16}} key={item.id}>
			<ListItemAvatar>
				<Avatar>
					<NotificationsNoneIcon style={{color: "white"}} />
				</Avatar>
			</ListItemAvatar>
			<Box>
				{/* <Typography variant="overline" style={{lineHeight: 1}}>Camp Location</Typography> */}
				<Typography variant="body1" color="default">
					{item.changeTitle}
				</Typography>
				<Typography variant="subtitle2" color="textSecondary" style={{marginBottom: "0.5rem"}}>
					{item.changeMessage}
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
					<Typography variant="subtitle2" align="center" color="textSecondary">
						{new Date(item.createdAt).toLocaleDateString()}
					</Typography>
				</Box>
				̵
			</Box>

			<ListItemSecondaryAction>
				̵̵
				<IconButton
					edge="end"
					aria-label="delete"
					onClick={(e) => {
						setIsDeleting(true);
						deleteNotification(item.id);
					}}>
					<DeleteIcon />
				</IconButton>
			</ListItemSecondaryAction>
		</ListItem>
	);
}
