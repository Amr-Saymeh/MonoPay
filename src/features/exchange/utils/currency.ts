export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'NIS', 'JOD', 'EGP'];

export const CURRENCY_NAMES: { [key: string]: string } = {
  USD: 'US Dollar',
  EUR: 'Euro',
  NIS: 'Israeli Shekel',
  JOD: 'Jordanian Dinar',
  EGP: 'Egyptian Pound',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
};

export function normalizeCurrency(code: string): string {
  
  const upper = code.trim().toUpperCase();


  return upper;
}

export function denormalizeCurrency(code: string): string {

  return code.trim().toUpperCase();
}

export function getAvailableToCurrencies(fromCurrency: string): string[] {
  return SUPPORTED_CURRENCIES.filter(
    (c) => normalizeCurrency(c) !== normalizeCurrency(fromCurrency)
  );
}
