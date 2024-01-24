/**
 * socket 授权接口，验证设备连接合法性
 * 执行如下操作.
 * 1. 验证客户端合法性
 * 2. 处理重复握手
 * 3. 响应结果
 */
const debug = require('debug')('socket:notifyNewDevice')
const {packageErr, packageSuccess, isAuth} = require('../utils');
module.exports = function (client, next) {
    // 提取设备数据
    let deviceData = client.data;
    // 拉取错误服务
    let  ERR_TYPE = client.server.services.AppError.constructor.error;
    if (isAuth(client)) {
        // 已授权设备判断是否重连请求
        let isReconnect = deviceData['data']['isReconnect']
        if (isReconnect) {
            // 删除客户端
            client.destroy();
            next();
        } else {
            // 非重连抛出错误
            // 告知设备重复连接
            client.write(packageErr(ERR_TYPE.DEFAULT, 'device reconnection'));
            next();
        }
    } else {
        // 未授权执行授权操作
        let {DeviceInfo, DeviceVersion, DeviceOwner} = client.server.services.DB;
        // 基于新数据创建新的实例
        let deviceInfo = DeviceInfo.build(deviceData.data)
        deviceInfo.validate()
            .then(() => { //校验成功
                return deviceInfo.auth(); //执行授权
            })
            .then((auth) => {
                if (auth) {   // 设备授权后将设备信息附着在授权字段
                    // 授权成功处理
                    client.auth = auth;
                    client.write(packageSuccess({
                        "respType": deviceData.reqType,
                        "data": {
                            "meterNumber": client.auth.meterNumber
                        }
                    }));
                    client.server.addAuthClient(client);
                    next();
                } else { //非法设备
                    client.write(packageErr(ERR_TYPE.DEFAULT, 'illegal device!'));
                    next();
                }
            })
            .catch(err => {
                client.write(packageErr(ERR_TYPE.DEFAULT, err.message))
                next();
            })
    }
}