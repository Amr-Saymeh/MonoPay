import { get, ref, set } from 'firebase/database';
import { db } from '../../../../src/firebaseConfig';
import { denormalizeCurrency, normalizeCurrency } from '../utils/currency';

type RawCurrencyRecord = Record<string, number | string | null | undefined>;

type CurrencyMap = Record<string, number>;

export interface ExchangeParams {
  selectedWalletId: number;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  fromBalance: number;
  rate: number | null;
}

export interface ExchangeResult {
  success: boolean;
  error?: string;
}

function normalizeRecord(raw: RawCurrencyRecord): CurrencyMap {
  return Object.entries(raw).reduce<CurrencyMap>((acc, [code, value]) => {
    const normalizedCode = denormalizeCurrency(code.trim().toUpperCase());
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return acc;
    }

    acc[normalizedCode] = Number((acc[normalizedCode] ?? 0) + amount);
    return acc;
  }, {});
}

function validateAmount(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Enter a valid amount';
  }
  return null;
}

export async function exchangeWalletCurrencies({
  selectedWalletId,
  fromCurrency,
  toCurrency,
  amount,
  fromBalance,
  rate,
}: ExchangeParams): Promise<ExchangeResult> {
  const amountValidation = validateAmount(amount);
  if (amountValidation) {
    return { success: false, error: amountValidation };
  }

  const normalizedFrom = normalizeCurrency(fromCurrency);
  const normalizedTo = normalizeCurrency(toCurrency);

  if (normalizedFrom === normalizedTo) {
    return { success: false, error: 'Choose two different currencies' };
  }

  if (!rate || !Number.isFinite(rate)) {
    return { success: false, error: 'Exchange rate unavailable' };
  }

  if (amount > fromBalance) {
    return { success: false, error: 'Insufficient balance' };
  }

  const walletRef = ref(db, `wallets/wallet${selectedWalletId}/currancies`);
  const snapshot = await get(walletRef);
  const rawData = (snapshot.val() ?? {}) as RawCurrencyRecord;
  const balances = normalizeRecord(rawData);

  const fromKey = denormalizeCurrency(normalizedFrom);
  const toKey = denormalizeCurrency(normalizedTo);
  const convertedAmount = Number((amount * rate).toFixed(2));

  balances[fromKey] = Number((Number(balances[fromKey] ?? fromBalance) - amount).toFixed(2));
  balances[toKey] = Number((Number(balances[toKey] ?? 0) + convertedAmount).toFixed(2));

  await set(walletRef, balances);

  return { success: true };
}
