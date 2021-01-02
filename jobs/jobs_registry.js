const jobs = [
    require('./all_time_high'),
    require('./new_coins')
];

module.exports = {
    getAll: () => jobs
}