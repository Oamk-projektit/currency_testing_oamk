import { calculateConversion } from '../utils/convert'

const FRANKFURTER_API = process.env.FRANKFURTER_API ||
  'https://api.frankfurter.app/latest'

export const convert = async (from: string, to: string, amount: number) => {
  try {
    const { rate } = await fetchRate(from,to)
    const result = calculateConversion(amount,rate)
    return { amount: result }
  } catch (error) {
    throw Error(
      error instanceof Error ? error.message : 'Error calculating conversion.')
  }
}

const fetchRate = async(from: string, to:string) => {
  const response = await fetch(`${FRANKFURTER_API}?from=${from}&to=${to}`);

  if (!response.ok) {
    throw new Error('Error retrieving exchange rate.')
  }

  const data = await response.json()
  const rate = data.rates?.[to] // Use to parameter to get required rate.

  if (typeof rate !== 'number') throw Error("Exchange rate is not a number.")

  return { rate: rate}
}
