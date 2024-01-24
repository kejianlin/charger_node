'use strict';
let  Mock = require('mockjs');
let fakeData ={
  'array|10-10':[{
      'version_sn':/[a-f0-9]{32}/,
      'size|10000-20000':10000,
      'checksum|0-65535':0,
      'description':'测试数据'
  }]};


module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('device_version_info', Mock.mock(fakeData).array,{});
    },
    down: (queryInterface, Sequelize) => {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete('device_version_info',  {
            id: {
                [Op.gt]: 0
            }
        }, {});
    }
};
