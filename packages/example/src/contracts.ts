import {GetContract, ResponseCollection} from "cdc-contracts";

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
    }
);

export const contracts = {getCustomers};
