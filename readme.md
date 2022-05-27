# koishi-plugin-glot

[![npm](https://img.shields.io/npm/v/koishi-plugin-glot?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-glot)

在 Koishi 中使用 [glot.io](https://glot.io) 执行代码。

## 配置项

### apiToken

- 类型: `string`

申请到的 API 令牌。

### defaultLanguage 

- 类型: `string`
- 默认值: `'javascript'`

默认的执行语言。

## 指令: glot

支持的语言:

assembly, ats, bash, c, clojure, cobol, coffeescript, cpp, crystal, csharp, d, elixir,
elm, erlang, fsharp, go, groovy, haskell, idris, java, javascript, julia, kotlin, lua,
mercury, nim, nix, ocaml, perl, php, python, raku, ruby, rust, scala, swift, typescript

- 基本语法: `glot <code>`
- 选项列表:
  - -l, --language \<language> 语言
  - -s, --stdin \<stdin> 标准输入
