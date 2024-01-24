/**
 * 全局状态码
 * */
global.ERR_STATUS = {
    BAD_REQUEST: 4,
    ILLEGAL_DEVICE: 11,
    SUCCESS: 100,
    DEVICE_OFFINE: 103,
    TIMEOUT: 504,
    NOTIFY_ERR: 1000,
    MYSQL_ERR: 2000,
    OTA_ERR: 3000
}

global.HTTP_STATUS = {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND:404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    GONE: 410,
    PAYLOAD_TO_LARGE: 413,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    UNAVAILABLE: 503,
    TIMEOUT: 504
}

global.DEVICE_STATUS = {
    OFF_LINE: 0,
    CONNECT: 1,
    RESERVED: 3,
    IDLE: 4,
    OTA: 10,
    OTA_FAIL: 11,
    ERROR: 20
}

global.SESSION_STATUS = {
    INIT: 1 ,// 初始化
    TIMEOOUT: 1 , //响应超市
    ERROR: 2, //接收出错
    SUCCESS: 3, //接收成功
}

/**
 * 消息名称: API
 * 字段名称: ITEM
 * 消息类型: API_TYPE
 * */

const DEVICE_API = {
    /*所有接口名称*/
    NOTIFY_NEW_DEVICE: 1,  // 连接请求推送
    NOTIFY_HEART: 2,       // 心跳包推送
    NOTIFY_STATUS: 3,      // 状态变化推送
    NOTIFY_OTA: 4,         // 版本文件请求推送
    SET_CHARGING_START: 21, // 开始充电
    SET_CHARGING_END: 22,   // 结束充电
    GET_CHARGER_STATUS: 23,// 获取充电桩状态
    GET_CHARGING_INFO: 24,  // 获取正在充电的充电桩充电信息
    GET_ALL_INFO: 25,      // 获取充电桩所有信息
    SET_VERSION: 26,       // 切换设备版本
}
const APP_API = {
    /**
     * 所有接口名称
     * */
    GET_ALL_INFO: 'getAllInfo',
    SET_JSON: 'setJson',
    SET_CHARGING_START: 'setChargingStart',
    SET_CHARGING_END: 'setChargingEnd',
    GET_CHARGER_STATUS: 'getChargerStatus',
    GET_CHARGING_INFO: 'getChargingInfo',
    CREATE_NEW_VERSION: 'createNewVersion',
    CHANGE_DEVICE_VERSION: 'changeDeviceVersion'
}
const ITEM = {
    MAC: 'mac',
    TEXT: 'text',
    RECONNECT: 'reconnect',
    DEVICE_STATUS: 'deviceStatus',
    SET_DURATION: 'setDuration',
    MSG_ID: 'msgId',
    DEVICE_ID: 'deviceId',
    ORDER_ID: 'orderId',
    VERSION_ID:'versionId',
    VERSION_SN: 'versionSN',
    VERSION_SIZE: 'versionSize',
    VERSION_NUMBER: 'versionNumber',
    FILE_INFO: 'fileInfo',
    METER_NUMBER: 'meterNumber',
    URL: 'url',
    IP: 'ip',
    PORT: 'port',
    TIME: 'time',
    BIN: 'bin',
    VERSION_CHECK_SUM: 'versionCheckSum',
    DESCRP: 'description',
    IS_RECONNECT: 'isReconnect',
    MSG_TYPE: 'msgType',
    TYPE:'type',
    END_TYPE:'endType',
    MSG_SECRET: 'msgSecret',
    MSG_DATE: 'msgDate',
    MSG_DESC: 'msgDesc',
    INDEX: 'index',
    MSG_IP: 'msgIp',
    STATUS: 'status',
    BLOCK_OFFIZE: 'blockOffset',
    BLOCK_SIZE: 'blockSize',
    CHECK_SUM: 'checkSum',
    CONNECT: 'connect',
    ENERGY: 'energy',
    VOLTAGE: 'voltage',
    CURRENT: 'current',
    POWER: 'power',
    DURATION: 'duration',
    DATA: 'data',
    ERR_MSG: 'errMsg',
    RESP_CODE: 'respCode',
    RESP_TYPE: 'respType',
    REQ_TYPE: 'reqType',
    PARSE_NAME: 'apiName',
    PARSE_TYPE: 'apiType'
}
const API_TYPE = {
    NOTIFY: 'notify',  // 设备主动上报的信息
    RESPOND: 'respond', // 设备响应的结果
    APP: 'app'
}

// 数据库字段
// todo 不属于配置变量的内容应该抽离出来
const TABLE = {
    DEVICE: 'device_info', //设备信息表
    OWNER: 'device_owner_info', //设备拥有者信息表
    VERSION: 'device_version_info', // 版本信息表
}
// 定义字段常量
const COULUMN = {
    PRIMARY_ID: 'id', // 所有表的主键 id
    DEIVCE_ID: 'device_id',// 引用设备信息表示的外键盘
    OWNER_ID: 'owner_id', // 引用设备拥有者信息的外键
    VERSION_ID: 'version_id', // 引用版本信息的外键
    DEVICE_SN: 'device_sn', //设备序列号
    OWNER_SN: 'owner_sn', // 设备拥有者序列号
    VERSION_NUMBER: 'version_number', //设备版本号
    VERSION_SN: 'version_sn', //设备版本唯一序列号
    CREATE_TIME: 'create_time', // 创建时间
    EXPIRE_TIME: 'expire_time', // 过期时间
    STOP_TIME: 'stop_time', //停止时间
    ACTIVE_TIME: 'active_time', //激活时间
    MAC: 'mac', //设备 mac
    AVAILABLE: 'available', //设备使能位，表示该设备是否可用
    ENABLE_BIT: 'enable_bit', //设备使能
    DESCRP: 'description', //描述信息
    NOTIFY_URL: 'notify_url', //上报的 url 地址
    SIZE: 'size', //文件尺寸单位 B
    CHECKSUM: 'checksum' //crc 16 的文件校验码
}


// 数据库字段
module.exports={
    COLUMN: COULUMN,
    TABLE: TABLE,
    ITEM: ITEM,
    DEVICE_API: DEVICE_API,
    APP_API : APP_API,
    API_TYPE: API_TYPE
}