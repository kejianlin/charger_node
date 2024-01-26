const PORT = 11113;

const debug = require('debug')('socket:demo');
const SocketServer = require('sockets-server');
const Socket = require('net').Socket;
const socket = new Socket({

});
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


const socketServer = new SocketServer({
    /*设备消息上报的超时时间*/
    WAIT_OVERTIME: 5000,
    MAX_CONNECTIONS: 5000,
});

socketServer.listen(PORT, '0.0.0.0', function () {
    console.log('server start');
    debug(`socket server listen ${PORT}`);
    // 充电桩连接成功
    socket.connect(PORT, function () {
        debug(`simulate client connected`);
        rl.setPrompt(`enter you want send to server> `);
        rl.prompt();
    });
    // 监听充电桩发送的数据
    socket.on('data', function (data) {
        debug('client receive:', data.toString());
        rl.setPrompt(`enter you want send to server> `);
        rl.prompt();
    });
    rl.on('line', (line) => {
        switch (line.trim()) {
            case 'exit':
                rl.close();
                break;
            default:
                console.log('send to server:', line);
                socket.write(line);
                break;
        }
    }).on('close', () => {
        debug('exit now!');
        process.exit(0);
    });
});
socketServer.use(function (client, next) {
    client.write('server respond ' + client.rawData);
    next();
});


