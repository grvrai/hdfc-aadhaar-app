import React from 'react';

import Container from '@material-ui/core/Container';

import { 
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useHistory,
    useLocation
  } from "react-router-dom";

import CustomerDataForm from './CustomerDataForm'
import CustomerDataList from './CustomerDataList'

import CustomerDataService from './../../services/CustomerDataService'

class CustomerDataPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: CustomerDataService.getUnsyncedRecords()
        }
    }

    render() {
        let path = this.props.match.path;
        return (
            <Container>
                <Switch>
                    <Route exact path={path} component={CustomerDataList} />
                    <Route path={`${path}/add`} component={CustomerDataForm} />
                    <Route path={`${path}/edit/:id`} component={CustomerDataForm} />
                </Switch>
            </Container>
        )
    }
}

export default CustomerDataPage