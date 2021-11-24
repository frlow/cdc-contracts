import {ContractCollection} from 'cdc-contracts'
import {Interaction, Pact} from '@pact-foundation/pact'
import path from 'path'
import fetch from 'node-fetch-commonjs'

export type VoidResult = Promise<void> | void
export type VoidFn = SyncVoidFn | AsyncVoidFn
export type SyncVoidFn = () => void
export type AsyncVoidFn = () => Promise<void>
export type TestFn = SyncTestFn | AsyncTestFn
export type SyncTestFn = (name: string, fn: VoidFn) => void
export type AsyncTestFn = (name: string, fn: VoidFn) => Promise<void>

export const testContracts = (
    contracts: ContractCollection,
    consumer: string,
    provider: string,
    testFunctions: {
        describe: TestFn,
        test: TestFn,
        beforeAll: (fn: VoidFn) => VoidResult,
        beforeEach: (fn: VoidFn) => VoidResult,
        afterAll: (fn: VoidFn) => VoidResult,
        afterEach: (fn: VoidFn) => VoidResult,
        expectEqual: (a: any, b: any) => void
    }
) => {
    const pact = new Pact({
        consumer,
        provider,
        port: 4500,
        log: path.resolve(process.cwd(), 'logs', 'pact.log'),
        dir: path.resolve(process.cwd(), 'pacts'),
        logLevel: 'debug',
    })
    testFunctions.beforeAll(async () => {
        await pact.setup()
    })
    testFunctions.beforeEach(async () => {
        await pact.removeInteractions()
    })
    testFunctions.afterEach(async () => {
        await pact.verify()
    })
    testFunctions.afterAll(async () => {
        await pact.finalize()
    })
    for (const contractKey of Object.keys(contracts)) {
        testFunctions.describe(contractKey, () => {
            const contract = contracts[contractKey]
            for (const responseKey of contract.GetResponseKeys()) {
                testFunctions.test(responseKey, async () => {
                    const response = contract.GetMockResponse(responseKey)
                    const path = [contract.Request.path.replace(/\/$/, '')]
                        .concat(Object.values(contract.Request.params.path))
                        .join('/')
                    const request = {
                        path,
                        body: contract.RequestBody,
                        headers: {
                            ...contract.Request.headers,
                            ...contract.Request.params.header,
                        },
                        query: contract.Request.params.query,
                        method: contract.Method,
                    }
                    const interaction = new Interaction()
                        .given(`${contractKey} - ${responseKey}`)
                        .uponReceiving(contract.Description)
                        .withRequest(request)
                        .willRespondWith(response)
                    await pact.addInteraction(interaction)
                    const result = await contract.Fetch(
                        contract.Request.params.path,
                        contract.Request.params.query,
                        contract.Request.params.header,
                        contract.RequestBody,
                        (method, url, headers, body) => {
                            const fullUrl = `http://localhost:${pact.opts.port}${url}`
                            return fetch(fullUrl, {
                                method,
                                headers,
                                body: JSON.stringify(body),
                            }).then(async (d) => {
                                const serializedData = await d.text()
                                let data: any = undefined
                                if (serializedData === '') data = undefined
                                else {
                                    try {
                                        data = JSON.parse(serializedData)
                                    } catch {
                                        data = serializedData
                                    }
                                }
                                return {body: data, status: d.status}
                            })
                        }
                    )
                    testFunctions.expectEqual(result.status, response.status)
                    testFunctions.expectEqual(result.body || undefined, response.body)
                })
            }
        })
    }
}