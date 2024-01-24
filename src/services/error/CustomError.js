const ERR_TYPE = require('./errorType')

module.exports = class CustomError extends Error {
    /**
     * 创建
     * @param {number} errType - 错误类型
     * @param {string} message - 错误消息
     * @param params - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
     */
    constructor(errType = ERR_TYPE.DEFAULT, message = errType.errMsg,...params){
        super(message,...params)

        if(Error.captureStackTrace){
            Error.captureStackTrace(this, customError)
        }

        this.errCode = errType.code;
    }
}