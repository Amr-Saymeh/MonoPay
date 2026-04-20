import { getLatestRates } from './Currency';


export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const from = fromCurrency.trim().toUpperCase();
  const to = toCurrency.trim().toUpperCase();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  if (from === to) {
    return amount;
  }

  const latest = await getLatestRates(from);
  if (!latest || !latest.rates || typeof latest.rates[to] !== 'number') {
    throw new Error(`Missing rate to convert from ${from} to ${to}`);
  }

  const rate = latest.rates[to] as number;
  return amount * rate;
}

