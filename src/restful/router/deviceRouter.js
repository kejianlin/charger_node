var express = require('express');
var router = express.Router();
const {check,validationResult} = require('express-validator/check')
const {matchData,sanitize} = require('express-validator/filter')
/*设置类*/
const setChargingStart = require('../device/setChargingStart')
const setChargingEnd = require('../device/setChargingEnd')
/*获取类*/
const getChargerStatus = require('../device/getChargerStatus')
const getChargingInfo  = require('../device/getChargingInfo')
const getAllInfo = require('../device/getAllInfo')
const getCurVersion = require('../device/getCurVersion')
/*切换版本*/
const changeDeviceVersion = require('../device/changeDeviceVersion')

router.post('/setChargingStart',[
    check('deviceId','deviceId must be int ').isInt(),
    check('type').matches(/^[0-1]$/).withMessage('type must be 0 or 1'),
    check('userId','userId must be int').isInt(),
    check('time','time must be int').isInt(),
    check('energy','energy must be int').isInt(),
    check('msgId').matches(/[a-zA-Z0-9]{8}/i).withMessage('msgId error'),
],setChargingStart.post)


router.post('/setChargingEnd',[
    check('deviceId','deviceId must be int ').isInt(),
    check('msgId').matches(/[a-zA-Z0-9]{8}/i).withMessage('msgId error'),
],setChargingEnd.post)


router.post('/getChargerStatus',[
    check('deviceId','deviceId must be int ').isInt(),
    check('msgId').matches(/[a-zA-Z0-9]{8}/i).withMessage('msgId error'),
],getChargerStatus.post)

router.post('/getChargingInfo',[
    check('deviceId','deviceId must be int ').isInt(),
    check('msgId').matches(/[a-zA-Z0-9]{8}/i).withMessage('msgId error'),
],getChargingInfo.post)

router.post('/getAllInfo',[
    check('msgId').matches(/[a-zA-Z0-9]{8}/i).withMessage('msgId error'),
],getAllInfo.post)

router.post('/changeDeviceVersion',[
    check('msgId').matches(/[a-zA-Z0-9]{8}/i).withMessage('msgId error'),
    check('ownerId','ownerId must be int ').isInt(),
    check('deviceId','deviceId must be int ').isInt(),
    check('oldVersionId','oldVersionId must be int ').isInt(),
    check('newVersionId','newVersionId must be int ').isInt(),
],changeDeviceVersion.post)

router.post('/getCurVersion',[
    check('deviceId','deviceId must be int ').isInt(),
    check('msgId').matches(/[a-zA-Z0-9]{8}/i).withMessage('msgId error'),
],getCurVersion.post)

module.exports = router;