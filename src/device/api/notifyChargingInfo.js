/**
 * 设备推送 notifyChargerStatus
 * 执行如下操作.
 * 1. 将设备推送的信息转发给应用层
 * 2. 将设备推送的信息输出在日志控制台
 */
const debug = require('debug')('socket:notifyChargingInfo')
const {packageErr, packageSuccess, isAuth} = require('../utils');
const md5 = require('md5')
const moment = require('moment')
module.exports = function (client, next) {
    // 提取设备数据
    let deviceData = client.data;
    // 拉取错误服务
    let  ERR_TYPE = client.server.services.AppError.constructor.error;
    if (isAuth(client)) {
        // 响应设备推送成功
        client.write(packageSuccess({
            "respType":deviceData.reqType,
        }))
        // todo::需要显示在日志输出控制台
        // 获取 Id 即为当前设备 id 和 设备推送地址
        let {id,notifyUrl} = client.auth
        // 构造需要推送的数据
        let msgId = client.constructor.generateMsgId()
        let postData= {
            "notify": deviceData.reqType,
            "apiType": "notify",
            "type": deviceData.data.type,
            "energy": deviceData.data.energy,
            "voltage": deviceData.data.voltage,
            "current": deviceData.data.current,
            "power": deviceData.data.power,
            "duration": deviceData.data.duration,
            "status": deviceData.data.status,
            "connect": deviceData.data.connect,
            "setDuration": deviceData.data.setDuration,
            "setEnergy": deviceData.data.setEnergy,
            "msgType": 1,
            "msgSecret":md5(`${id}${msgId}${msgId.length}`),
            "msgDate": moment().format(),
            "deviceId": id,
            "msgId":  msgId,
            "msgIp": client.clientId,
            "apiName": deviceData.reqType,
        }
        debug(postData)

        // 更新 Client extendClient

        let clientInfo = client.extendClient
        clientInfo.chargingInfo.energy = deviceData.data.energy
        clientInfo.chargingInfo.duration = deviceData.data.duration
        clientInfo.chargingInfo.setDuration = deviceData.data.setDuration
        clientInfo.chargingInfo.setEnergy = deviceData.data.setEnergy
        // 更改设备状态
        clientInfo.runStatus = deviceData.data.status
        clientInfo.ledStatus = deviceData.data.status
        // 上报设备推送信息
        client.server.notify(id,postData,notifyUrl);
        next()
    } else {
        client.write(packageErr(ERR_TYPE.DEFAULT,'please auth first!'));
        client.destroy();
        next();
    }
}