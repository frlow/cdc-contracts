import {testContracts} from './Pact'
import {
    GetContract,
    ContractCollection,
    PutContract,
} from 'cdc-contracts'

describe('Pact', () => {
    const simpleGetContract = new GetContract<{ value: string }>(
        'Get Demo',
        {
            headers: {'content-type': 'application/json'},
            path: '/api/demo',
            params: {path: {}, query: {}, header: {}},
        },
        {
            success: {
                status: 200,
                headers: {'content-type': 'application/json'},
                body: {value: 'somevalue'},
            },
        }
    )

    const complexGetContract = new GetContract<{ value: string }>(
        'Get Demo',
        {
            headers: {'content-type': 'application/json'},
            path: '/api/demo/',
            params: {
                path: {one: 'aaa'},
                query: {two: 'bbb'},
                header: {three: 'ccc'},
            },
        },
        {
            success: {
                status: 200,
                headers: {'content-type': 'application/json'},
                body: {value: 'somevalue'},
            },
        }
    )

    const createDevice = new PutContract(
        'create device request',
        {
            path: '/api/device',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            params: {
                path: {},
                header: {Authorization: 'Bearer sometoken'},
                query: {},
            },
        },
        {
            domain: 'example.com',
            dataPath: '/data',
            volumesPath: '/volumes',
            password: 'pass',
            username: 'user',
        },
        {
            success: {
                status: 200,
                body: undefined,
            },
            unauthorized: {
                body: undefined,
                status: 401,
            },
        }
    )

    const contracts: ContractCollection = {
        simpleGetContract,
        complexGetContract,
        createDevice,
    }
    testContracts(
        contracts,
        'dummy',
        'dummy',
        {
            test,
            afterAll,
            afterEach,
            beforeEach,
            beforeAll,
            describe,
            expectEqual: (a, b) => expect(a).toStrictEqual(b)
        })
})
