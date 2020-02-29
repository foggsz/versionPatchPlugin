
/**
 * 自动生成版本号 created by fog
 */
const fs  = require('fs')
const moment = require('moment')
const path = require('path')
const { promisify }  =require('util')
const fsAccessAsync =  promisify(fs.access)
const  {ConcatSource }  = require('webpack-sources')
const { checkNumberVersion , getNewNumber, versionFileName} = require('./help')

class VersionPatch {
    useKey = 'number' // 取版本号的key  time/number
    timeFormat = 'YYYY-MM-DD hh:mm:ss'   // moment时间格式
    fileName = versionFileName  // 文件名
    fileNamePrefix = ''       // 文件前缀
    fullFilePath = '' // 完整路径文件
    reWrite= false    // 重写版本文件
    numberSeed = '0.00.00'     // time下，第一次生成的版本号
    numberStep = '0.00.01' //每一步自动增加的版本号
    
    constructor(options){
        let { useKey, fileName, fileNamePrefix, reWrite, timeFormat, numberSeed,  numberStep}  = options || {}
        this.useKey = useKey || this.useKey
        this.fileName = fileName || this.fileName
        this.fileNamePrefix = fileNamePrefix || this.fileNamePrefix
        this.reWrite = reWrite || this.reWrite   
        this.numberSeed = numberSeed || this.numberSeed
        this.numberStep = numberStep || this.numberStep
        this.timeFormat = timeFormat || this.timeFormat
    }
    /**
     * 版本历史记录
     */
    get versionHistory(){
        let versionHistory = []
        let fullFilePath = this.fullFilePath
        if( !fullFilePath || typeof fullFilePath !='string' ){
            throw new Error(' property fullFilePath not exists')
        }
        try{
            versionHistory = require(fullFilePath)
        }catch(err){
            versionHistory = []
            // throw new Error(`under ${path.dirname(fullFilePath)},  ${fileName}not exists, please first use build generate json File in production env.`)     
        }
        return versionHistory
    }

    set versionHistory(value){
        throw new Error(`versionHistory  can't assign value`)
    }
    
    // 获取版本号 
    get version(){
        let key = this.useKey
        const versionHistory  = this.versionHistory
        if(versionHistory.length === 0){
            return null
        }
        return versionHistory[versionHistory.length-1][key]
    }
    set version(value){
        throw new Error(`version can't assign`)
    }

    // 生产版本文件 webpack compilation对象
    async generateVerFile(compilation){
        let fileName = this.fileName

        // 校验文件名
        if(!(typeof fileName === 'string' && path.extname(fileName) ==='.json')){
            throw new Error('version file name must be a json')
        }
        //添加文件名前缀
        fileName = this.fileNamePrefix + fileName

        let outPath  = compilation.outputOptions.path
        let fullFilePath = path.resolve(outPath, fileName)
        this.fullFilePath = fullFilePath
        
        
        // 检查重写
        if(this.reWrite){
            let initVersionJson = this.initVersionJson()
            this.addAssets(compilation, fileName, initVersionJson) 
            return 
        }

        // 检查版本号种子及步数
        checkNumberVersion.call(this)

        // 初始化检查
        let isInt = true
        try{
            await fsAccessAsync(fullFilePath, fs.constants.F_OK| fs.constants.R_OK | fs.constants.W_OK )
            isInt = false
        }catch(err){
            /**
             * 不存在则生成版本文件
             */
            if(err.code === 'ENOENT'){
                let initVersionJson = this.initVersionJson()
                this.addAssets(compilation, fileName, initVersionJson)
            }else {
                throw new Error(`${fullFilePath}没有读写权限`)
            }
        }
        // 追加版本JSON
        if(!isInt){
            let versionJson = this.addToVersionJson(fullFilePath)
            this.addAssets(compilation, fileName, versionJson)
        }
        
    }
    
    // 添加资源
    addAssets(compilation, fileName,  jsonObj){
        let jsonStr = JSON.stringify(jsonObj)
        compilation.assets[fileName] = {
            source: function(){
                return jsonStr
            },
            size: function(){
                return jsonStr.length
            }
        }
    }


    // 初始化版本JSON
    initVersionJson() {
        const initNumberSeed = this.numberSeed
        let initTime = ''
        try{
            initTime = moment().format(this.timeFormat) 
        }catch(err){
            throw new Error('error moment format ')
        }
        const intVersionHistory = [{
            time: initTime,
            number: initNumberSeed
        }] 
        return intVersionHistory
    }
    
      // 追加版本JSON
      addToVersionJson(){
        let versionHistory = this.versionHistory
        let lastVersion = versionHistory[versionHistory.length-1]
        let newNumber = getNewNumber(lastVersion.number, this.numberStep)
        let newTime = moment().format(this.timeFormat)
        versionHistory.push({
            number:newNumber,
            time: newTime
        })
        return versionHistory
    }

    // 添加版本信息到文件
    addVersionToBundle(compilation){
        let entryKeys = Array.from(compilation.entrypoints.keys())
        let assets =  compilation.getAssets()
        /**
         * 寻找入口文件
         */
        let assetsKeys = assets.map(asset=>{
            return asset.name || ''
        }).filter(name=>{
            if(name.endsWith('.js')){
                let  key = name.split('.')[0]
                return ( entryKeys.indexOf(key) >= 0 )
            }
            return false
      
        })
        if(!assetsKeys.length){
            return 
        }
        let versionHistory = JSON.stringify(this.versionHistory)
        let version = JSON.stringify(this.version)
        for(let key of assetsKeys){
           compilation.updateAsset(key, (old)=>{
               return new ConcatSource(`function getVersion(){window._version= ${version} ; window._versionHistory=${versionHistory};}; getVersion();`, old)
           })
        }
        
    }
}

module.exports = VersionPatch

