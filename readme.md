
## Version Patch WebpackPlugin
***
一个提供自动生成版本号信息的webpack插件

### <center>Install</center>
`
npm i --save-dev version-patch-webpackplugin
`

`
yarn add --dev html-webpack-plugin
` 

插件默认会在webpack mode:production时,检查output目录下的version.json文件。不存在，则初始化生成。存在则追加一个版本信息对象。

### 版本信息对象
| 属性          |      说明           | 类型 | 默认值   |
| ------------ | ---------------------- | ------- |------- | 
| time         |  本次生成版本文件的时间字符串   | string | 当前时间 |
|number   |  在上次版本号基础上叠加  | string | 0.0.00  |

### 可选的插件配置选项
| 属性          |      说明           | 类型 | 默认值   | 可选值 |
| ------------ | ---------------------- | ------- |------- | ------- | 
| fileName         |  版本文件名称，必须为json   | string | version.json | - |
| fileNamePrefix   |  文件名前缀  | string | ''  | - |
| reWrite | 是否重写版本文件 | boolean | false | - |
| useKey | 决定版本号取时间还是数字 | string  | number | [time,number] |
| timeFormat | 可被解析的时间格式字符串 | string | YYYY-MM-DDD hh:mm:ss | - |
| numberSeed | 初始化版本号 | string | 0.0.00 | - |
| numberStep | 每次递增的值 | string | 0.0.01 | - |
| ignoreMode | 忽略环境变量mode, 所有环境下都会生成版本信息, 测试用 | boolean | false| 

### <center>Usage</center>
***
#### webpack.config.js

```
const VersionPatchPlugin = require('version-patch-webpackplugin')
module.exports = {
    mode: 'production',
    entry:'./src/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new VersionPatchPlugin(),
    ]
}
```
一切正常，会在dist目录下产生一个version.json文件, 格式如下
```
    [{
      {"time":"2020-02-57 07:09:55","number":"0.0.00"}
    }]
```
之后每次build push 一个新对象，number会根据设置的numberStep递增，time为根据timeformat的当前时间格式化字符串。
版本信息也将挂载在window对象下
```
    window._version = 0.0.00
    window._versionHistory =  [{
      {"time":"2020-02-57 07:09:55","number":"0.0.00"}
    }]
    注意如果dist没有version.json文件且在开发环境下
    window._versionHistory = [] 
    window._version = null
```
