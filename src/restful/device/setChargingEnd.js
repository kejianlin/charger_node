const {check,validationResult} = require('express-validator/check')
exports.post = function(req,res,next){
    const result = validationResult(req).formatWith(({ location, msg, param, value, nestedErrors }) => {
        return `${msg}`;
    });
    if (!result.isEmpty()) {
        throw new Error(result.array().join())
    }
    let {socketServer} = req.app.locals
    let {DeviceInfo} = socketServer.services.DB;
    let deviceId = parseInt(req.body.deviceId)
    DeviceInfo.searchId({
        id : parseInt(deviceId)
    }).then(result=>{
        // 设备不存在
        if(!result){
            throw new Error('device did not found')
        }else{
            return socketServer.sendCommand(deviceId,{
                "reqType": "setChargingEnd",
                "data":{
                    "deviceId": deviceId
                }
            })
        }
    }).then(data=>{
        res.json(data)
        next()
    }).catch(err=>{
        next(err)
    })
}