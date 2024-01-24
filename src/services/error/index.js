const DeviceError = require('./DeviceError')
const CustomError = require('./CustomError')
const ERR_TYPE = require('./errorType')


class AppError{
    constructor(){
        this.CustomError = CustomError
        this.DeviceError = DeviceError
    }
    factory(name,options){
       return new this[name](options)
    }
    throwFactory(name,options){
        throw this.factory(name,options)
    }
}
AppError.error = ERR_TYPE
module.exports = AppError