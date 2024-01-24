const socketServerLog = require('debug')('socket:server')
const httpServerLog = require('debug')('socket:http')
const debug = require('debug')('socket:parsePath');
const config = require('config')
const SocketServer = require('./sockets-server')
const AppError = require('./src/services/error'); //错误处理服务
const DB = require('./src/services/db');  //数据库服务
const has = require('lodash/has');
const OTA = require('./src/services/ota') // ota 服务
const LOG = require('./src/services/log') // log 服务
const deviceRouter = require('./src/device/router'); //设备层路由
const socketServer = new SocketServer({
    parserPath:function(data){
        if(has(data,'reqType') || has(data,'respType')){
            debug(`path = ${data['reqType']} || ${data['respType']}`);
           return data['reqType'] || data['respType']
        }else{
           return '/'
        }
    },
    WAIT_OVERTIME: 5000,  // 设备上报时间的超时时间
    MAX_CONNECTIONS: 5000, // socket server 最大连接数
})
// 注入设备层错误处理服务
 socketServer.service(new AppError())
//socketServer.servers.AppError.throwFactory(CustomError,AppError.error)
// 注入数据库服务，添加数据库配置项
 socketServer.service(new DB(config.DB))
// 注入 ota 服务
 socketServer.service(new OTA(config.OTA))
// 注入 log 服务
 socketServer.service(new LOG(config.LOG))

//实例化路由对象

deviceRouter(socketServer)

socketServer.listen(config.SOCKET_PORT,'0.0.0.0',function(){
    socketServerLog(`socket server listen ${config.SOCKET_PORT}`)
})

const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const router = require('./src/restful/router')
const errHandle = require('./src/restful/middleware/errorHandle')
const logHandle = require('./src/restful/middleware/logHandle')
app.locals.socketServer = socketServer //将设备端服务绑定在 app 上
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended:false }))
// parse application/json
app.use(bodyParser.json())

router(app)

app.use(logHandle)

app.use(errHandle)

app.listen(config.SERVER_PORT,function(){
    httpServerLog(`http server listen ${config.SERVER_PORT}`)
})