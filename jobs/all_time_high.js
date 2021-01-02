const _ = require('lodash');
const moment = require('moment');

class AllTimeHighJob {
    jobType = 'TimeInterval';
    timeInterval = 10000;

    coins = {
        bitcoin: {
            priceThreshold: 1000,
            cooldown: {
                unit: 'days',
                delta: 1
            }
        },
        ethereum: {
            priceThreshold: 100,
            cooldown: {
                unit: 'days',
                delta: 1
            }
        }
    };

    constructor({discordClient, allTimeHighService, coinsService}){
        this.discordClient = discordClient;
        this.athService = allTimeHighService;
        this.coinsService = coinsService;
    }

    async init() {
        _.keys(this.coins).forEach(async (coinId) => {
            const price = await this.athService.fetchATHPrice(coinId);
            this.athService.storeATH(coinId, {
                ath: price,
                lastUpdated: moment.utc(),
                alertedAth: price,
                lastAlerted:  moment.utc()
            });
        });
    }

    async run() {
        _.keys(this.coins).forEach(async (coinId) => {
            const lastATH = this.athService.getStoredATH(coinId);
            const price = await this.athService.fetchATHPrice(coinId);
            const now = moment.utc().format();
            if (this.meetsThreshold(coinId, price, lastATH)) {
                this.sendATHMessage(coinId, price);
                this.athService.storeATH(coinId, {
                    ath: price,
                    lastUpdated: now,
                    alertedAth: price,
                    lastAlerted: now
                })
            } else {
                this.athService.storeATH(coinId, {
                    ath: price,
                    lastUpdated: now,
                    alertedAth: lastATH.alertedAth,
                    lastAlerted: lastATH.lastAlerted
                })
            }
        });
    }

    sendATHMessage(coinId, price) {
        // todo, this needs to be via wrapped discordclient service later.
        // something like this.discordClient.messageSubsribedChannels(...);
        const coinName = _.get(this.coinsService.get(coinId), 'name', coinId);
        this.discordClient.channels.cache.get('793330715306885123').send(
            `NEW :clap: ALL :clap: TIME :clap: HIGH :clap: ALERT:\n **${coinName}** has reached a high of **$${price}**!!!`
        );
    }

    meetsThreshold(coinId, currAth, storedATHObj) {
        const lastAlerted = moment.utc(storedATHObj.lastAlerted);
        const cooldownThreshold = _.get(this.coins, `${coinId}.cooldown.delta`);
        const cooldownUnit = _.get(this.coins, `${coinId}.cooldown.unit`)
        const now = moment.utc();
        if (currAth > storedATHObj.ath && now.diff(lastAlerted, cooldownUnit) >= cooldownThreshold) {
            return true;
        }
        const priceThreshold = _.get(this.coins, `${coinId}.priceThreshold`);
        return currAth >= storedATHObj.alertedAth + priceThreshold;
    }
}

module.exports = AllTimeHighJob;