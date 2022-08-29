export type Contract = {
  request: {
    basePath: string
    pathParams?: { [i: string]: string }
    queryParams?: { [i: string]: string }
    headerParams?: { [i: string]: string }
    headers?: { [i: string]: string }
  } & (PostRequest | GetRequest | PutRequest | DeleteRequest)
}

type PostRequest = {
  method: "POST",
  bodyExample: any
}

type GetRequest = {
  method: "GET",
}

type PutRequest = {
  method: "PUT",
  bodyExample: any
}

type DeleteRequest = {
  method: "DELETE",
}

const demo: Contract = {
  request: {
    method: "POST",
    basePath: "/",
    bodyExample: {}
  }
}