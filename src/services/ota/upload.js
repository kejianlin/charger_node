/**
 * 详见 {@link http://112.74.170.197:8080/book/plug/device/device-api.html#apiId-4  更新版本文件}
 *
 */
const debug = require('debug')('socket:services-ota-upload');
const {EventEmitter} = require('events');
const nodePath = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const crc = require('crc');
const md5File = require('md5-file/promise');



module.exports = class OTAUpload extends EventEmitter {
    /**
     * ota 构造函数
     * @param  {Object} options ota 配置文件
     * @param  {Object} options.UPLOAD_PATTERN ota 上传文件模式
     * @param  {Object} options.UPLOAD_MAXSIZE ota 上传文件最大尺寸
     */
    constructor(options = {}) {
        super();
        this.opts = options;
    }

    /**
     * 存储表单上传的 OTA 文件.
     * @param {Object} fileInfo 表单上传的文件对象
     * @param {String} fileInfo.name 文件名
     * @param {Date}   fileInfo.mtime 修改时间
     * @param {Number} fileInfo.size 文件尺寸
     * @param {String} fileInfo.type 文件类型
     * @param {String} fileInfo.path 文件路径
     * @return {Promise} 返回上传对象
     */
    storeOTA(fileInfo) {
        let {name,size,path} = fileInfo;
        let self = this;
        if(this.checkFile(name,size)) {
            return md5File(path).then(
                hash => {
                    return self.saveOTAFile(path,hash)
                }
            ).then( (storeInfo) => {
                //todo 此处可以封装为 promsie 对象加快速度
                let versionSum = crc.crc16(fs.readFileSync(storeInfo.savePath)).toString(16);
                let versionNumber = nodePath.basename(name, '.bin');
                return Promise.resolve({
                    savePath:storeInfo.savePath,
                    versionSN:storeInfo.versionSN,
                    versionSum,
                    versionNumber,
                    versionSize:size
                })
            })
        }
        else {
            //删除文件
            return self.clearUpload(path).then(
                () => {
                    debug(`delete ${path} success!`);
                    return Promise.reject(new Error('文件不符合上传规则'));
                }
            )
        }
    }


    /** 检查上传文件是否合法
     *
     * @param  {String} fileName 上传的文件名
     * @param {Number} size 上传的文件尺寸
     *
     * @return {boolean} 判断上传文件是否合法,true 为合法
     */
    checkFile(fileName,size) {
        //文件格式
        let checkReg = this.opts.UPLOAD_PATTERN ||  /^WPI.*V(([0-9]|([1-9]+[0-9]))\.){2}([0-9]|([1-9]+[0-9]))(?=\.bin)/g;
        debug(checkReg,size);
        //最大支持 200KB OTA 文件
        let maxSize = this.opts.UPLOAD_MAXSIZE || 200*1024;

        return (checkReg.test(fileName) && (size <= maxSize));
    }


    /**
     * 保存 OTA 文件
     * @param {String} upLoadPath 上传文件路径.
     * @param {String} versionSN 保存的文件名
     * @return {Promise} 参见 {@link https://nodejs.org/api/fs.html#fs_fspromises_rename_oldpath_newpath|rename}
     */
    saveOTAFile(upLoadPath,versionSN) {
        let otaPath = this.opts.OTA_PATH || __dirname;
        let savePath = nodePath.join(otaPath,versionSN);

        if(fs.existsSync(savePath)) {
            return Promise.reject(new Error(`file already exists!`));
        } else {
            return fsPromises.rename(upLoadPath,savePath).then(
                () => {
                    return Promise.resolve({
                        versionSN,
                        savePath
                    })
                }
            )
        }
    }

    /**
     * 清空上传文件
     * @param {String} filePath  上传文件路径
     * @return {Promise} 参见 {@link https://nodejs.org/api/fs.html#fs_fspromises_unlink_path|unlink }
     */
    clearUpload(filePath) {
        return fsPromises.unlink(filePath);
    }
}