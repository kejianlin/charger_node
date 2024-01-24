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
    let type = parseInt(req.body.type)
    let time = parseInt(req.body.time)
    let energy = parseInt(req.body.energy)
    let ownerId = parseInt(req.body.ownerId)
    let userId = parseInt(req.body.userId)
    DeviceInfo.searchId({
        id : parseInt(deviceId)
    }).then(result=>{
        // 设备不存在
        if(!result){
            throw new Error('device did not found')
        }else{
            return socketServer.sendCommand(deviceId,{
                "reqType": "setChargingStart",
                "data":{
                    "type": type,
                    "userId": userId,
                    "time": time,
                    "energy": energy
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