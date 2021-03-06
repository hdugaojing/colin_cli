const fs = require('fs')
const consoler = require('../utils/consoler')
const npm = require('./install')

/* 三变量判断异步操作 */
let fileCount = 0  /* 文件数量 */
let dirCount = 0   /* 文件夹数量 */
let flat = 0       /* readir数量 */
let isInstall = false

module.exports = function(res){
    /* 创建文件 */
    consoler.green('------开始构建-------')
    // __dirname总是指向被执行js文件夹的绝对路径  /Users/Colin/Desktop/intsig-work/demo/colin_cli/src
    const sourcePath = __dirname.slice(0,-3)+'template'
    // process.cwd() 方法会返回 Node.js 进程的当前工作目录 
    consoler.blue('当前路径:'+ process.cwd())
    /* 修改package.json*/
    revisePackageJson(res, sourcePath).then(()=>{
        copy(sourcePath, process.cwd(), npm())
    })
}

/**
 * 复制文件
 * @param {*} sourcePath template资源路径
 * @param {*} currentPath 当前项目路径
 * @param {*} cb 项目复制完成回调函数 
 */
function copy (sourcePath, currentPath, cb){
    flat++
    // 读取文件
    fs.readdir(sourcePath,(err,paths)=>{
        flat--
        if(err){
            throw err
        }
        paths.forEach(path=>{
            if(path !== '.git' && path !=='package.json' ) fileCount++
            const  newSoucePath = sourcePath + '/' + path
            const  newCurrentPath = currentPath + '/' + path
            /* 判断文件信息 */
            fs.stat(newSoucePath,(err,stat)=>{
                if(err){
                    throw err
                }
                /* 判断是文件，且不是 package.json  */
                if(stat.isFile() && path !=='package.json' ){
                    /* 创建读写流 */
                    const readSteam = fs.createReadStream(newSoucePath)
                    const writeSteam = fs.createWriteStream(newCurrentPath)
                    readSteam.pipe(writeSteam)
                    consoler.green( '创建文件：'+ newCurrentPath  )
                    fileCount--
                    completeControl(cb)
                /* 判断是文件夹，对文件夹单独进行 dirExist 操作 */    
                }else if(stat.isDirectory()){
                    if(path!=='.git' && path !=='package.json' ){
                        dirCount++
                        dirExist(newSoucePath, newCurrentPath, copy, cb)
                    }
                }
            })
        })
    })
}

function dirExist(sourcePath, currentPath, copyCallback, cb){
    fs.exists(currentPath,(ext=>{
        if(ext){
            /* 递归调用copy函数 */
            copyCallback( sourcePath , currentPath,cb)
        }else {
            fs.mkdir(currentPath,()=>{
                fileCount--
                dirCount--
                copyCallback( sourcePath , currentPath,cb)
                consoler.yellow('创建文件夹：'+ currentPath )
                completeControl(cb)
            })
        }
    }))
}

function completeControl(cb){
    if(fileCount === 0 && dirCount ===0 && flat===0){
        consoler.green('------template加载完成-------')
        // if(cb && !isInstall ){
        //     isInstall = true
        //     consoler.blue('-----开始install-----')
        //     cb(()=>{
        //         consoler.blue('-----完成install-----')
        //         /* 判断是否存在webpack  */
        //         runProject()
        //     })
        // }
    }
}

function runProject(){
    try{
        const doing = npm([ 'start' ])
        doing()
    }catch(e){
       consoler.red('自动启动失败，请手动npm start 启动项目')
    }
}

/**
 * 修改package.json
 * @param {*} res 用户输入的create配置
 * @param {*} sourcePath template的绝对路径
 * @returns 
 */
function revisePackageJson(res, sourcePath){
    return new Promise((resolve)=>{
        fs.readFile(sourcePath + '/package.json',(err,data)=>{
            if(err) throw err
            const { author , name  } = res
            let json = data.toString()
            json = json.replace(/demoName/g, name.trim())
            json = json.replace(/demoAuthor/g, author.trim())
            const path = process.cwd()+ '/package.json'
            // 在当前调用路径输出package.json
            fs.writeFile(path, new Buffer(json) ,()=>{
                consoler.green( '创建文件：'+ path )
                resolve()
            })
        })
    })
}