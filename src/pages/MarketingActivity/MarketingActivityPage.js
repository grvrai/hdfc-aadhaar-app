import React from 'react';
import Container from '@material-ui/core/Container';
import { 
    Switch,
    Route,
  } from "react-router-dom";
import MarketingActivityForm from './MarketingActivityForm'
import MarketingActivityList from './MarketingActivityList'


class MarketingActivityPage extends React.Component {
    render() {
        let path = this.props.match.path;
        return (
            <Switch>
                <Route exact path={path} component={MarketingActivityList} />
                <Route path={`${path}/add`} component={MarketingActivityForm} />
                <Route path={`${path}/edit/:id`} component={MarketingActivityForm} />
            </Switch>
        )
    }
}

export default MarketingActivityPage