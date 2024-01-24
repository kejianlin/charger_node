/**
 * socket 授权接口，验证设备连接合法性
 * 执行如下操作.
 * 1. 验证客户端合法性
 * 2. 处理重复握手
 * 3. 响应结果
 */
const debug = require('debug')('socket:notifyHeartPackage')
const {packageErr, packageSuccess, isAuth} = require('../utils');
module.exports = function (client, next) {
    // 提取设备数据
    let deviceData = client.data;
    debug(client.auth)
    client.server.log.ExceptionLogHandler(`${client.extendClient.id+'  notifyHearPackage  '+JSON.stringify(client.auth)}`)
    // 拉取错误服务
    let  ERR_TYPE = client.server.services.AppError.constructor.error;
    if (isAuth(client)) {
        // 检查设备是否授权
        client.write(packageSuccess({
            "respType":deviceData.reqType,
        }))
        // 更新 client extendClient 对象
        let clientInfo = client.extendClient
        clientInfo.ledStatus = deviceData.data.ledStatus
        clientInfo.runStatus = 4
    } else {
        client.write(packageErr(ERR_TYPE.DEFAULT,'please auth first!'));
        client.destroy();
        next();
    }
}