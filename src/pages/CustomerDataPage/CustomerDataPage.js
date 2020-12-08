import React from 'react';

import Container from '@material-ui/core/Container';

import CustomerDataService from './../../services/CustomerDataService'
import CustomerDataForm from './CustomerDataForm'
class CustomerDataPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: CustomerDataService.getUnsyncedRecords()
        }
    }

    render() {

        return (
            <Container>
                <CustomerDataForm />
            </Container>
        )
    }
}

export default CustomerDataPage