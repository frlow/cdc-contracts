import {GetContract, PostContract} from "cdc-contracts";

export const getCustomers = new GetContract(
    "Get customers",
    {
        headers: {
            "x-client": "customer-web",
        },
        params: {
            header: {
                Authorization: "Bearer sometoken",
            },
            path: {
                region: "se"
            },
            query: {
                logid: "AAAA1111"
            },
        },
        path: "/api/customers",
    },
    {
        success: {
            description: "Found customers on server",
            status: 200,
            body: [
                {name: "Adam", customerNr: 0, payment: true},
                {name: "Bertil", customerNr: 1, payment: false}
            ],
        },
        unauthorized: {
            description: "User is not authorized",
            status: 401,
        },
        withCaesar: {
            description: 'Found customers on server',
            status: 200,
            body: [
                {name: 'Adam', customerNr: 0, payment: true},
                {name: 'Bertil', customerNr: 1, payment: false},
                {name: 'Caesar', customerNr: 2, payment: false},
            ],
        },
    }
);

const postAddCustomer = new PostContract("Add new customer", {
        path: "/api/customer",
        params: {path: {}, query: {}, header: {}},
        headers: {"content-type": "Application/json"},
    },
    {name: "Caesar"},
    {
        success: {
            status: 200,
            transitions: {
                getCustomers: "withCaesar"
            }
        }
    })

export const contracts = {getCustomers, postAddCustomer}
