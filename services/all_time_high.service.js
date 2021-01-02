const _ = require('lodash');
const CoinGecko = require('coingecko-api');

class AllTimeHighService {
    constructor({localCache}) {
        this.localCache = localCache;
        this.api = new CoinGecko();
    }

    async fetchATHPrice(coinId, params={}) {
        // just default to usd for now, can be configurable later.
        const resp = await this.api.coins.fetch(coinId, params);
        const coin = resp.data; //TODO check for non 2XX status before.
        return _.get(coin, 'market_data.ath.usd');
    }

    /*The methods below should interface with an ATHObject:
    {
        ath: Number,
        lastUpdated: datetime,
        alertedAth: Number,
        lastAlerted: datetime
    }
    */
    getStoredATH(coinId) {
        return this.localCache.get('ATH', coinId);
    }

    storeATH(coinId, athObj) {
        this.localCache.put('ATH', coinId, athObj);
    }
}

module.exports = AllTimeHighService