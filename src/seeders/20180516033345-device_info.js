'use strict';
let Mock = require('mockjs');
let initVal = [{
    'id':1,
    'version_id': 1,
    'owner_id': 1,
    'device_sn': '0d7c23f23a938f2312c5505e278bb1ce',
    'token': 'U1UV2j61vOV2F82dT8diYphuNWFO8Fqo',
    'mac': 'ffffffffffff'
},{
    'id':2,
    'version_id': 1,
    'owner_id': 1,
    'device_sn': '0d7c23f23a938f2312c5505e278bb1c1',
    'token': 'U1UV2j61vOV2F82dT8diYphuNWFO8Fq1',
    'mac': '46420659d9fa'
},{
    'id':3,
    'version_id': 1,
    'owner_id': 1,
    'device_sn': '0d7c23f23a938f2312c5505e278bb1c2',
    'token': 'U1UV2j61vOV2F82dT8diYphuNWFO8Fq2',
    'mac': 'be454f62e720'
}
];

let fakeData = {
    'array|10-10': [{
        'version_id': 1,
        'owner_id': 1,
        'device_sn': /[a-f0-9]{32}/,
        'token': /[a-zA-Z0-9]{32}/,
        'mac': /[a-f0-9]{12}/,
    }]
};


module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('device_info', Mock.mock(initVal), {}).then(
                () => {
                    return queryInterface.bulkInsert('device_info', Mock.mock(fakeData).array, {});
                }
            ).catch((err) => {
                return queryInterface.bulkInsert('device_info', Mock.mock(fakeData).array, {});
        })
    },
    down: (queryInterface, Sequelize) => {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete('device_info', {
            id: {
                [Op.gt]: 0
            }
        }, {});
    }
};
