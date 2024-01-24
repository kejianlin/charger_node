/**
 * socket 发送版本文件接口
 * 执行如下操作.
 * 1. 验证客户端合法性
 * 2. 处理重复握手
 * 3. 发送版本文件
 */
const debug = require('debug')('socket:notifyUpdateVersion')
const {packageErr, packageSuccess, isAuth} = require('../utils');
module.exports = function (client, next) {
    // 提取设备数据
    let deviceData = client.data;
    // 拉取错误服务
    let  ERR_TYPE = client.server.services.AppError.constructor.error;
    let  serviceOTA = client.server.services.OTA
    if (isAuth(client)) {
        // 发送版本文件
        let {versionSN,blockOffset,blockSize} = deviceData.data
        serviceOTA.createSendBuffer(versionSN,blockOffset,blockSize).then(
            (buffer)=>{
                // 将读取内容返回给设备
                debug(buffer.length)
                client.socket.write(buffer)
                next()
            }
        ).catch((err)=>{
            client.write(packageErr(ERR_TYPE.DEFAULT, err.message))
            debug(err)
            next()
        })
    } else {
        client.write(packageErr(ERR_TYPE.DEFAULT,'please auth first!'));
        client.destroy();
        next();
    }
}

