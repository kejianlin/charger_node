const Sequelize = require('sequelize');
module.exports=function(sequelize){
    const DeviceVersionInfo = sequelize.import('./DeviceVersionInfo')
    const DeviceOwnerInfo = sequelize.import('./DeviceOwnerInfo')
    const DeviceInfo = sequelize.define('device_info',{
        mac: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                //todo:: mac 地址固定12位？
                is: /^[a-z0-9]{12}/i
            }
        },
        device_sn: Sequelize.STRING,
        meter_number: Sequelize.STRING
    },{
        // don't add the timestamp attributes (updatedAt, createdAt)
        // 不要添加时间戳属性(updatedAt, createdAt)
        timestamps: false,

        // don't delete database entries but set the newly added attribute deletedAt
        // to the current date (when deletion was done). paranoid will only work if
        // timestamps are enabled
        // 不从数据库中删除属性，而只是增加一个 deletedAt 标识当前时间
        // paranoid 属性只在启用 timestamps 时适用
        paranoid: true,

        // don't use camelcase for automatically added attributes but underscore style
        // so updatedAt will be updated_at
        // 不自动使用驼峰式规则命名，而是采用下划线，所以 updateAt 会成为 updated_at
        underscored: true,

        // disable the modification of tablenames; By default, sequelize will automatically
        // transform all passed model names (first parameter of define) into plural.
        // if you don't want that, set the following
        // 禁止修改表名，默认情况下
        // sequelize 会自动使用传入的模型名(define 的第一个参数)做为表名
        // 如果你不想使用这种方式你需要进行以下设置
        freezeTableName: true,

        // define the table's name
        // 定义表名
        tableName: 'device_info'
    })
    /**
     * 获取授权的设备 id
     * @param {Object} options 传入的查询条件
     * @param {String} options.token 设备的授权码
     * @param {String} options.deviceSN
     */
    DeviceInfo.getId = function(options){
        let self = this;
        return DeviceInfo.findOne({
            where:{
                device_sn: options.deviceSN,
                token: options.token
            }
        }).then(device => {
            if(device){
                return sequelize.Promise.resolve(device.id)
            }else{
                return sequelize.Promise.resolve(null)
            }
        })
    }
    /**
     *
     * @returns {*}
     */
    DeviceInfo.searchId = function(options){
        let self = this;
        return DeviceInfo.findOne({
            where:{
                id : options.id
            }
        }).then(result=>{
            if(result) {
                return sequelize.Promise.resolve(result)
            }else{
                return sequelize.Promise.resolve(null)
            }
        })
    }
    // 因为调用该方法的是基于该模型创建的实例，所以将此方法放置在显示原型上
    DeviceInfo.prototype.auth = function(){
        let self = this;
        return DeviceInfo.findOne({
            where: {
                mac: self.mac
            },
            include: [
                {
                    model: DeviceOwnerInfo
                },
                {
                    model: DeviceVersionInfo
                }
            ]
        }).then(device => {
            if(device && device.device_owner_info && device.device_version_info){
                return sequelize.Promise.resolve({
                    notifyUrl: device.device_owner_info.notify_url,
                    id: device.id,
                    ownerId: device.owner_id,
                    mac: device.mac,
                    meterNumber: device.meter_number
                })
            }
        })
    }

    return DeviceInfo;
}