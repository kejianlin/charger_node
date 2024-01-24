const deviceRouter = require('./deviceRouter')
const versionRouter = require('./versionRouter')


module.exports = function(app){
    app.use('/command',deviceRouter)  //创建对应的路由
    app.use('/version',versionRouter) //创建文件路由
}