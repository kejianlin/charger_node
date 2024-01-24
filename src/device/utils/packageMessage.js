/**
 * api 基类
 * @module SocketApi
 *
 * */

const SUCCESS_CODE = require('../../services/error/errorType').SUCCESS.code;

module.exports.packageErr =
    /**
     * 返回错误信息
     * @param {Object} type 错误消息对象
     * @param {Number} type.code 对应的错误吗
     * @param {String} type.errMsg 对应的错误消息
     * @param {String} message 错误消息内容
     * */
    function packageErr(type,message = type.errMsg){
        let respErr = {
            respCode: type.code,
            errMsg: message
        };
        return JSON.stringify(respErr)
    }
module.exports.packageSuccess =
    /**
     * 返回错误消息
     * @param {Object} data 响应数据
     * @return {String}
     * */
    function packageSuccess(data){
        let respSuccess = {
            "respType": data.respType,
            "data": {
                "respCode": 100,
                ...data.data
            }
        }
        return JSON.stringify(respSuccess)
    }