import React from 'react';
import Container from '@material-ui/core/Container';
import { 
    Switch,
    Route,
  } from "react-router-dom";

import DailyActivityList from './DailyActivityList'
import DailyActivityForm from './DailyActivityForm'


class DailyActivityPage extends React.Component {
    render() {
        let path = this.props.match.path;
        return (
            <Switch>
                {/* <Route exact path={path} component={DailyActivityList} /> */}
                <Route path={`${path}/add`} component={DailyActivityForm} />
                <Route path={`${path}/edit/:id`} component={DailyActivityForm} />
            </Switch>
        )
    }
}

export default DailyActivityPage