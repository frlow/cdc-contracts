# cdc-contracts

cdc-contracts is a tool to help create consumer driven contracts for web frontends written in Typescript.

## Installation

```
npm i --save cdc-contracts

or 

yarn add cdc-contracts
```

# Example

```javascript
const getContract = new PutContract(
    'Description', // Contract description
    {
        headers: { // static headers that must be in every request
            'content-type': 'application/json'
        },
        path: '/api/test', // base path of the request
        params: { // full url would be: '/api/test/12345?lang=en' with headers: "'content-type': 'application/json'; 'authorization': 'Bearer someAuthorizationTokenHere'"
            path: { // path parameters to be added to the base path
                id: '12345'
            }, header: { // header parameters with examples of values
                'authorization': 'Bearer someAuthorizationTokenHere'
            }, query: { // query parameters 
                'lang': 'en'
            }
        },
    },
    {id: 'someId'}, // Example of request body
    { // Examples of responses
        success: { // Example of a response
            body: {name: 'myName'}, // Response body
            status: 200, // Response status code
            headers: {'content-type': 'application/json'}, // Response headers
        },
    }
)
```

## REST Methods - Get, Put, Post, Delete

There are 4 different contract constructors, corresponding to a rest method:

```javascript
new GetContract()
new PutContract()
new PostContract()
new DeleteContract()
```

## Fetch
