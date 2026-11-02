import { Context, h, Logger, Quester, Schema } from 'koishi'
import { Language, LANGUAGES } from './languages'

const logger = new Logger('glot')

const GLOT_BASE = 'https://glot.io/api'

interface RunResult {
  stdout?: string
  stderr?: string
  error?: string
}

async function run(http: Quester, language: Language, code: string, stdin?: string): Promise<RunResult | null> {
  const data = {
    action: 'run',
    data: {
      image: language.image,
      payload: {
        runInstructions: {
          buildCommands: language.buildCommands,
          runCommand: language.runCommand,
        },
        files: [{
          name: language.filename,
          content: code,
        }],
        stdin: stdin || null,
      },
    },
  }
  try {
    const res = await http.post('/mux', data) as any
    if (res?.data) return res.data
    return { error: res?.error ?? '未知错误' }
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
  apiToken: Schema.string().role('secret').description('已弃用：新版 glot.io 接口无需令牌，保留此项仅为兼容旧配置。'),
  defaultLanguage: Schema.string().default('javascript').description('默认的执行语言。'),
})

export const name = 'glot'

export function apply(ctx: Context, config: Config) {
  const http = ctx.http.extend({
    endpoint: GLOT_BASE,
  })

  ctx.command('glot <code:rawtext>', '运行代码')
    .usage(`由 glot.io 提供的代码运行\n支持的语言: ${LANGUAGES.map(n => n.name).join(', ')}`)
    .option('language', '-l <language:string>')
    .option('stdin', '-s <stdin:string>')
    .example("glot console.log('Hello World!')")
    .action(async ({ options }, code) => {
      const languageName = options.language ?? config.defaultLanguage
      const language = LANGUAGES.find(n => n.name === languageName)
      if (!language) return '不支持的语言。'
      if (!code) return '请输入代码。'
      const res = await run(http, language, code, options.stdin)
      if (!res) {
        return '请求出错。'
      }
      if (res.error) {
        return `运行出错: ${h.escape(res.error)}\n${h.escape(res.stderr ?? '')}`
      }
      return h.escape((res.stdout ?? '') + (res.stderr ?? ''))
    })
}
