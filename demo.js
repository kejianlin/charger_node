// const PORT = 11114;
//
// const debug = require('debug')('server:demo');
// const SocketServer = require('sockets-server');
// const Socket = require('net').Socket;
// const socket = new Socket({});
// const readline = require('readline');
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
//
// const socketServer = new SocketServer({
//     /*设备消息上报的超时时间*/
//     WAIT_OVERTIME: 5000,
//     MAX_CONNECTIONS:5000,
// });
//
// socketServer.listen(PORT,'0.0.0.0',function () {
//     debug(`socket server listen ${PORT}`);
//     socket.connect(PORT,function () {
//         debug(`simulate client connected`);
//         rl.setPrompt(`enter you want send to server> `);
//         rl.prompt();
//     });
//     socket.on('data',function (data) {
//         debug('client receive:',data.toString());
//         rl.setPrompt(`enter you want send to server> `);
//         rl.prompt();
//     });
//     rl.on('line', (line) => {
//         switch (line.trim()) {
//     case 'exit':
//         rl.close();
//         break;
//     default:
//         socket.write(line);
//         break;
//     }
// }).on('close', () => {
//         debug('exit now!');
//     process.exit(0);
// });
// });
// socketServer.use(function (client,next) {
//     client.write('server respond ' + client.rawData);
//     next();
// });
//

// {"apiId":1,"versionSN":"e1bd333f7d3de8c652b97e4d5adc55ea","mac":"ffffffffffff","reconnect":0}
// {"msgId":"11111111","apiId":21,"respCode":100}
// if(typeof(a)==='undefined'){
//     console.log(1)
// }
var isAuth = function isAuth(client){
    return client.auth || null;
}
a={'auth':{'b':2}}
console.log(isAuth(a))
if(isAuth(a)){
    console.log('no delete')
}
a.auth=null
console.log(isAuth(a))
if(isAuth(a)){
    console.log('is delete?')
}
console.log(JSON.stringify(a.auth))