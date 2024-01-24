/**
 * 内存监控模块用来检测 node 进行的内存使用
 * */

const util = require('util')

function MemoryWatch(){
    let _initMemory = process.memoryUsage();
    function getShowMemInfo(){
        let currentMemory = process.memoryUsage()
        return {
            initMemory: (_initMemory.heapUsed / 1024).toFixed(3) + 'KB',
            currentUse: (currentMemory.heapUsed / 1024).toFixed(3) + 'KB',
            increaseMem: (Math.abs((currentMemory.heapUsed - _initMemory.heapUsed)) / 1024).toFixed(3) + 'KB'
        }
    }
    return getShowMemInfo
}

exports.getShowMemInfo = MemoryWatch()