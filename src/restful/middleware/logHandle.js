module.exports = function(req,res,next) {
    let {socketServer} = req.app.locals
    let log = socketServer.services.LOG;
    log.appLogHandler(req,res,'access-log')
    next()
}