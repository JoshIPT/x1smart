import got from 'got';
import * as mqtt from 'mqtt';

const server = 'http://10.80.111.13/';
const password = 'SJ4QUE8RBZ';
const mqttServer = '127.0.0.1';

function poll() {
    got.post(server, {form: { optType: "ReadRealTimeData", pwd: password } }, {responseType: 'json'})
        .then(res => {
            var js;
            try {
                js = JSON.parse(res.body);
                var reply = new X1Reply(js);
                console.log(reply);
            } catch(e) {
                console.log("Malformed response received from the inverter\n");
            }
        })
        .catch(err => {
            console.log('Error: ', err.message);
        });
}

class X1Reply {
    constructor (data) {
        this.serial_number = data.Information[2];
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
        return (Math.round(((value / divisor) + Number.EPSILON) * 100) / 100) + suffix;
    }
}

poll();