module.exports = function(err,req,res,next) {
    if(err) {
        // todo::将错误写入文件
        let {socketServer} = req.app.locals
        let log = socketServer.services.LOG;
        let errorData = {
            "respType": req.url.replace(/\/command\/|\/version\//g, ''),
            "data": {
                respCode: 4,
                errMsg: err.message
            },
        }
        log.ExceptionLogHandler(JSON.stringify(errorData))
        res.json(errorData);
    }
    next(err);
}