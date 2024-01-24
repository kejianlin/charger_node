/**
 * 设备推送 notifyChargerStatus
 * 执行如下操作.
 * 1. 将设备推送的信息转发给应用层
 * 2. 将设备推送的信息输出在日志控制台
 */
const debug = require('debug')('socket:notifyChargerStatus')
const {packageErr, packageSuccess, isAuth} = require('../utils');
const md5 = require('md5')
const moment = require('moment')
module.exports = function (client, next) {
    // 提取设备数据
    let deviceData = client.data;
    // 拉取错误服务
    // todo:: 这也太长了
    let  ERR_TYPE = client.server.services.AppError.constructor.error;
    if (isAuth(client)) {
        // 连接层接收到信息
        client.write(packageSuccess({
            "respType":deviceData.reqType,
        }))
        //todo::需要显示在日志输出控制台
        // 获取 Id 即为当前设备 id 和 设备推送地址
        let {id,notifyUrl} = client.auth
        // 构造需要推送的数据
        let msgId = client.constructor.generateMsgId()
        let postData= {
            "apiType": "notify",
            "notify": deviceData.reqType,
            "status": deviceData.data.status,
            "connect": deviceData.data.connect,
            "msgType": 1,
            "msgSecret":md5(`${id}${msgId}${msgId.length}`),
            "msgDate": moment().format(),
            "deviceId": id,
            "msgId":  msgId,
            "msgIp": client.clientId,
            "apiName": deviceData.reqType,
        }
        debug(postData)
        // 重新初始化 client extendClient 对象
        let clientInfo = client.extendClient
        clientInfo.ledStatus = deviceData.data.status
        clientInfo.runStatus = deviceData.data.status

        // 上报设备推送信息
        client.server.notify(id,postData,notifyUrl);
        next()
    } else {
        client.write(packageErr(ERR_TYPE.DEFAULT,'please auth first!'));
        client.destroy();
        next();
    }
}