/**
 * createNewVerison 创建版本软件软体
 *
 * 业务逻辑如下
 *
 * 1. 检查版本文件是否合法,包括
 *    1.1 文件尺寸不大于 200KB
 *    1.2 文件名称匹配正则表达式
 *    1.3 文件已存在
 * 2. 使用 md5file 生成文件名保存
 * 3. 存储信息到 device_version_info 表中
 */
const {check,validationResult} = require('express-validator/check')
const formidable = require('formidable')
const debug = require('debug')('socket:createNewVersion')
exports.post = function(req,res,next){
    const result = validationResult(req).formatWith(({ location, msg, param, value, nestedErrors }) => {
        return `${msg}`;
    });
    if (!result.isEmpty()) {
        throw new Error(result.array().join())
    }
    let {socketServer} = req.app.locals
    let {DeviceVersionInfo} = socketServer.services.DB;
    let serviceOTA = socketServer.services.OTA
    let {upload} = serviceOTA

    let fileForm = new formidable.IncomingForm({
        keepExtensions: true,
        uploadDir: serviceOTA.OTA_PATH, // 限定存储路径
        maxFieldsSize: serviceOTA.UPLOAD_MAXSIZE // 限定上传尺寸
    });

    // 处理传输错误
    fileForm.on('error',function(err){
        next(err)
    })

    fileForm.parse(req, function(err, fields, files){
        if(err){
            next(err)
        }else{
            let data = JSON.parse(fields.data)
            upload.storeOTA(files.file)
                .then((saveInfo)=>{  // 保存成功执行数据库操作
                    let deviceVersion = DeviceVersionInfo.build({
                        owner_id: data.ownerId,
                        version_sn: saveInfo.versionSN,
                        size: saveInfo.versionSize,
                        checksum: saveInfo.versionSum,
                        description: data.description,
                        version_number: saveInfo.versionNumber
                    });
                    // 返回保存行为
                    return deviceVersion.save().then(
                        ()=>{
                            // 数据保存成功，返回设备版本上传成功命令
                            res.json({
                                respType: 'createNewVersion',
                                data: {
                                    respCode: 100,
                                    version_sn: saveInfo.versionSN,
                                    size: saveInfo.versionSize,
                                    checksum: saveInfo.versionSum,
                                    version_number: saveInfo.versionNumber,
                                    description: data.description,
                                },
                            })
                            next()
                        }
                    )
                }).catch((err)=>{
                    // todo 此处为了查询校验错误信息，可查看 debug()
                    debug(err)
                    next(err)
            })
        }
    })
}