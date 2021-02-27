import React from "react";
// import ConfirmationDialog from "./ConfirmationDialog";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmationDialog = ({open, title, message, onConfirm, onDismiss, btnConfirmText, btnDismissText}) => {
	return (
		<Dialog open={open} onClose={onDismiss} TransitionComponent={Transition}>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText>{message}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onDismiss}>{btnDismissText ? btnDismissText : "Cancel"}</Button>
				<Button color="primary" variant="contained" onClick={onConfirm}>
					{btnConfirmText ? btnConfirmText : "Confirm"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const ConfirmationDialogContext = React.createContext({});

const ConfirmationDialogProvider = ({children}) => {
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [dialogConfig, setDialogConfig] = React.useState({});

	const openDialog = ({title, message, actionCallback, btnConfirmText, btnDismissText}) => {
		console.log("openDialog -> setDialogOpen", setDialogOpen);
		console.log("openDialog -> dialogOpen", dialogOpen);
		setDialogOpen(true);
		setDialogConfig({title, message, actionCallback, btnConfirmText, btnDismissText});
	};

	const resetDialog = () => {
		setDialogOpen(false);
		setTimeout(function () {
			setDialogConfig({});
		}, 1000)
	};

	const onConfirm = () => {
		resetDialog();
		dialogConfig.actionCallback(true);
		
	};

	const onDismiss = () => {
		resetDialog();
		dialogConfig.actionCallback(false);
	};

	return (
		<ConfirmationDialogContext.Provider value={{openDialog}}>
			<ConfirmationDialog
				open={dialogOpen}
				title={dialogConfig?.title}
				message={dialogConfig?.message}
				btnConfirmText={dialogConfig?.btnConfirmText}
				btnDismissText={dialogConfig?.btnDismissText}
				onConfirm={onConfirm}
				onDismiss={onDismiss}
			/>
			{children}
		</ConfirmationDialogContext.Provider>
	);
};

const useConfirmationDialog = () => {
	const {openDialog} = React.useContext(ConfirmationDialogContext);

	const getConfirmation = ({...options}) =>
		new Promise((res) => {
			openDialog({actionCallback: res, ...options});
		});

	return {getConfirmation};
};

function withConfirmationDialog(Component) {
	// ...and returns another component...
	return function WrapperComponent(props) {
		return (
			<ConfirmationDialogContext.Consumer>
				{(state) => <Component {...props} context={state} />}
			</ConfirmationDialogContext.Consumer>
		);
	};
}

export default ConfirmationDialog;
export {ConfirmationDialogProvider, useConfirmationDialog, withConfirmationDialog};
