'use strict';

let  Mock = require('mockjs');
let fakeData = {
    'array|10-10':[
        {
            'name':/[a-z]{6}/,
            'notify_url':'http://localhost/notify',
            'description':'默认推送地址'
        }
    ]
} ;

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('device_owner_info', Mock.mock(fakeData).array,{});
  },
    down: (queryInterface, Sequelize) => {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete('device_owner_info',  {
            id: {
                [Op.gt]: 0
            }
        }, {});
    }
};
