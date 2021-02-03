
import React from "react";

import Container from "@material-ui/core/Container";

import {Switch, Route} from "react-router-dom";

import KYCChecksForm from "./KYCChecksForm";
import KYCChecksList from "./KYCChecksList";

export default function KYCChecksPage({match}) {
	let path = match.path;
	return (
		<Switch>
			<Route exact path={path} component={KYCChecksList} />
			<Route path={`${path}/add`} component={KYCChecksForm} />
			<Route path={`${path}/edit/:id`} component={KYCChecksForm} />
		</Switch>
	);
}

// class CustomerDataPage extends React.Component {
// 	render() {
// 		let path = this.props.match.path;
// 		return (
// 			<Switch>
// 				<Route exact path={path} component={CustomerDataList} />
// 				<Route path={`${path}/add`} component={CustomerDataForm} />
// 				<Route path={`${path}/edit/:id`} component={CustomerDataForm} />
// 			</Switch>
// 		);
// 	}
// }

// export default CustomerDataPage;
