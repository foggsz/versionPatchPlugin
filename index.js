/**
 * 自动生成版本号plugin created by fog  globalObject
 */
const VersionPatch = require('./versionPatch')
const { pluginName }= require('./help')

class VersionPatchPlugin {
  options = { forceEnablePlugin: false }
  constructor(options){
    this.options = Object.assign({}, this.options, options)
  }
  
  apply(compiler){
      compiler.hooks.emit.tapPromise(pluginName, (
        compilation
      ) => {
        return new Promise( async(resolve, reject)=>{
          try{
            let options = Object.assign({}, this.options)
            let versionPatch = new VersionPatch(options)
            // 生产环境或强制激活时候生成版本文件
            if( this.options.forceEnablePlugin || compiler.options.mode === 'production'){
              await versionPatch.generateVerFile(compilation)
            }
            if(typeof window!='undefined'){
              window._version = versionPatch.version
              window._versionHistory = versionPatch.versionHistory
            }
            resolve()
          }catch(err){
            reject(err)
          }
        })
      })
  }
}

module.exports = VersionPatchPlugin