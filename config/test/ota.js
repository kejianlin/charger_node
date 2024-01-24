/**
 *
 * 配置数据库,采用 sequelize 实现数据库连接.
 * 详细配置项参见 {@link|http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor|数据库连接}
 */
const path = require('path');

module.exports  = {
    /*设备升级文件存储位置*/
    //todo 项目 ota 文件应该在相同目录
    OTA_PATH:path.join(__dirname,'../../tests/ota')
};