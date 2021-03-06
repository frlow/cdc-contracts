import {
  autoMock,
  Contract,
  createMockStore, defaultParams,
  DeleteContract,
  GetContract,
  PostContract,
  PutContract,
  serializeContracts,
} from './index'
import * as path from 'path'

describe('Contract', () => {
  beforeEach(() => {
    (global as any).window = {};
  })

  test('Get', () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {}, header: {}, query: {}},
      },
      {
        success: {
          body: {name: 'myName'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const accessor = jest.fn()
    getContract.Fetch({
      fetchFunc: accessor,
      path: {p: 'path'},
      header: {h: 'header'},
      query: {q: 'query'},
      body: undefined
    })
    expect(accessor).toHaveBeenCalledWith(
      'GET',
      '/api/test/path?q=query',
      {h: 'header'},
      undefined
    )
  })

  test('Delete', () => {
    const getContract = new DeleteContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {}, header: {}, query: {}},
      },
      {
        success: {
          body: {name: 'myName'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const accessor = jest.fn()
    getContract.Fetch({
      fetchFunc: accessor,
      path: {p: 'path'},
      header: {h: 'header'},
      query: {q: 'query'},
      body: undefined
    })
    expect(accessor).toHaveBeenCalledWith(
      'DELETE',
      '/api/test/path?q=query',
      {h: 'header'},
      undefined
    )
  })

  test('Post', () => {
    const getContract = new PostContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {}, header: {}, query: {}},
      },
      {id: 'someId'},
      {
        success: {
          body: {name: 'myName'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const accessor = jest.fn()
    getContract.Fetch({
      fetchFunc: accessor,
      path: {p: 'path'},
      header: {h: 'header'},
      query: {q: 'query'},
      body: {id: 'myId'}
    })
    expect(accessor).toHaveBeenCalledWith(
      'POST',
      '/api/test/path?q=query',
      {h: 'header'},
      {id: 'myId'}
    )
  })

  test('Put', () => {
    const getContract = new PutContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {}, header: {}, query: {}},
      },
      {id: 'someId'},
      {
        success: {
          body: {name: 'myName'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const accessor = jest.fn()
    getContract.Fetch({
        fetchFunc: accessor,
        path: {p: 'path'},
        header: {h: 'header'},
        query: {q: 'query'},
        body: {id: 'myId'}
      }
    )
    expect(accessor).toHaveBeenCalledWith(
      'PUT',
      '/api/test/path?q=query',
      {h: 'header'},
      {id: 'myId'}
    )
  })

  test('Get mock response', () => {
    const response = {
      body: {name: 'myName'},
      status: 200,
      headers: {'content-type': 'application/json'},
    }
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {}, header: {}, query: {}},
      },
      {
        success: response,
      }
    )
    const mockResponse = getContract.GetMockResponse('success')
    expect(mockResponse).toStrictEqual(response)
  })

  test('Mock store', async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {}, header: {}, query: {}},
      },
      {
        success: {
          body: {name: 'myName'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const store = createMockStore({getContract})
    const response = await store.getResponse('GET', '/api/test')
    expect(response?.body).toStrictEqual({name: 'myName'})
    expect(response?.status).toEqual(200)
  })

  test('Mock store with transition', async () => {
    const firstContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/first',
        params: {path: {}, header: {}, query: {}},
      },
      {
        withTransition: {
          body: {name: 'A'},
          status: 200,
          headers: {'content-type': 'application/json'},
          transitions: {
            otherContract: 'responseB',
          },
        },
      }
    )
    const otherContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/other',
        params: {path: {}, header: {}, query: {}},
      },
      {
        responseA: {
          body: {name: 'A'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
        responseB: {
          body: {name: 'B'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const store = createMockStore({firstContract, otherContract})
    const response1 = await store.getResponse('GET', '/api/other')
    expect(response1?.body).toStrictEqual({name: 'A'})
    await store.getResponse('GET', '/api/first')
    const response2 = await store.getResponse('GET', '/api/other')
    expect(response2?.body).toStrictEqual({name: 'B'})
  })

  test('Mock store, path params', async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {id: 'id'}, header: {}, query: {}},
      },
      {
        success: {
          body: {name: 'myName'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const store = createMockStore({getContract})
    const response = await store.getResponse('GET', '/api/test/someId')
    expect(response?.body).toStrictEqual({name: 'myName'})
    expect(response?.status).toEqual(200)
    const wrongResponse = await store.getResponse('GET', '/api/test/someId/error')
    expect(wrongResponse).toBeUndefined()
  })

  test('Mock store, query params', async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {}, header: {}, query: {s: 'search', lang: 'en'}},
      },
      {
        success: {
          body: {name: 'myName'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const store = createMockStore({getContract})
    const response1 = await store.getResponse('GET', '/api/test?s=something&lang=en')
    expect(response1?.body).toStrictEqual({name: 'myName'})
    expect(response1?.status).toEqual(200)
    const response2 = await store.getResponse('GET', '/api/test?lang=en&s=something')
    expect(response2?.body).toStrictEqual({name: 'myName'})
    const response3 = await store.getResponse('GET', '/api/test?lang=en&sa=something')
    expect(response3?.body).toBeUndefined()
    const response4 = await store.getResponse('GET', '/api/test?lang=en')
    expect(response4?.body).toBeUndefined()
  })

  test('serialize', () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {}, header: {}, query: {s: 'search', lang: 'en'}},
      },
      {
        success: {
          body: {name: 'myName'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const serialized = serializeContracts({getContract})
    expect(serialized).not.toBeUndefined()
  })

  test("Set response", async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/other',
        params: {path: {}, header: {}, query: {}},
      },
      {
        responseA: {
          body: {name: 'A'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
        responseB: {
          body: {name: 'B'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const store = createMockStore({getContract})
    const response1 = await store.getResponse('GET', '/api/other')
    expect(response1?.body).toStrictEqual({name: 'A'})
    store.setResponse('getContract', 'responseB')
    const response2 = await store.getResponse('GET', '/api/other')
    expect(response2?.body).toStrictEqual({name: 'B'})
  })

  test("Reset store", async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/other',
        params: {path: {}, header: {}, query: {}},
      },
      {
        responseA: {
          body: {name: 'A'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
        responseB: {
          body: {name: 'B'},
          status: 200,
          headers: {'content-type': 'application/json'},
        },
      }
    )
    const store = createMockStore({getContract})
    const response1 = await store.getResponse('GET', '/api/other')
    expect(response1?.body).toStrictEqual({name: 'A'})
    store.setResponse('getContract', 'responseB')
    const response2 = await store.getResponse('GET', '/api/other')
    expect(response2?.body).toStrictEqual({name: 'B'})
    store.reset()
    const response3 = await store.getResponse('GET', '/api/other')
    expect(response3?.body).toStrictEqual({name: 'A'})
  })

  test('Hold and release', async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/hold',
        params: {path: {}, header: {}, query: {}},
      },
      {
        response: {
          body: {name: 'A'},
          status: 200,
          headers: {'content-type': 'application/json'},
          hold: true
        }
      }
    )
    const store = createMockStore({getContract})
    let value = false
    store.getResponse('GET', '/api/hold').then(() => value = true)
    await new Promise(r => setTimeout(() => r(""), 1))
    expect(value).toEqual(false)
    store.release("getContract")
    await new Promise(r => setTimeout(() => r(""), 1))
    expect(value).toEqual(true)
  })

  test("Automatic mocking", async () => {
    const example = {
      body: {name: 'myName'},
      status: 200,
      headers: {'content-type': 'application/json'},
    }
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: {path: {}, header: {}, query: {}},
      },
      {
        success: example,
      }
    )
    const contracts = {getContract}
    autoMock(contracts)
    const result = await getContract.Fetch({
      fetchFunc: jest.fn(),
      path: {},
      header: {},
      query: {},
      body: undefined
    })
    expect(result).toEqual(example)
  })
  test("Hold and release with timer", async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/hold',
        params: {path: {}, header: {}, query: {}},
      },
      {
        response: {
          body: {name: 'A'},
          status: 200,
          headers: {'content-type': 'application/json'},
          hold: true
        }
      }
    )
    const contracts = {getContract}
    autoMock(contracts, {holdTimer: 25})
    const before = new Date().getTime()
    await getContract.Fetch({
      fetchFunc: jest.fn(),
      path: {},
      header: {},
      query: {},
      body: undefined
    })
    const after = new Date().getTime()
    expect(after - before).toBeGreaterThan(20)
  })

  test('Get mock store state', async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: defaultParams,
      },
      {
        success: {
          status: 200,
        },
      }
    )
    const errorContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: defaultParams,
      },
      {
        success: {
          status: 200,
        },
        error: {status: 500}
      }
    )
    const store = createMockStore({getContract, errorContract})
    store.setResponse("errorContract", "error")
    const state = store.getState()
    expect(state).toEqual({"getContract": "success", "errorContract": "error"})
  })

  test('Set mock store state', async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: defaultParams,
      },
      {
        success: {
          status: 200,
        },
        error: {
          status: 500
        }
      }
    )
    const store = autoMock({getContract})
    const resultSuccess = await getContract.Fetch({...defaultParams, body: undefined})
    expect(resultSuccess.status).toEqual(200)
    store.setState({getContract: "error"})
    const resultError = await getContract.Fetch({...defaultParams, body: undefined})
    expect(resultError.status).toEqual(500)
  })

  test('Change callback', async () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/api/test',
        params: defaultParams,
      },
      {
        success: {
          status: 200,
        },
        error: {
          status: 500
        }
      }
    )
    const callback = jest.fn()
    const store = autoMock({getContract}, {callback})
    store.setResponse("getContract", "error")
    expect(callback).toHaveBeenCalledWith({getContract: "error"})
  })

  test('serialize - ignore', () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/ignored',
        params: defaultParams
      },
      {
        ignored: {
          status: 200,
          ignore: true
        },
      }
    )
    const serialized = serializeContracts({getContract})
    const parsed = JSON.parse(serialized)
    expect(parsed.getContract.responseExamples).toEqual({})
  })

  test('serialization should remove transitions', () => {
    const getContract = new GetContract(
      'Description',
      {
        headers: {},
        path: '/ignored',
        params: defaultParams
      },
      {
        success: {
          status: 200,
          transitions: {
            from: "to"
          }
        },
      }
    )
    const serialized = serializeContracts({getContract})
    const parsed = JSON.parse(serialized)
    expect(parsed.getContract.responseExamples).toEqual({
      success: {
        status: 200
      },
    })
  })
})
