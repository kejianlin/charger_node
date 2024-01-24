/**
 * socket 发送数据接口
 * 执行如下操作
 * 1. 封装设备数据上报给应用层
 * */

const {packageErr, isAuth} = require('../utils')

module.exports = function(client, next){
    // 提取设备数据
    let deviceData = client.data;
    // 拉取错误服务
    let  {ERR_TYPE} = client.server.services.AppError.constructor.error;
    // 检查设备是否授权
    if(isAuth(client)){
        let msgId = deviceData['data']['msgId'];
        // todo 此处响应需要判断是否含有此数据
        client.emit(msgId, deviceData)
        next();
    }else{
        client.write(packageErr(ERR_TYPE.DEFAULT),'please auth first!');
        client.destory();
        next();
    }
}

