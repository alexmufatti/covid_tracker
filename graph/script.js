import Chart from 'chart.js';
import axios from "axios";
import moment from "moment";

var myChart = null;

function getData(response, t, country, name, province) {
    return response.data[t].locations.find( l => l.country_code === country && l.province === province).history;
}

function getCountryData(response, country, name, province) {
    return getData(response, 'confirmed', country, name, province)
}

function createSeries(response, countryCode, offset, name, province) {
    if (!offset) offset = 0;
    let check = true;
    let hasValue = false;
    var values = getCountryData(response, countryCode, name, province);
    var data = [];

    let i = 0;
    while (data.length < Object.keys(values).length) {
        let date = moment().subtract(i, 'days').format("M/D/YY");
        let p = values[date];
            data.push(p);

        i++;
    }
    let j = 0;
    while ( !data[j]) {data.shift();}
    data.reverse();
    for (let j = 0; j < offset; j++) {
        data.shift();
    }

    return data;
}

function createChart(response) {
    var ctx = document.getElementById('myChart');
    var gapES = document.getElementById('ES').value;
    var gapDE = document.getElementById('DE').value;
    var gapFR = document.getElementById('FR').value;
    var gapKO = document.getElementById('KO').value;
    var gapJP = document.getElementById('JP').value;
    var gapCH = document.getElementById('CH').value;

    const dataES = createSeries(response, 'ES',+gapES,'','');
    const dataIT = createSeries(response, 'IT', 0, '', '');
    const dataCH = createSeries(response, 'CH', +gapCH, '', '');
    const dataFR = createSeries(response, 'FR', +gapFR, '', '');
    const dataDE = createSeries(response, 'DE', +gapDE, '', '');
    const dataKO = createSeries(response, 'KR', +gapKO, '', '');
    const dataJP = createSeries(response, 'JP', +gapJP, '', '');
    const x = dataIT.map((d, i) => i);

    if (!myChart) {
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: x,
                datasets: [{
                    label: 'IT',
                    data: dataIT,
                    borderWidth: 1,
                    fill: false,
                    borderColor: 'green'
                }, {
                    label: 'CH',
                    data: dataCH,
                    borderWidth: 1,
                    fill: false,
                    borderColor: 'red'
                }, {
                    label: 'FR',
                    data: dataFR,
                    borderWidth: 1,
                    fill: false,
                    borderColor: 'blue'
                }, {
                    label: 'DE',
                    data: dataDE,
                    borderWidth: 1,
                    fill: false,
                    borderColor: 'black',
                    spanGaps: false
                },
                    {
                        label: 'KO',
                        data: dataKO,
                        borderWidth: 1,
                        fill: false,
                        borderColor: 'purple',
                        spanGaps: false
                    },
                    {
                        label: 'JP',
                        data: dataJP,
                        borderWidth: 1,
                        fill: false,
                        borderColor: 'yellow',
                        spanGaps: false
                    },
                    {
                        label: 'ES',
                        data: dataES,
                        borderWidth: 1,
                        fill: false,
                        borderColor: 'gray',
                        spanGaps: false
                    }]
            },
            options: {
                responsive: false,
                animation: {
                    duration: 0
                },
                title: {
                    display: true,
                    text: 'Covid-19 confirmed cases'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true
                    }],
                    yAxes: [{
                        type: 'logarithmic',
                        display: true,
                        ticks: {
                            min: 0,
                            callback: function (value, index, values) {
                                return value;
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Y Axis'
                        }
                    }]
                }
            }
        });
    } else {
        myChart.data.datasets = [{
            label: 'IT',
            data: dataIT,
            borderWidth: 1,
            fill: false,
            borderColor: 'green'
        }, {
            label: 'CH',
            data: dataCH,
            borderWidth: 1,
            fill: false,
            borderColor: 'red'
        }, {
            label: 'FR',
            data: dataFR,
            borderWidth: 1,
            fill: false,
            borderColor: 'blue'
        }, {
            label: 'DE',
            data: dataDE,
            borderWidth: 1,
            fill: false,
            borderColor: 'black',
            spanGaps: false
        },
            {
                label: 'KO',
                data: dataKO,
                borderWidth: 1,
                fill: false,
                borderColor: 'purple',
                spanGaps: false
            },
            {
                label: 'JP',
                data: dataJP,
                borderWidth: 1,
                fill: false,
                borderColor: 'yellow',
                spanGaps: false
            },
            {
                label: 'ES',
                data: dataES,
                borderWidth: 1,
                fill: false,
                borderColor: 'gray',
                spanGaps: false
            }];

        myChart.update();
    }
}

function draw() {
    axios.get('https://coronavirus-tracker-api.herokuapp.com/all')
        .then(response => {
            createChart(response);
        });
}

document.getElementById('btn').addEventListener('click', draw);
draw();
