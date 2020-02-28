/**
 * 自动生成版本号plugin created by fog  globalObject
 */
const VersionPatch = require('./versionPatch')
const { pluginName }= require('./help')

class VersionPatchPlugin {
  options = { ignoreMode: false }
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
            // 生产环境或忽略mode 生成版本文件
            if( this.options.ignoreMode || compiler.options.mode === 'production'){
              await versionPatch.generateVerFile(compilation)
              versionPatch.addVersionToBundle(compilation)
            }
            resolve()
          }catch(err){
            return reject(err)
          }
        })
      })
   
  }
}

module.exports = VersionPatchPlugin