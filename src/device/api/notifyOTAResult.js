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
        //todo::需要显示在日志输出控制台
        // 获取 Id 即为当前设备 id 和 设备推送地址
        let {id,notifyUrl} = client.auth
        // 构造需要推送的数据
        let msgId = client.constructor.generateMsgId()
        let postData= {
            "notify": deviceData.respType,
            "apiType": "notify",
            "msgType": 1,
            "msgSecret":md5(`${id}${msgId}${msgId.length}`),
            "msgDate": moment().format(),
            "deviceId": id,
            "msgId":  msgId,
            "msgIp": client.clientId,
            "apiName": deviceData.respType,
            "result": deviceData.data.result,
            "oldVersionId": deviceData.data.oldVersionId,
            "newVersionId": deviceData.data.oldVersionId
        }
        debug(postData)
        // 重新初始化 client extendClient 对象
        // 上报设备推送信息
        client.server.notify(id , postData, notifyUrl);
        next()
    } else {
        client.write(packageErr(ERR_TYPE.DEFAULT,'please auth first!'));
        client.destroy();
        next();
    }
}