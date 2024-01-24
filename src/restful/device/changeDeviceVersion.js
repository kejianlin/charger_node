/**
 * changeDeviceVesion 切换新软体版本
 *
 * 业务逻辑如下
 *
 * 1. 数据库检查版本信息是否存在与合法
 * 2. 合法提取数据库版本记录
 * 3. 向设备发送版本更新命令
 * 4. 进行版本更新
 * 5. 获取版本结束更新消息
 * 6. 将设备更新到新版本
 *
 * 失败原因:
 * 1. 不存在该 ownerId
 * 2. 其他错误
 */
const {check, validationResult} = require('express-validator/check')
exports.post = function (req, res, next) {
    const result = validationResult(req).formatWith(({location, msg, param, value, nestedErrors}) => {
        return `${msg}`;
    });
    if (!result.isEmpty()) {
        throw new Error(result.array().join())
    }
    let {socketServer} = req.app.locals
    let {DeviceInfo, DeviceVersionInfo} = socketServer.services.DB;
    let serviceOTA = socketServer.services.OTA
    let log = socketServer.services.LOG
    let deviceId = parseInt(req.body.deviceId)
    let newVersionId = parseInt(req.body.newVersionId)
    let oldVersionId = parseInt(req.body.oldVersionId)
    let ownerId = parseInt(req.body.ownerId)
    DeviceInfo.searchId({
        id: parseInt(deviceId)
    }).then(result => {
        if (!result) {
            throw new Error('device did not found')
        }
    }).then(() => {
        return DeviceVersionInfo.searchId({
            id: parseInt(newVersionId)
        }).then(versionInfo => {
            if (!versionInfo) {
                throw new Error('version did not found');
            } else {
                return versionInfo
            }
        })
    }).then((versionInfo) => {
        return socketServer.sendCommand(deviceId, {
            "reqType": "setUpdateVersion",
            "data": {
                "versionSN": versionInfo.version_sn,
                "versionNumber": versionInfo.version_number,
                "oldVersionId": oldVersionId,
                "newVersionId": newVersionId,
                "versionSize": versionInfo.size,
                "checkSum": parseInt(versionInfo.checksum, 16)
            }
        })
    }).then(data => {
        res.json(data)
        next()
    }).catch(err => {
        next(err)
    })
}