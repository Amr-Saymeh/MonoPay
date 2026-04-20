const API_BASE_URL = 'https://open.er-api.com/v6';

const STATIC_CURRENCY_NAMES: { [key: string]: string } = {
  USD: 'US Dollar',
  EUR: 'Euro',
  ILS: 'New Israeli Shekel',
  JOD: 'Jordanian Dinar',
  EGP: 'Egyptian Pound',
};

// Map internal currency codes to external API codes
const CURRENCY_TO_API_CODE: { [key: string]: string } = {
  NIS: 'ILS',
};

// Map external API codes back to internal currency codes
const API_CODE_TO_CURRENCY: { [key: string]: string } = {
  ILS: 'NIS',
};

function toApiCurrencyCode(code: string): string {
  return CURRENCY_TO_API_CODE[code.toUpperCase()] || code.toUpperCase();
}

function fromApiCurrencyCode(code: string): string {
  return API_CODE_TO_CURRENCY[code.toUpperCase()] || code.toUpperCase();
}

export async function getCurrencies() {

  return STATIC_CURRENCY_NAMES;
}

export async function getLatestRates(baseCurrency: string) {
  try {
       // Convert internal code to API code (e.g., NIS -> ILS)
       const apiBaseCurrency = toApiCurrencyCode(baseCurrency);

       const response = await fetch(`${API_BASE_URL}/latest/${apiBaseCurrency}`);
   

    if (!response.ok) {
      throw new Error('Failed to fetch latest rates');
    }
    const data = await response.json();

    // Convert API currency codes back to internal codes (e.g., ILS -> NIS)
    if (data?.rates) {
      const convertedRates: { [key: string]: number } = {};
      for (const [code, rate] of Object.entries(data.rates)) {
        const internalCode = fromApiCurrencyCode(code);
        convertedRates[internalCode] = rate as number;
      }
      data.rates = convertedRates;
    }

    return data;
  } catch (error) {
    console.error('Error fetching rates data: ', error);
    return null;
  }
}