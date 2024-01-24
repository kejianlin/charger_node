const net = require('net');
const port = 11111;
let quitting = false;
let conn;
let retryTimeout = 3000;    //三秒，定义三秒后重新连接
let retriedTimes = 0;   //记录重新连接的次数
let maxRetries = 10;    //最多重新连接十次
process.stdin.resume(); //process.stdin流来接受用户的键盘输入，这个可读流初始化时处于暂停状态，调用流上的resume()方法来恢复流
process.stdin.on('data', function(data){
    if (data.toString().trim().toLowerCase() === 'quit'){
        quitting = true;
        console.log('quitting');
        conn.end();
        process.stdin.pause();
    } else {
        conn.write(data);
    }
});
//连接时设置最多连接十次，并且开启定时器三秒后再连接
(function connect() {
    function reconnect() {
        if (retriedTimes >= maxRetries) {
            throw new Error('Max retries have been exceeded, I give up.');
        }
        retriedTimes +=1;
        setTimeout(connect, retryTimeout);
    }
    conn = net.createConnection(port);
    conn.on('connect', function() {
        retriedTimes = 0;
        console.log('connect to server');
        const notifyData = {
            "reqType":"notifyNewDevice",
            "data":{
                "mac": "32468efd3f50",
                "isReconnect": 0
            }
        }
        conn.write(JSON.stringify(notifyData))
    });
    conn.on('data', function(chunk){
        if(!isJsonString(chunk.toString())) {
            console.log(chunk);
            setTimeout(function(){
                sendData = {
                    respType: "notifyOTAResult",
                    data: {
                        "result":0,
                        "oldVersionId":1,
                        "newVersionId":2
                    }
                }
                conn.write(JSON.stringify(sendData))
            },5000)
        }else {
            data = JSON.parse(chunk);
            console.log(data);
            if (data.reqType === "setChargingStart") {
                sendData = {
                    respType: data.reqType,
                    data: {
                        msgId: data.data.msgId,
                        respCode: 100
                    }
                }
                conn.write(JSON.stringify(sendData))
            } else if (data.reqType === "setChargingEnd") {
                sendData = {
                    respType: data.reqType,
                    data: {
                        msgId: data.data.msgId,
                        respCode: 100
                    }
                }
                conn.write(JSON.stringify(sendData))
            } else if (data.reqType === "getChargerStatus") {
                sendData = {
                    respType: data.reqType,
                    data: {
                        msgId: data.data.msgId,
                        respCode: 100,
                        status: 1,
                        connect: 0
                    }
                }
                conn.write(JSON.stringify(sendData))
            } else if (data.reqType === "getChargingInfo") {
                sendData = {
                    respType: data.reqType,
                    data: {
                        msgId: data.data.msgId,
                        respCode: 100,
                        energy: 1.2,
                        voltage: 230.34,
                        current: 4.312,
                        power: 12.1,
                        duration: 10,
                        status: 1,
                        connect: 0,
                        setDuration: 120,
                        setEnergy: 0
                    }
                }
                conn.write(JSON.stringify(sendData))
            } else if (data.reqType === "setUpdateVersion") {
                sendData = {
                    respType: data.reqType,
                    data: {
                        msgId: data.data.msgId,
                        respCode: 100,
                    }
                }
                conn.write(JSON.stringify(sendData))
                sendData2 = {
                    respType: "notifyUpdateVersion",
                    data: {
                        "versionSN": data.data.versionSN,
                        "blockOffset": 3,
                        "blockSize": 100
                    }
                }
                setTimeout(function(){
                    conn.write(JSON.stringify(sendData2))
                },5000)
            }
        }
        //conn.write(JSON.stringify(data))
    })
    conn.on('error', function(err) {
        console.log('Error in connection:', err);
    });
    conn.on('close', function() {
        if(! quitting) {
            console.log('connection got closed, will try to reconnect');
            reconnect();
        }
    });
    //打印
    //conn.pipe(process.stdout, {end: false});
})();

// { "reqType":"notifyChargerStatus","data":{"status":2, "connect":1}}
// { "reqType":"notifyChargingInfo","data":{ "type":1,"energy":1.2,"voltage":230.34,"current":4.312,"power":12.1,"duration":10,"status":1,"connect":0,"setDuration":120,"setEnergy":0}}
// { "reqType":"notifyEndCharging","data":{ "userId":1, "endType":1, "energy":12.4,"setEnergy":0,"duration":12,"setDuration":120,"status":1,"connect":0}}
// { "reqType":"notifyHeartPackage","data":{"ledStatus": 6}}
// { "reqType":"notifyNewDevice","data":{"mac": "32468efd3f50", "isReconnect":0}}
// { "reqType":"notifyNewDevice","data":{"mac":"32468efd3f50","isReconnect":1}}


function isJsonString(str) {
    try {
        if (typeof JSON.parse(str) === "object") {
            return true;
        }
    } catch (e) {
    }
    return false;
}
