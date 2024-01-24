/**
 * 详见 {@link http://112.74.170.197:8080/book/plug/device/device-api.html#apiId-4  更新版本文件}
 *
 */
const debug = require('debug')('socket:services-ota');
const {EventEmitter} = require('events');
const path = require('path');
const fsPromises = require('fs').promises;
const fs = require('fs')
const crc = require('crc');

//加载上传类
const OTAUpload = require('./upload');

module.exports = class OTA extends EventEmitter {
    /**
     * ota 构造函数
     * @param  {Object} options ota 配置文件
     * @param  {Object} options.OTA_PATH ota 文件保存路径
     * @param  {Object} options.UPLOAD_PATTERN ota 上传文件模式
     * @param  {Object} options.UPLOAD_MAXSIZE ota 上传文件最大尺寸
     */
    constructor(options = {}) {
        super();
        this.opt = options;
        this.OTA_PATH = options.OTA_PATH || __dirname;
        this.upload = new  OTAUpload(options);

    }

    /**
     * 创建 ota 的发送 buffer.
     * @param {String} version ota 文件版本哈希值
     * @param {Number} offset 读取的文件偏移地址
     * @param {Number} size 读取的块区大小
     * @return {Promise} resolve 返回读取的 对应区块 buffer.
     *
     */
    createSendBuffer(version,offset,size) {
        let self = this;
        return self.readOTABlock(version,offset,size).then(
            (block) => {
                let fixedHeader = self.createHeader(block,offset,size);
                return Promise.resolve(Buffer.concat([fixedHeader, block]));
            }
        )

    }

    /**创建发送数据包的固定祯头
     * @param {Buffer} buffer 数据区块的内容
     * @param {Number} offset 读取的文件偏移地址
     * @param {Number} size 读取的块区大小
     */
    createHeader(buffer,offset,size) {
        let fixedHeader = new Buffer(14);
        let checkSum  = crc.crc16(buffer);

        fixedHeader.write('OTABIN',0);
        fixedHeader.writeUInt32BE(offset,6);
        fixedHeader.writeUInt16BE(size,10);
        fixedHeader.writeUInt16BE(checkSum,12);

        return  fixedHeader;
    }

    /**
     * 读取区块内容.
     * @param {String} version ota 文件版本哈希值
     * @param {Number} offset 读取的文件偏移地址
     * @param {Number} size 读取的块区大小
     * @return {Promise} resolve 返回读取的 对应区块 buffer.
     */
    readOTABlock(version,offset,size) {
        let self = this;
        let filename = path.join(self.OTA_PATH,version);

        return  self._getOTAHandle(filename).then(
            (fd) => {
                //important[locke] 这个地方的 buffer 应用会不会溢出
                let buffer = new Buffer(size);
                return fsPromises.read(fd, buffer, 0, size, offset).then(
                    (obj) => {
                        let num = obj.bytesRead;
                        if(size > num) {
                            debug('read  file %s ,info $O ',filename,{
                                start: offset,
                                length: size,
                                realLength: num
                            });
                            buffer = buffer.slice(0, num);
                        }
                        return Promise.resolve(buffer)
                    }
                )
            }
        )
    }
    /**
     * 获取 ota 文件句柄,对原生 node 文件 api 进行封装,
     * @param {String} filename 读取 ota 文件名
     * @return {Promise} 返回文件句柄,详见 {@link http://nodejs.cn/api/fs.html#fs_fspromises_open_path_flags_mode|fsPromises.open}
     */
    _getOTAHandle(filename) {
        return new Promise(function(resolve,reject){
            fs.open(filename,'r',function(err,fd){
                if(err){
                    reject(err)
                }else{
                    resolve(fd)
                }
            })
        })
    }
}