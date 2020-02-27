
const pluginName = 'VersionPatchPlugin'
const versionFileName = 'version.json'
// 检查number格式
function checkNumberVersion(str=null){
    let regex=  /^[0-9]{1,3}\.[0-9]\.[0-9]{1,2}$/
    if(str){
        return regex.test(str)
    }
    // 检查版本号种子是否正确
    if(!regex.test(this.numberSeed)){
        throw new Error('numberSeed format is error')
    }
    // 检查版本号自动增加步数是否正确 
    if(!regex.test(this.numberStep)){
        throw new Error('numberStep format is error')
    }
    return true
}

// 获取叠加后的number
function getNewNumber(oldNumber,numberStep){
    let old = oldNumber.split('.')
    let step = numberStep.split('.')
    let newNumber = []
    for(let i=0; i<old.length; i++){
        newNumber.push(Number(old[i])+Number(step[i]))
    }
    newNumber = newNumber.join('.')
    if(!checkNumberVersion(newNumber)){
        throw new Error('number plus numberStep is exceed')
    }
    return newNumber

}
module.exports =  {
    pluginName,
    checkNumberVersion,
    getNewNumber,
    versionFileName
}