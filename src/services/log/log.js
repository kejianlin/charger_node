const debug = require('debug')('socket:log')
const {EventEmitter} = require('events')
const fsPromises = require('fs');
const moment = require('moment')
const os = require('os')
const formatStr = 'YYYY.M.D-H:m:s.SSS'
module.exports = class LOG extends EventEmitter{
    /**
     *
     * @param options
     * @param {Object} options.LOG_PATH log 日志保存文件
     */
    constructor(options={}){
        super()
        this.options = options
        this.LOG_PATH = options.LOG_PATH || __dirname;
    }
    /**
     * 写入应用层请求和接收数据
     * @param req
     * @param resp
     * @param label
     * @constructor
     */
    appLogHandler(req,resp,label){
        let writeData = this.createAppLogData(req,resp,label)
        fsPromises.appendFile(this.LOG_PATH.APP_ACCESS,writeData,function(err){
            if(err) debug(err);
        })

    }
    deviceLogHandler(logData){
        let writeData = this.createDeviceLogData(logData)
        fsPromises.appendFile(this.LOG_PATH.DEVICE_ACCESS, writeData,function(err){
            if(err) debug(err);
        })
    }
    ExceptionLogHandler(logData){
        let resultData = ''
        switch (os.platform()){
            case "linux":
                resultData= logData+"  "+new Date() + '\n';
                break;
            case "win32":
                resultData = logData+"  "+new Date() + '\n';
                break;
            case "darwin":
                resultData = logData+"  "+new Date() + '\n';
                break;
        }
        fsPromises.appendFile(this.LOG_PATH.EXCEPTION, resultData,function(err){
            if(err) debug(err);
        })
    }
    /**
     * 构造需要 App 日志数据
     * @param req
     * @param resp
     * @param label
     * @returns {string}
     */
    createAppLogData(req,resp,label){
        let fullUrl = req.method + '-' + req.originalUrl
        let data = (Object.keys(req.body).length === 0)? '-':req.body;
        let appData = {
            reqTime: moment(req._clientReqTime).format(formatStr),
            clientIp: req.ip,
            label: label || 'app-access',
            clientId: req.body.deviceId || '-',
            clientReq: fullUrl,
            clientData: data,
            status: resp.statusCode,
        }
        return this.createLineFeed(appData)
    }

    /**
     * 构造设备日志数据
     * @param device
     * @param info
     * @returns {string}
     */
    createDeviceLogData(logData){
        if(!logData){
            return {}
        }
        let deviceData = {
            Time: moment().format(formatStr),
            clientIp: logData.clientIp,
            clientId: logData.clientId || '-',
            label: logData.label || 'device-access',
            clientData: logData.data || '-'
        }
        return this.createLineFeed(deviceData)
    }

    /**
     * 根据不同操作系统，设置换行符
     * @param data 传入的 JSON 对象
     * @returns {string} 返回的字符串对象
     */
    createLineFeed(data){
        if(typeof data !== 'object'){
            throw new Error('传递不是对象')
        }
        let arr = []
        let resultData = ''
        for(let ele in data){
            if(data.hasOwnProperty(ele)) {
                if(typeof data[ele] === 'string'){
                    arr.push(data[ele])
                }else{
                    arr.push(JSON.stringify(data[ele]));
                }
            }
        }
        switch (os.platform()){
            case "linux":
                resultData= arr.join(' ')+ '\n';
                break;
            case "win32":
                resultData = arr.join(' ') + '\r\n';
                break;
            case "darwin":
                resultData = arr.join(' ') + '\r';
                break;
        }
        return resultData
    }
}