function fetchData(type, url, data, headers) {
    var init = {
        // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json',
            "Authorization": `Token ${Constants.token}`
        },
        method: type // *GET, POST, PUT, DELETE, etc.
        // mode: 'cors', // no-cors, cors, *same-origin
        // redirect: 'follow', // manual, *follow, error
        // referrer: 'no-referrer', // *client, no-referrer
    }

    if(headers) {
        init.headers = headers
    }


    if(data) {
        if (type.toLowerCase() == 'get') {
            url += getQueryString(data);
        } else {
            init.body = JSON.stringify(data);
        }
    }

    let response = null;

    // Default options are marked with *
    return fetch(url, init)
    .then(responseObject => {
        // Saving response for later use in lower scopes
        response = responseObject;

        // HTTP unauthorized
        if (response.status === 401 || response.status === 403) {
            return response.text();
        }

        // Check for error HTTP error codes
        if (response.status < 200 || response.status >= 300 || response.status == 204) {
            // Get response as text
            return response.text();
        }

        // Get response as json
        return response.json();
    })
    // "parsedResponse" will be either text or javascript object depending if
    // "response.text()" or "response.json()" got called in the upper scope
    .then(parsedResponse => {
        // Check for HTTP error codes
        if (response.status < 200 || response.status >= 300) {
            // Throw error
            throw parsedResponse;
        }

        // Request succeeded
        return parsedResponse;
    })
    .catch(error_data => {
        // Throw custom API error
        // If response exists it means HTTP error occured
        if (response) {
            var error = new Error(`Request failed with status ${ response.status }.`);
            error.response = JSON.parse(error_data);
            error.status = response.status;
            throw error;
            //throw new Error(`Request failed with status ${ response.status }.`, error, response.status);
        } else {
            //throw new ApiError(error.toString(), null, 'REQUEST_FAILED');
            // var error = new Error(error.toString());
            //error.response = response.json();
            // throw error;
        }
    });
}