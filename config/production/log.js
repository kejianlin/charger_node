/**
 * 配置 express 存放静态资源路径
 * 详细参见 {@link|https://expressjs.com/en/starter/static-files.html|static file}
 * 文件路径 path
 * 详细参见 {@lick|https://nodejs.org/docs/latest/api/path.html|path.join}
 * */
const path = require('path')

module.exports = {
    /*设备升级文件存储位置*/
    // todo 项目 ota 文件应该在相同目录
    LOG_PATH: {
        APP_ACCESS:path.join('/var/log/charger/app_access.log'),
        DEVICE_ACCESS:path.join('/var/log/charger/device_access.log'),
        ERROR_LOG:path.join('/var/log/charger/error.log'),
        EXCEPTION:path.join('/var/log/charger/exception.log')
    }
}