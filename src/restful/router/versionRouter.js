var express = require('express');
var router = express.Router();
const {check,validationResult} = require('express-validator/check')
const {matchData,sanitize} = require('express-validator/filter')
/*创建版本*/
const createNewVersion = require('../device/createNewVersion')


router.post('/createNewVersion',createNewVersion.post)

module.exports = router;