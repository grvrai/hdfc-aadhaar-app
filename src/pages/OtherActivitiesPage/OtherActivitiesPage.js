
import React from "react";

import Container from "@material-ui/core/Container";

import {Switch, Route} from "react-router-dom";

import OtherActivitiesForm from "./OtherActivitiesForm";
import OtherActivitiesList from "./OtherActivitiesList";

export default function OtherActivitiesPage({match}) {
	let path = match.path;
	return (
		<Switch>
			<Route exact path={path} component={OtherActivitiesList} />
			<Route path={`${path}/add`} component={OtherActivitiesForm} />
			<Route path={`${path}/edit/:id`} component={OtherActivitiesForm} />
		</Switch>
	);
}
