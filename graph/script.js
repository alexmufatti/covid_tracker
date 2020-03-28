import Chart from 'chart.js';
import axios from "axios";
import moment from "moment";
import $ from "jquery";
import boostrap from "bootstrap"
import c from "chartjs-plugin-colorschemes"

let myChart = null;
let countries = null;
let colletion = 'confirmed';

function getData(t,idx) {
    return countries[idx][t];
}

function getCountryData(idx) {
    return getData(colletion, idx)
}

function createSeries(offset, idx) {
    if (!offset) offset = 0;
    let values = getCountryData(idx);
    if (values.length === 0 || Object.values(values).reduce((a,b) => a+b,0) === 0  ) return [];
    let data = [];

    let i = 0;
    while (data.length < Object.keys(values).length) {
        let date = moment().subtract(i, 'days').format("M/D/YY");
        let p = values[date];
        data.push(p);

        i++;
    }
    let j = 0;
    while (!data[j]) {
        data.shift();
    }
    data.reverse();
    for (let j = 0; j < offset; j++) {
        data.shift();
    }

    return data;
}

function createData(response) {
    if (countries === null) {
        countries = response.data.confirmed.locations.map((l, idx) => {
            return {
                selected: l.country_code === 'IT' || (l.country_code === 'FR' && l.province === '') || l.country_code === 'DE' || l.country_code === 'CH',
                index: idx,
                name: l.country_code+" - " +l.province,
                cc: l.country_code,
                offset: 0,
                confirmed: response.data.confirmed.locations[idx].history,
                deaths: response.data.deaths.locations[idx].history,
                recovered: !!response.data.recovered.locations[idx] ? response.data.recovered.locations[idx].history:[]
            };
        });
        createChecks();
    }
}

function createChart() {
    let ctx = document.getElementById('myChart');
    let datasets = [];
    countries.filter(c => c.selected).forEach(c => {
        let gap = document.getElementById('gap_'+c.index).value;
        c.offset = gap;
        const data = createSeries(+gap, c.index);
        datasets.push({
            label: c.cc,
            data: data,
            borderWidth: 1,
            fill: false
        });
    });

    const x = datasets[0].data.map((d, i) => i);

    if (!myChart) {
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: x,
                datasets: []
            },
            options: {
                plugins: {
                    colorschemes: {
                        scheme: 'brewer.Paired12'
                    }
                },
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
                            callback: function (value) {
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
    }
        myChart.data.datasets = datasets;

        myChart.update();

}

function createChecks() {
    $("#check-container").empty();
    $("#offset_container").empty();
    countries.forEach( l => {
        let id = 'id_'+l.index;
        let elem = "<div><label for='"+ id + "'>"+l.name +
            "</label><input type='checkbox' id='"+id+"' /></div>";

        $(".check-container").append(elem);
        $("#"+id).change(checkChange);
        $("#"+id).prop('checked', l.selected);

        if (l.selected) {
            let id_gap = 'gap_'+l.index;
            let elemO = "<label for=\""+id_gap+"\">"+l.name + "</label><input type=\"number\" id=\""+id_gap+"\" value=\""+l.offset+"\"/>";

            $("#offset_container").append(elemO);
        }
    });
}
function createOffset() {
    $("#offset_container").empty();
    countries.forEach( l => {
        if (l.selected) {
            let id_gap = 'gap_'+l.index;
            let elemO = "<label for=\""+id_gap+"\">"+l.name + "</label><input type=\"number\" id=\""+id_gap+"\" value=\""+l.offset+"\"/>";

            $("#offset_container").append(elemO);
        }
    });
}

function checkChange(evt) {
    let id = evt.target.id.replace('id_', '');
    countries[id].selected = evt.target.checked;
    createOffset();
    createChart();
}

function collectionChanged(evt) {
    $('#confirmed').prop('checked', evt.target.id === 'confirmed');
    $('#deaths').prop('checked', evt.target.id === 'deaths');
    $('#recovered').prop('checked', evt.target.id === 'recovered');
    colletion = evt.target.id;
    draw();
}

function draw() {
    createChart();
}

$(document).ready(function() {
    $('#btn').click(draw);
    $('#confirmed').change(collectionChanged);
    $('#deaths').change(collectionChanged);
    $('#recovered').change(collectionChanged);
    axios.get('https://coronavirus-tracker-api.herokuapp.com/all')
        .then(r => {
            createData(r);
            draw();
        });
});

