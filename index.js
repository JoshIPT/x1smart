import got from 'got';
import mqtt from 'mqtt';
//import InfluxDB from '@influxdata/influxdb-client';
import {InfluxDB,Point} from "@influxdata/influxdb-client";
//const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const server = 'http://10.80.111.13/';
const password = 'SJ4QUE8RBZ';
const mqttServer = 'mqtt://10.80.111.44:1883/';
const mqttTopic = 'x1smart';
const INFLUXDB_TOKEN = "--";
const influx_url = 'https://us-east-1-1.aws.cloud2.influxdata.com';

const clientId = 'mqttjs_' + Math.random().toString(8).substr(2, 4);
//const client  = mqtt.connect(mqttServer, {clientId: clientId, clean: false});
const influx = new InfluxDB({
    url: influx_url,
    token: INFLUXDB_TOKEN
});

setInterval(poll, 5000);
/*client.on("connect", function(connack) {
    console.log("Client Connected");
});
client.on("close", function() {
    console.log("Connection closed by client")
})

client.on("reconnect", function() {
    console.log("Client trying a reconnection")
})

client.on("offline", function() {
    console.log("Client is currently offline")
})*/

function poll() {
    got.post(server, {form: { optType: "ReadRealTimeData", pwd: password } }, {responseType: 'json'})
        .then(res => {
            var js;
            try {
                js = JSON.parse(res.body);
                var reply = new X1Reply(js);

                let org = `Tegan And Josh`;
                let bucket = `solar`;

                let writeClient = influx.getWriteApi(org, bucket, 'ns');
                for (const property in reply) {
                    let point = new Point(property)
                        .timestamp(new Date())
                        .floatField("value", reply[property]);
                    writeClient.writePoint(point);
                }
                writeClient.flush();

                //client.publish("solar_assistant/inverter_1/load_power/state", reply.pv1_power, {qos: 1, retain: true});


            } catch(e) {
                console.log("Malformed response received from the inverter", e.message);
            }
        })
        .catch(err => {
            console.log('Error: ', err.message);
        });
}

class X1Reply {
    constructor (data) {
        //this.serial_number = data.Information[2];
        var values = data.Data;
        this.network_voltage = this.calc(values[0], 10, "V");
        this.output_current = this.calc(values[1], 10, "A");
        this.ac_power = this.calc(values[2], 1, "W");
        this.pv1_voltage = this.calc(values[3], 10, "V");
        this.pv2_voltage = this.calc(values[4], 10, "V");
        this.pv1_current = this.calc(values[5], 10, "A");
        this.pv2_current = this.calc(values[6], 10, "A");
        this.pv1_power = this.calc(values[7], 1, "W");
        this.pv2_power = this.calc(values[8], 1, "W");
        this.grid_freq = this.calc(values[9], 100, "Hz");
        this.total_energy = this.calc(values[11], 10, "KWh");
        this.today_energy = this.calc(values[13], 10, "KWh");
        this.inverter_temp = this.calc(values[39], 1, "°C");
        this.exported_power = this.calc(values[48], 1, "W");
        this.total_feedin = this.calc(values[50], 100, "KWh");
        this.total_consumption = this.calc(values[52], 100, "KWh");
    }
    calc(value, divisor, suffix = "") {
        return (Math.round(((value / divisor) + Number.EPSILON) * 100) / 100); // + suffix;
    }
}

poll();
