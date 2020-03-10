const axios = require('axios');
const moment = require('moment');

axios.get('https://coronavirus-tracker-api.herokuapp.com/all')
    .then(response => {

        let data = [ {
            country: 'WW',
            confirmed: response.data.latest.confirmed,
            deaths: response.data.latest.deaths,
            recovered: response.data.latest.recovered
        },
            getCountryData(response, 'IT'),
            getCountryData(response, 'CH'),
            getCountryData(response, 'DE'),
            getCountryData(response, 'FR'),
            getCountryData(response, 'US')
                ];

        console.table(data);
    })
    .catch(error => {
        console.log(error);
    });

function getData(response, t, country) {
    return response.data[t].locations.find( l => l.country_code === country).latest;
}

function getCountryName(response, country) {
    return response.data['recovered'].locations.find( l => l.country_code === country).country;
}

function getIncrease(response, t, country) {
    const d = response.data[t].locations.find( l => l.country_code === country);
    const latest = d.latest;

    // let date = moment().subtract(2, 'days').format("M/D/YY");
    // let previous = d.history[date];

    const previous = d.history[Object.keys(d.history)[Object.keys(d.history).length - 2]]

    return +((latest - previous) * 100 / latest).toFixed(2);
}

function getCountryData(response, country) {
    return { country: getCountryName(response, country),
        confirmed: getData(response, 'confirmed', country),
        deaths: getData(response, 'deaths', country),
        recovered: getData(response, 'recovered', country),
        increase_confirmed: getIncrease(response, 'confirmed', country),
        increase_deaths: getIncrease(response, 'deaths', country),
        increase_recovered: getIncrease(response, 'recovered', country)
    }
}
