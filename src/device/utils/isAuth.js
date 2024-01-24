/**
 * 判断设备是否授权
 * @param {Client} client 客户端对象
 * @return {*|null}
 * */
exports.isAuth = function isAuth(client){
    return client.auth || null;
}
