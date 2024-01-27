`use strict`;


const debug = require('debug')('socket:server');
const net = require('net');

const { Server } = net;

const request = require('request')
const Client = require('./Client');
const ClientRouter = require('./router/index');
const slice = Array.prototype.slice;


const parsePath = require('./middlerware/parsePath');
const parserData = require('./middlerware/parseData');

const LOG = require('../../src/services/log')
const logConfig = require('config')
/**
 * 创建设备服务器对象.
 * 继承原生 server 对象,详见 {@link https://nodejs.org/dist/latest-v10.x/docs/api/net.html#net_class_net_server|net.server}.
 * @module ClientServer
 */

module.exports = class ClientServer extends Server {
    /**
     * 实例化设备服务器对象.
     *
     * @param {Object} config 配置项
     * @param {String} config.CLIENT 客户端配置项.
     * @param {Number} config.CLIENT.WAIT_OVERTIME 客户端响应的超时时间设定.
     * @param {Function} config.parserData 定义客户端数据的解析规则
     * @param {Function} config.parserPath 定义客户端路径解析规则
     * @param {String} config.MAX_CONNECTIONS 服务器允许的最大连接数量.
     * @param {Object} options 参见 {@link https://nodejs.org/dist/latest-v8.x/docs/api/net.html#net_net_createserver_options_connectionlistener|options}.
     * @param {Object} connectionListener {@link https://nodejs.org/dist/latest-v8.x/docs/api/net.html#net_net_createserver_options_connectionlistener|connectionLisner}.
     * @return {clientServer} 返回一个 socketServer
     */
    constructor(config = {
        parsePath: null,
        parserData: null
    }, options = {
    }, connectionListener = null) {
        super(options, connectionListener);
        //所有连接
        this.onlineNum = 0;
        //保存所有 socket 句柄
        this.client = {};
        //保存所有授权通过的 clientId
        this.authClient = {};

        //在实例化时定义服务
        this.services = {};
        //设备服务器配置项
        this.config = config;
        //连接数
        this.connectNum = 0;
        //服务器最大连接数量
        this.MAX_CONNECTIONS = (config && config.MAX_CONNECTIONS) || 100;
        //初始设定 clientServer
        this.setup();
        this.log = new LOG(logConfig.LOG)
    }

    /**
     * DeviceServer 初始化操作.
     */
    setup() {

        this._onconnection = this._onconnection.bind(this);
        this._onclientData = this._onclientData.bind(this);


        //加载路由
        this.lazyRouter();

        //连接函数绑定监听方法
        this.on('connection', this._onconnection);
        //绑定推送数据事件
        this.on('clientData', this._onclientData);
    }


    /**
     * 加载路由模块
     */
    lazyRouter() {
        if (!this._router) {
            this._router = new ClientRouter();
            //此处加载内部中间件
            //若自定义了内容解析器,则加载该解析器
            this._router.use(parserData({
                parser: this.config.parserData
            }));
            this._router.use(parsePath({
                parser: this.config.parserPath
            }));
        }
    };

    /**
     * 添加客户端.
     *
     */
    addClient(client) {
        let clientId = client.clientId;
        this.client[clientId] = client;
        this.emit('newClient', client);
    }

    /**
     * 添加授权客户端的句柄.
     */
    addAuthClient(client) {
        let { id } = client.auth;
        this.authClient[id] = client;
        this.emit('newAuthClient', client);
    }
    /**
     * 控制连接数量
     */
    manageConnectNumber(cb) {
        let self = this;
        this.getConnections(function (err, count) {
            if (err) {
                cb(err);
            }
            else {
                self.connectNum = count;
                if (self.connectNum > self.MAX_CONNECTIONS) {
                    cb(new Error(`device connect over max number ${self.MAX_CONNECTIONS}`))
                } else {
                    cb(null, true);
                }

            }
        })
    }

    /**
     * 向某一 clientId 写入数据
     * @param {String} clientId 客户端的 clientId
     * @param {String} data 写入的数据,注意是字符串.
     * @param {Function=} cb 回调函数
     */
    write(clientId, data, cb = null) {
        let client = this.client[clientId];

        //客户端不存在
        if (!client) {
            throw new Error('client does not exist');
        }
        client.socket.write(data, cb);
    }

    /**
     * 向授权的设备写入数据
     * @param {Number} id 客户端的 id 标识
     * @param {String} data 写入的数据,注意是字符串.
     * @param {Function=} cb 回调函数
     */
    writeById(id, data, cb = null) {
        let client = this.authClient[id];

        //客户端不存在
        if (!client) {
            throw new Error('client does not exist');
        }
        client.socket.write(data, cb);

    }

    /**
     * 发送控制命令,必须等待返回值.
     * @param {Number} id 授权的设备 id.
     * @param {Object} data 发送的 json 对象.
     * @return {Promise} 设备响应结果
     *
     */
    sendCommand(id, data) {
        let self = this;
        let client = self.authClient[id] || null;
        //客户端不存在
        if (!client) {
            return Promise.reject(new Error('client  offline'));
        } else {
            return client.sendCommand(data);
        }
    }

    /**
     * 向所有客户端广播信息.
     * @param {Object} data 发送的 json 对象.
     * @return {Promise} 返回向所有客户端发送升级请求的结果
     */
    broadCommand(data) {
        let self = this;
        let clientAll = [];
        let { authClient } = self;

        for (let clientId in authClient) {
            let client = authClient[clientId];
            debug('broad command to client %s', client.clientId);
            clientAll.push(client.sendCommand(data));
        }
        return Promise.all(clientAll);
    }



    /**
     *
     * 定义中间件给 client 函数
     */
    use(fn) {
        let offset = 0;
        let path = '/';

        if (typeof fn !== 'function') {
            let arg = fn;


            while (Array.isArray(arg) && arg.length !== 0) {
                arg = arg[0];
            }

            if (typeof arg !== 'function') {
                offset = 1;
                path = fn;
            }
        }

        let callbacks = slice.call(arguments, offset);

        if (callbacks.length === 0) {
            throw new TypeError(`use function requires middleware functions!`);
        }

        let router = this._router;
        //挂载中间件
        callbacks.forEach(function (fn) {
            return router.use(path, fn);
        });
        //实现链式调用
        return this;
    }

    /**
     * 在 socketServer 上定义服务组件.
     * @param {Object} service 服务对象.
     * @param {String} name 服务名称可选字段.
     */
    service(service, name = service.constructor.name) {
        if (service.constructor && service.constructor.name !== 'Object') {
            if (this.services[name]) {
                throw new Error('can\'t define duplicate service,yon can set a different name')
            }
            this.services[name] = service;
            return this;
        } else {
            throw new TypeError('Service must be a Instantiated classes and constructor can\'t be an Object!');
        }
    }

    /**
     * 删除未授权的客户端
     * @param {Number} clientId
     */
    removeClient(clientId) {
        return delete this.client[clientId];
    }
    /**
     *
     * @param {Object} socket,参见 {@link https://nodejs.org/docs/latest-v8.x/api/net.html#net_event_connection|Server connection 事件}
     * @private
     */
    _onconnection(socket) {
        let self = this;
        this.manageConnectNumber(function (err) {
            if (err) {
                //todo 此处连接限制需要上报
                self.emit('overConnect', self.MAX_CONNECTIONS);
                //超出连接则关闭当前 socket
                socket.destroy();
            } else {
                //设置接收格式为 utf-8
                socket.setEncoding('utf8');
                //传入客户端配置项
                let client = new Client(self, socket);
                self.addClient(client);
            }

        })
    }
    getCurrentDateTimeString() {
        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');
        const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');

        // 拼接成你需要的格式
        const formattedDateTimeString = `${year}/${month}/${day}/${hours}/${minutes}/${seconds}/${milliseconds}`;

        return formattedDateTimeString;
    }

    handleHeartbeat(client) {
        // 更新连接的活跃状态
        // clients[clientId].lastHeartbeat = Date.now();
        if (client.rawData.includes("_T00001")) {
            // 根据心跳数据包进行相应处理
            debug('收到 心跳包 ');
            const response = "_S00001/0025:01/" + this.getCurrentDateTimeString() + "\r\n";
            client.sendCommand(response)
        }
    }

    /**
     * 处理客户端的数据请求
     * @param {Client} client,详见 {@link ClientServer|client}
     * @private
     */
    _onclientData(client) {
        let router = client.server._router;
        debug('receive clientData event!');
        //无需在注入回调
        //记录 devie-data 设备发送的消息，写入日志
        this.handleHeartbeat(client)
        try {
            let logData = {
                clientIp: client.socket.remoteAddress,
                clientId: typeof (client.auth) === 'undefined' ? '-' : client.auth.id,
                label: "device-send",
                data: JSON.parse(client.rawData)
            }
            this.log.deviceLogHandler(logData)
        } catch (err) {
            debug('parser json fail: %s', err.message);
        }
        router.handle(client);
    }
    notify(clientId, notifyData, postUrl) {
        request.post({ url: postUrl, formData: notifyData }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('failed:', err);
            }
            debug('Server responded with:', body);
            debug(httpResponse)
        });
    }
}