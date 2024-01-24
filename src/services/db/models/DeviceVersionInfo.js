const Sequelize = require('sequelize');
module.exports = function(sequelize){
    const DeviceVersionInfo = sequelize.define('device_version_info',{
        owner_id: Sequelize.BIGINT,
        version_number: Sequelize.STRING,
        version_sn: Sequelize.STRING(32),
        size: Sequelize.BIGINT,
        checksum: Sequelize.SMALLINT.UNSIGNED,
        description: Sequelize.TEXT,
    },{
        // dont't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,

        // don't delete database entries but set the newly added attribute deletedAt
        // to the current date (when deletion was done). paranoid will only work if
        // timestamps are enabled
        paranoid: true,

        // don't use camelcase for automatically added attributes but underscore style
        // so updatedAt will be updated_at
        underscored: true,

        // disable the modification of tablenames; By default, sequelize will automatically
        // transform all passed model names (first parameter of define) into plural.
        // if you don't want that, set the following
        freezeTableName: true,

        // define the table's name
        tableName: 'device_version_info'
    })
    DeviceVersionInfo.searchId = function(options){
        let self = this;
        return DeviceVersionInfo.findOne({
            where:{
                id : options.id
            },
        }).then(result=>{
            if(result) {
                return sequelize.Promise.resolve(result)
            }else{
                return sequelize.Promise.resolve(null)
            }
        })
    }
    return DeviceVersionInfo
}