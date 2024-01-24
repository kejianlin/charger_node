const {check,validationResult} = require('express-validator/check')
const memWatch = require('../utils/memory_watch')
exports.post = function(req,res,next){
    const result = validationResult(req).formatWith(({ location, msg, param, value, nestedErrors }) => {
        return `${msg}`;
    });
    if (!result.isEmpty()) {
        throw new Error(result.array().join())
    }
    let {socketServer} = req.app.locals
    let allAuthClientInfo = []
    let allAuthClient = socketServer.authClient
    for(let key in allAuthClient){
        // todo::主要是避免获取原型上面的属性
        if(allAuthClient.hasOwnProperty(key)){
            let client = allAuthClient[key]
            let clientInfo = client.extendClient
            clientInfo.reqTime = new Date()
            clientInfo.mac = client.auth.mac
            clientInfo.meterNumber = client.auth.meterNumber
            clientInfo.url = client.auth.notifyUrl
            clientInfo.ownerId = client.auth.ownerId
            clientInfo.id = client.auth.id
            allAuthClientInfo.push(clientInfo)
        }
    }
    res.json({
        respType: "getAllInfo",
        data:{
            client: allAuthClientInfo,
            memInfo: memWatch.getShowMemInfo(),
            respCode: 100
        }
    })
    next()
}