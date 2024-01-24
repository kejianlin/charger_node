const  EventEmitter = require('events');
const  shortId = require('shortid');
const  HashIds =  require('hashids');
const  debug = require('debug')('socket:client');
const  LOG = require('../../src/services/log')
/**
 * 客户端模块
 * @module Client.
 */
module.exports = class Client extends  EventEmitter {
    /**
     * 实例化客户端对象
     * @param {Object} server 参见 {@link ClientServer}
     * @param {Object} socket 参见 {@link https://nodejs.org/dist/latest-v10.x/docs/api/net.html#net_event_connection|connnection}
     */
    constructor(server,socket) {
        //调用父类方法
        super();
        this.rawData = null;
        this.server = server;
        this.socket = socket;
        this.auth = undefined;
        //利用 socket 的 ip 和端口生成客户端 id
        this.clientId = socket.remoteAddress+":"+socket.remotePort;
        // 对每个实例对象都需要组装一个复合对象给 getAllInfo 使用
        this.extendClient = {
            illegal: false,
            onTime: new Date(), // todo:: 此处可以使用 moment 进行格式化
            reqTime: null, // 记录请求的接收时间
            ledStatus: 1, // 初始化灯的状态
            runStatus: 4, // 设备的运行状态
            mac: null, // 设备 mac 地址
            meterNumber: null, // 设备电表编号
            url : null, // 设备的推送地址
            ownerId: null, // 目前设备所属厂商
            id: null, // 当前设备编号
            chargingInfo: {
                userId: null,
                energy: 0,
                duration: 0,
                setDuration: 0,
                setEnergy: 0
            },          // 当前设备充电信息
            ip: socket.remoteAddress
        }
        //初始化客户端
        this.setup();
    }

    /**
     * 初始化客户端,绑定客户端原生事件
     * 'data', 'error', 'close', 'timeout','end'
     */
    setup() {
        // 由于事件为异步,在执行回调时,this 指向 socket 而非 client 对象
        // 所以需要绑定 this 为 client 防止 this 丢失
        this._ondata = this._ondata.bind(this);
        this._onerror = this._onerror.bind(this);
        this._ontimeout = this._ontimeout.bind(this);
        this._onclose = this._onclose.bind(this);
        this._onend = this._onend.bind(this);

        this.socket.setTimeout(300000);
        // 监听到数据发送
        this.socket.on('data',this._ondata);
        // 监听到错误
        this.socket.on('error',this._onerror);
        this.socket.on('timeout',this._ontimeout);
        this.socket.on('close',this._onclose);
        this.socket.on('end',this._onend);
    }


    /**
     * 委托 socket 发送客户端数据.
     * @param  {String} data
     */
    write(data) {
        let self = this;
        //记录服务器向设备发送的消息
        let logData = {
            clientIp: this.socket.remoteAddress,
            clientId: this.hasOwnProperty("auth")?this.auth.id:'-',
            label: "server-send",
            data: JSON.parse(data)
        }
        this.server.log.deviceLogHandler(logData)
        this.socket.write(data,function () {
            debug(`write to ${self.clientId} : ${data}`);
            self.emit('clientWrite',self,data);
        });

    }
    /**
     * 发送控制命令,必须等待返回值.
     * @param {Object} data json 对象.
     * @return {Promise} 设备响应结果
     *
     */
    sendCommand(data) {
        let msgId = Client.generateMsgId();
        let subData = Object.assign({},data.data,{"msgId":msgId})
        let sendData = {
            "reqType":data.reqType,
            "data":subData
        };
        //发送数据
        this.write(JSON.stringify(sendData));
        return  Promise.race([this._waitOverTime(msgId),this._bindCommand(msgId)])
    }
    destory(){
        this.socket.destory();
    }
    /**
     * 生成唯一的 msgId.
     */
    static generateMsgId() {
        let hashIds = new HashIds(shortId.generate(),8);
        return hashIds.encode(1);
    }
    _ondata(data) {
        let server = this.server;
        this.rawData = data;
        debug(`${this.clientId} send data: ${data}`);
        server.emit('clientData',this);
    }
    _onerror(err) {
        debug(err);
        this.server.log.ExceptionLogHandler(err.stack)
        //  关闭套接字
        this.socket.destroy();
    }
    _ontimeout() {
        debug('timeout');
        this.server.log.ExceptionLogHandler(`${this.extendClient.id} timeout event for destory`)
        // 关闭套接字
        this.socket.destroy();
    }
    _onclose(had_error) {
            this.server.log.ExceptionLogHandler(`${this.extendClient.id} close event for destory`)
            let server = this.server;
            let clientId = this.clientId
            if(typeof(this.auth)==='undefined'){
                server.removeClient(clientId)
            }else {
                let authId = this.auth.id;
                server.authClient[authId].extendClient.runStatus = 0
                server.authClient[authId].extendClient.ledStatus = 0
                this.server.log.ExceptionLogHandler(`${authId+server.authClient[authId].extendClient.runStatus}`)
            }
    }
    _onend() {
        debug('end');
        this.server.log.ExceptionLogHandler(`${this.extendClient.id} onend  for destory`)
    }
    /**
     * 设备的超时等待处理函数
     * @private
     */
    _waitOverTime(msgId) {
        //响应的超时等待时间
        let self = this;
        let WAIT_OVERTIME = self.server.config.WAIT_OVERTIME || 3000;

        return new Promise((resolve,reject) => {
            setTimeout(() => {
                //响应超时移除监听器
                self.removeAllListeners(msgId);
                reject(new  Error(`device no respond in ${WAIT_OVERTIME}ms`));
            },WAIT_OVERTIME)
        });
    }
    /**
     * 绑定发送命令的响应回调
     * @param {String} msgId 监听的消息 id
     */
    _bindCommand(msgId) {
        let self = this;
        return  new Promise( (resolve,reject) => {
            self.once(msgId,function (data) {
                resolve(data);
            })
        })
    }
}




