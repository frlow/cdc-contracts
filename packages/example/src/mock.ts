import { contracts } from './contracts'
import * as express from 'express'
import { Request, Response } from 'express'
import { createMockStore } from 'cdc-contracts'

const app = express()
const mockStore = createMockStore(contracts)

// Fångar alla anrop
app.use('/', async (req: Request, res: Response) => {

  // Kollar om metoden finns i mock-store
  const result = await mockStore.getResponse(req.method as any, req.url)
  res.status(result?.status || 500)
  res.send(result?.body)
})
const port = 3100
console.log(`Mock server running on port ${port}`)
app.listen(port)
