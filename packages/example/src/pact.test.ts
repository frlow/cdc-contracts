import {testContracts} from 'cdc-contracts-pact'
import {contracts} from "./contracts";

describe("Pact", () => {
    testContracts(
        contracts,
        'example',
        'example',
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
