import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getSupplyDemand(suburb: string, state: string) {
  try {
    const url = `https://www.htag.com.au/suburb/${state.toLowerCase()}/${suburb.toLowerCase().replace(/\s+/g, '-')}`;
    console.log('[htag] Requesting URL:', url);
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const daysOnMarket = parseInt($('[data-days-on-market]').text()) || null;
    const stockOnMarket = parseInt($('[data-stock]').text()) || null;
    const demandSignal = daysOnMarket
      ? daysOnMarket < 30 ? 'undersupplied'
      : daysOnMarket < 60 ? 'balanced'
      : 'oversupplied'
      : null;
    console.log('[htag] Completed:', { daysOnMarket, stockOnMarket, demandSignal });
    return { daysOnMarket, stockOnMarket, demandSignal };
  } catch (e) {
    console.log('[htag] Failed, returning defaults');
    return { daysOnMarket: null, stockOnMarket: null, demandSignal: null };
  }
}
