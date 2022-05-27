import { Context, Logger, Quester, Schema } from 'koishi'
import { LANGUAGES } from './languages'

const logger = new Logger('glot')

const GLOT_BASE = 'https://glot.io/api'

async function run(http: Quester, language: string, filename: string, code: string, stdin?: string) {
  try {
    const data = {
      files: [{
        name: filename,
        content: code,
      }]
    } as any
    if (stdin) data.stdin = stdin
    return await http.post(`/run/${language}/latest`, data)
  } catch(e) {
    logger.error(e)
    return null
  }
}

export interface Config {
  apiToken?: string
  defaultLanguage?: string
}

export const Config: Schema<Config> = Schema.object({
  apiToken: Schema.string().description('申请到的 API 令牌。'),
  defaultLanguage: Schema.string().default('javascript').description('默认的执行语言。'),
})

export const name = 'glot'

export function apply(ctx: Context, config: Config) {
  const http = ctx.http.extend({
    endpoint: GLOT_BASE,
    headers: {
      'Authorization': `Token ${config.apiToken}`,
    },
  })

  ctx.command('glot <code:rawtext>', '运行代码')
    .usage(`由 glot.io 提供的代码运行\n支持的语言: ${LANGUAGES.join(', ')}`)
    .option('language', '-l <language:string>')
    .option('stdin', '-s <stdin:string>')
    .example("glot console.log('Hello World!')")
    .action(async ({ options }, code) => {
      const languageName = options.language ?? config.defaultLanguage
      const language = LANGUAGES.find(n => n[0] === languageName)
      if (!language) {
        return '不支持的语言。'
      }
      const res = await run(http, language[0], `koishi.${language[1]}`, code, options.stdin)
      if (!res) {
        return '请求出错。'
      }
      if (res.error) {
         return `运行出错: ${res.error}\n${res.stderr}`
      }
      return res.stdout + res.stderr
    })
}
