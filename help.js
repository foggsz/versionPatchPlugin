
const pluginName = 'VersionPatchPlugin'
const versionFileName = 'version.json'
// 检查number格式
function checkNumberVersion(str=null){
    let regex=  /^[0-9]{1,2}\.[0-9]\.[0-9]{1,2}$/
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
// 获取新数字
function getCarry(a,b){
    let dict = {carry: 0, cur: a}
    let carry = Math.floor(a/b)
    if(carry > 0){
        dict['carry'] =  carry
        dict['cur'] = a%b
    }
    return dict
}
// 获取叠加后的number
function getNewNumber(oldNumber,numberStep){
    let old = oldNumber.split('.')
    let step = numberStep.split('.')
    let newNumber = []
    for(let i=0; i<old.length; i++){
        newNumber.push(Number(old[i])+Number(step[i]))
    }
    /**
     * 进位
     */
    if(newNumber.length!==3){
        throw new Error('number length is error')
    }
    let carry = getCarry(newNumber[2], 100)
    newNumber[2] = carry.cur
    newNumber[1] = newNumber[1] + carry.carry
    carry = getCarry(newNumber[1], 10)
    newNumber[1] = carry.cur
    newNumber[0] = newNumber[0] + carry.carry

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