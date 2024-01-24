const DB = require('./db');

module.exports = {
    /*是否打开调试推送,此时可以讲消息推送到调试界面*/
    PUSH_DEBUG: true,

    /***用来创建客户端的交互界面*******/
    CLIENT_SERVER_PORT: 44444,

    /*device 通道地址*/
    SOCKET_PORT: 44441,

    /*http  通道地址*/
    SERVER_PORT: 44442,

    /*设备消息上报的超时时间*/
    NOTIFY_OVERTIME: 5000,

    /*提醒间隔，默认为离失效期的 7 天前*/
    REMINDER_INTERVAL: 7,

    /*提醒日期，默认为每天早上 8：00*/
    REMINDER_TIME: 7,

    /*提醒频次，默认为每天早上 8：00 1 次，多次则利用 24/n 计算每天提醒间隔*/
    REMINDER_TIMES: 1,

    /*静态文件存储路径*/
    STATIC_SOURCE_PATH: "./static",

    /*控制控制台日志输出级别*/
    LOG_LEVEL: 'debug',
    /*日志文件存储位置*/
    //应用层接口日志
    //__dirname 表示配置文件所在位置
    //todo 这里的相对路径是相对 log 脚本而言的,后续应该为相对配置文件路径
    //todo 需要检测运行环境来给不同配置项
    //设置 log 路径
    //将新端口的测试文件和接口合并
    LOG_PATH:  '/usr/local/var/log/charger',

    /*服务器未知异常的记录位置*/

    /*device 最大连接数量*/
    MAX_CONNECTIONS: 300,

    /*关闭 http 端口监听*/
    DISABLE_HTTP_POST: false,

    /*设备升级文件存储位置*/
    //todo 项目 ota 文件应该在相同目录
    OTA_PATH: "/usr/local/var/ota/",

    /*默认的过期日期单位为天*/
    DEFAULT_EXPIRE_TIME: 365,
    /*设备默认使能*/
    DEFAULT_AVAILABLE: true,


    /*设备升级文件一次传送最大尺寸限定为 200 kB*/
    OTA_MAX_SIZE: 200 * 1024,

    /*device 心跳的时间间隔，单位 ms*/
    HEART_INTERVAL: 1000 * 60,

    /*smtp 配置参见:https://nodemailer.com/smtp/#authentication*/
    SMTP: {
        /*smtp 主机*/
        host: 'smtp.163.com',
        port: 465, //默认  smtp 端口
        secureConnection: true, // 默认开启 ssl
        auth: {
            //发送账户名称
            user: 'locketestemail@163.com',
            //发送账户授权码
            pass: '357159Cl'
        }
    },

    /*邮件报告服务器错误的发送列表*/
    //1225886492@qq.com,286655357@qq.com,Locke.Cheng@wpi-group.com
    MAIL_USER: 'locketestemail@163.com,Locke.Cheng@wpi-group.com', //Orange.Cai@wpi-group.com
    DB: DB,
    //短信服务
    MESSAGE_SERVER: {
        URL: "http://www.17int.cn/xxsmsweb/smsapi/send.json",
        USER_NAME: 'zsydhy',
        USER_PASSWD: 'zsydhy123',
        NOTIFY_ADMIN:'15871556575,15913153393',
        NODE_ADMIN:'15871556575'
    },
    //设备推送的容错率,默认为 3
    //查过 3 次会触发错误推送
    ERROR_TOLERANT_TIMES:3
};







