import { describe,expect, test,vi } from "vitest"
import type { Request } from "express"
import { convertAmount } from "../controllers/currencyController"
import * as currencyService from "../services/currencyService"

vi.mock('../services/currencyService')

const createMockResponse = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn()
  return res
}

describe('CurrencyController.convertAmount',() => {
  test('Return conversion with valid request', async () => {
    const req = { body: { from:'EUR',to: 'SEK',amount: 10}} as Request
    const res = createMockResponse()
    const payload = { amount: 9}
    vi.mocked(currencyService.convert).mockResolvedValue(payload)

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ amount: 9 })
    expect(currencyService.convert).toHaveBeenCalledWith('EUR','SEK',10)
  })

  test('Return 500 when service throws an error', async () => {
    const req = { body: { from:'EUR',to: 'SEK',amount: 10}} as Request
    const res = createMockResponse()
    vi.mocked(currencyService.convert).mockRejectedValue(
      new Error('Error retrieving exchange rate.'))

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving exchange rate.' })
  })

  test('Return 400 for invalid currency code', async () => {
    const req = { body: { from:'EU',to: 'SEK',amount: 10}} as Request
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      { error:
        'Currency codes must be 3-letter ISO abbreviations (e.g., USD, EUR).'
      }
    )
  })

  test('Return 400 when "from" is missing', async () => {
    const req: any = { body: { to: 'SEK',amount: 10}}
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      { error: 'Body parameters "from" and "to" are required.' }
    )
  })

  test('Return 400 when "to" is not a string', async () => {
    const req: any = { body: { from:'EUR',to: 123,amount: 10}}
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      { error: 'Body parameters "from" and "to" are required.' }
    )
  })

  test('Return 400 when currency code contains digits', async () => {
    const req: any = { body: { from:'EUR',to: 'S3K',amount: 10}}
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      { error:
        'Currency codes must be 3-letter ISO abbreviations (e.g., USD, EUR).'
      }
    )
  })

  test('Return 400 when amount is not a number', async () => {
    const req: any = { body: { from:'EUR',to: 'SEK',amount: 'abc'}}
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Amount must be a valid number.' })
  })

  test('Return 400 when amount is zero', async () => {
    const req: any = { body: { from:'EUR',to: 'SEK',amount: 0}}
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Amount must be greater than zero.' })
  })

  test('Return 400 when amount is negative', async () => {
    const req: any = { body: { from:'EUR',to: 'SEK',amount: -5}}
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Amount must be greater than zero.' })
  })

  test('Return 500 when request body is missing', async () => {
    const req: any = {}
    const res = createMockResponse()

    await convertAmount(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) })
  })
})
