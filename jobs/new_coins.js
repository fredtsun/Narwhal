const _ = require('lodash');

class NewCoinsJob {
    jobType = 'TimeInterval';
    timeInterval = 10000;

    constructor({discordClient, coinsService}) {
        this.discordClient = discordClient;
        this.coinsService = coinsService;
    }

    async init(){}
    
    async run() {
        const newCoins = await this.coinsService.fetchNewCoins();        
        _.forEach(newCoins, (coin) => {
            this.discordClient.sendMessage(
                'New coin listed on CoinGecko: **' + coin.name + "** \nhttps://www.coingecko.com/en/search_redirect?id="+coin.id+"&type=coin");
        });
        this.coinsService.store(newCoins);
    }
}

module.exports = NewCoinsJob