const Sequelize = require('sequelize')
const DeviceInfoConstructor = require('./models/DeviceInfo')
const DeviceOwnerInfoConstructor = require('./models/DeviceOwnerInfo')
const DeviceVersionInfoConstructor = require('./models/DeviceVersionInfo')


module.exports = class DB{
    constructor(options){
        let sequelize = new Sequelize({
            dialect: 'mysql',
            pool: {
                max: 2,
                min: 1,
                idle: 30000,
                acquire: 6000
            },
            database: options.database,
            username: options.username,
            password: options.password,
            host: options.host
    })
        this.DeviceInfo = DeviceInfoConstructor(sequelize)
        this.DeviceOwnerInfo = DeviceOwnerInfoConstructor(sequelize)
        this.DeviceVersionInfo = DeviceVersionInfoConstructor(sequelize)
        this.DeviceInfo.belongsTo(this.DeviceVersionInfo,{foreignKey: 'version_id'})
        this.DeviceInfo.belongsTo(this.DeviceOwnerInfo,{foreignKey: 'owner_id'})
        this.sequelize = sequelize
    }
}