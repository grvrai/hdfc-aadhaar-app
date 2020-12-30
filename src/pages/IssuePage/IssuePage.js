import React from 'react';

import Container from '@material-ui/core/Container';

import { 
    Switch,
    Route,
  } from "react-router-dom";

import IssueForm from './IssueForm'
import IssueList from './IssueList'

class CustomerDataPage extends React.Component {
    render() {
        let path = this.props.match.path;
        return (
            <Switch>
                <Route exact path={path} component={IssueList} />
                <Route path={`${path}/add`} component={IssueForm} />
                <Route path={`${path}/edit/:id`} component={IssueForm} />
            </Switch>
        )
    }
}

export default CustomerDataPage