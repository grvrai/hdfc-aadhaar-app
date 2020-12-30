import React from 'react';

import Container from '@material-ui/core/Container';

import { 
    Switch,
    Route,
  } from "react-router-dom";

import CustomerDataForm from './CustomerDataForm'
import CustomerDataList from './CustomerDataList'

import AadharDataService from './../../services/customer-data-service'

class CustomerDataPage extends React.Component {
    render() {
        let path = this.props.match.path;
        return (
            <Switch>
                <Route exact path={path} component={CustomerDataList} />
                <Route path={`${path}/add`} component={CustomerDataForm} />
                <Route path={`${path}/edit/:id`} component={CustomerDataForm} />
            </Switch>
        )
    }
}

export default CustomerDataPage