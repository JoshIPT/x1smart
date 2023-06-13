const got = require('got');
const mqtt = require('mqtt')

const server = 'http://10.80.111.13/';
const password = 'SJ4QUE8RBZ';
const mqttServer = '127.0.0.1';

function poll() {
    got.post(server, {optType: "ReadRealTimeData", pwd: password}, {responseType: 'json'})
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log('Error: ', err.message);
        });
}

poll();