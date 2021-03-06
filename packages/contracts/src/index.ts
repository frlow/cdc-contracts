import Dict = NodeJS.Dict;

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type Params = { [index: string]: string }

export interface ResponseExample<TResponseBody> {
  description?: string
  status: number
  headers?: { [index: string]: string }
  body?: TResponseBody
  transitions?: Params
  hold?: boolean
  ignore?: boolean
}

export interface FetchResponse<T> {
  status: number
  body?: T
}

export interface Request<TPathParams extends Params,
  TQueryParams extends Params,
  THeaderParams extends Params> {
  path: string
  headers: Params
  params: {
    path: TPathParams
    query: TQueryParams
    header: THeaderParams
  }
}

export type FetchFunc<TRequestBody, TResponseBody> = (
  method: Method,
  url: string,
  headers: Params,
  body: TRequestBody
) => Promise<FetchResponse<TResponseBody>>

export const createDefaultFetch: (
  fetch: any,
  baseUrl: string
) => FetchFunc<any, any> = (fetch, baseUrl) => (method, url, headers, body) => {
  const fullUrl = `${baseUrl}${url}`
  return fetch(fullUrl, {
    method,
    headers,
    body: JSON.stringify(body),
  }).then(async (d: any) => {
    if (!d.ok) return {status: d.status}
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

export abstract class Contract<TPathParams extends Params,
  TQueryParams extends Params,
  THeaderParams extends Params,
  TResponseBody,
  TRequestBody> {
  protected constructor(
    private description: string,
    private method: Method,
    private request: Request<TPathParams, TQueryParams, THeaderParams>,
    private requestBody: TRequestBody,
    private responseExamples: {
      [index: string]: ResponseExample<TResponseBody>
    }
  ) {
  }

  public async Fetch(
    request: {
      fetchFunc?: FetchFunc<TRequestBody, TResponseBody>
      path: TPathParams,
      query: TQueryParams,
      header: THeaderParams,
      body: TRequestBody,
    }
  ): Promise<FetchResponse<TResponseBody>> {
    const queryParamsValue =
      Object.keys(request.query).length === 0
        ? ''
        : `?${Object.keys(request.query)
          .map((key) => `${key}=${request.query[key]}`)
          .join('&')}`
    const path = this.request.path.replace(/\/$/, '')
    if (typeof window === 'undefined') {
      (global as any).window = {};
    }
    const autoMock: MockStore = (window as any).cdcAutoMock
    if (autoMock) {
      const url = `${[path]
        .concat(Object.values(request.path))
        .join('/')}${queryParamsValue}`
      const result = await autoMock.getResponse(this.method, url)
      if (!result) throw "Mock result not found"
      return result
    } else {
      const fetchFunc = request.fetchFunc || createDefaultFetch(fetch, "")
      return await fetchFunc(
        this.method,
        `${[path]
          .concat(Object.values(request.path))
          .join('/')}${queryParamsValue}`,
        {...this.request.headers, ...request.header},
        request.body
      )
    }
  }

  public GetMockResponse(key: string) {
    return key
      ? this.responseExamples[key]
      : Object.values(this.responseExamples)[0]
  }

  public GetResponseKeys() {
    return Object.keys(this.responseExamples)
  }

  public get Method() {
    return this.method
  }

  public get Description() {
    return this.description
  }

  public get Request() {
    return this.request
  }

  public get RequestBody() {
    return this.requestBody
  }

  public MatchesUrl(url: string) {
    if (!url.startsWith(this.request.path)) return false
    const pathUrlSplit = url
      .replace(this.request.path, '')
      .split('?')[0]
      .split('/')
      .filter((d) => d.trim().length > 0)
    const params = Object.keys(this.request.params.path)
    if (pathUrlSplit.length !== params.length) return false
    const urlQuery = url.split('?')[1]
    if (urlQuery) {
      const urlQueryParams = urlQuery.split('&').map((q) => q.split('='))
      const queryParams = Object.keys(this.request.params.query)
      if (urlQueryParams.length !== queryParams.length) return false
      for (const uqp of urlQueryParams) {
        if (!queryParams.some((qp) => qp === uqp[0])) return false
      }
    }
    return true
  }
}

export class GetContract<TResponseBody,
  THeaderParams extends Params = {},
  TPathParams extends Params = {},
  TQueryParams extends Params = {},
  > extends Contract<TPathParams,
  TQueryParams,
  THeaderParams,
  TResponseBody,
  undefined> {
  constructor(
    description: string,
    request: Request<TPathParams, TQueryParams, THeaderParams>,
    responseExamples: { [index: string]: ResponseExample<TResponseBody> }
  ) {
    super(description, 'GET', request, undefined, responseExamples)
  }
}

export class DeleteContract<TPathParams extends Params,
  TQueryParams extends Params,
  THeaderParams extends Params,
  TResponseBody> extends Contract<TPathParams,
  TQueryParams,
  THeaderParams,
  TResponseBody,
  undefined> {
  constructor(
    description: string,
    request: Request<TPathParams, TQueryParams, THeaderParams>,
    responseExamples: { [index: string]: ResponseExample<TResponseBody> }
  ) {
    super(description, 'DELETE', request, undefined, responseExamples)
  }
}

export class PostContract<TPathParams extends Params,
  TQueryParams extends Params,
  THeaderParams extends Params,
  TResponseBody,
  TRequestBody> extends Contract<TPathParams,
  TQueryParams,
  THeaderParams,
  TResponseBody,
  TRequestBody> {
  constructor(
    description: string,
    request: Request<TPathParams, TQueryParams, THeaderParams>,
    requestBody: TRequestBody,
    responseExamples: { [index: string]: ResponseExample<TResponseBody> }
  ) {
    super(description, 'POST', request, requestBody, responseExamples)
  }
}

export class PutContract<TPathParams extends Params,
  TQueryParams extends Params,
  THeaderParams extends Params,
  TResponseBody,
  TRequestBody> extends Contract<TPathParams,
  TQueryParams,
  THeaderParams,
  TResponseBody,
  TRequestBody> {
  constructor(
    description: string,
    request: Request<TPathParams, TQueryParams, THeaderParams>,
    requestBody: TRequestBody,
    responseExamples: { [index: string]: ResponseExample<TResponseBody> }
  ) {
    super(description, 'PUT', request, requestBody, responseExamples)
  }
}

export const serializeContracts = (contracts: {
  [index: string]: Contract<any, any, any, any, any>
}) => {
  const obj = JSON.parse(JSON.stringify(contracts))
  Object.values(obj).forEach((contract: any) => {
    Object.entries(contract.responseExamples).forEach(([key, value]: any[]) => {
      if (contract.responseExamples[key].transitions) delete contract.responseExamples[key].transitions
      if (value.ignore) delete contract.responseExamples[key]
    })
  })
  return JSON.stringify(obj, null, 2)
}
export type ResponseCollection<T> = {
  [index: string]: ResponseExample<T>
}

export type ContractCollection = {
  [index: string]: Contract<any, any, any, any, any>
}

export type MockStoreOptions = { holdTimer?: number, callback?: (state: Dict<string>) => void }
export const autoMock = (contracts: ContractCollection, options?: MockStoreOptions) => {
  if (typeof window === 'undefined') {
    (global as any).window = {};
  }
  return (window as any).cdcAutoMock =
    createMockStore(contracts, options)
}

export type MockStore = ReturnType<typeof createMockStore>
export const createMockStore = (contracts: ContractCollection, options?: MockStoreOptions) => {
  const selectedResponses: { [index: string]: string } = {}
  const semaphores: { [index: string]: ((s: string) => void)[] } = {}
  const reset = () => {
    Object.keys(selectedResponses).forEach(key => delete selectedResponses[key])
    if (options?.callback) options.callback(selectedResponses)
  }
  const objectToArray = <T>(obj: { [index: string]: T } | undefined) => {
    if (!obj) return []
    return Object.keys(obj).map((key) => ({
      key,
      value: obj[key],
    }))
  }
  const getResponse = async (method: Method, url: string) => {
    const arrayOfContracts = objectToArray(contracts)
    const filteredContractsByMethod = arrayOfContracts.filter(
      (d) => d.value.Method === method
    )
    const contract = filteredContractsByMethod.find((c) =>
      c.value.MatchesUrl(url)
    )
    if (!contract) return undefined
    const response = contract.value.GetMockResponse(
      selectedResponses[contract.key]
    )
    if (response.hold) {
      if (options?.holdTimer)
        await new Promise((resolve) => setTimeout(() => resolve(""), options.holdTimer))
      else
        await new Promise(resolve => {
          semaphores[contract.key] = [...semaphores[contract.key] || [], resolve]
        })
    }
    objectToArray(response?.transitions).forEach(
      (transition) => setResponse(transition.key, transition.value)
    )
    return response
  }
  const setResponse = (contractKey: string, responseKey: string) => {
    selectedResponses[contractKey] = responseKey
    if (options?.callback) options.callback(selectedResponses)
  }
  const release = (contractKey: string) => {
    const semaphoreArray = semaphores[contractKey]
    if (semaphoreArray) {
      semaphoreArray[0]("")
      semaphoreArray.splice(0, 1)
    }
  }
  const getState = () => Object.entries(contracts).reduce((acc, cur) => {
    if (selectedResponses[cur[0]]) acc[cur[0]] = selectedResponses[cur[0]]
    else acc[cur[0]] = cur[1].GetResponseKeys()[0]
    return acc
  }, {} as Dict<string>)
  const setState = (states: { [i: string]: string }) => Object.entries(states).forEach(([key, value]) => {
    selectedResponses[key] = value
  })
  return {getResponse, setResponse, reset, release, getState, setState}
}

export const defaultParams = {
  path: {},
  query: {},
  header: {}
}
