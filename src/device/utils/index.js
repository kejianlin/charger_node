const {isAuth} = require('./isAuth');
const {packageErr,packageSuccess}  = require('./packageMessage');

module.exports = {
    isAuth,
    packageSuccess,
    packageErr
};
