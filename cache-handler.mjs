import chalk from 'chalk'
import { promises as fs } from 'fs'
import path from 'path'

const CACHE_DIR = path.resolve('.cache') // название директории кэша может быть любым
const TAGS_MANIFEST = path.join(CACHE_DIR, 'tags-manifest.json')

// Создаем директорию кэша
;(async () => {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    console.log(chalk.blue('🔧 Директория кэша инициализирована'))
  } catch (err) {
    console.error('Провал инициализации директории кэша', err)
  }
})()

// Загружает манифест тегов
async function loadTagsManifest() {
  try {
    const data = await fs.readFile(TAGS_MANIFEST, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { items: {} }
    }
    throw err
  }
}

// Обновляет манифест тегов
async function updateTagsManifest(tag, revalidatedAt) {
  const manifest = await loadTagsManifest()
  manifest.items[tag] = { revalidatedAt }
  await fs.writeFile(TAGS_MANIFEST, JSON.stringify(manifest))
}

// Класс для работы с кэшем
class CacheHandler {
  constructor() {
    this.cacheDir = CACHE_DIR
  }

  // Возвращает путь к файлу по ключу
  getFilePath(key) {
    const sanitizedKey = key.trim()
    const fileName = encodeURIComponent(sanitizedKey)
    return path.join(this.cacheDir, fileName)
  }

  // Возвращает данные из кэша по ключу
  async get(key) {
    const filePath = this.getFilePath(key)

    try {
      const data = await fs.readFile(filePath, 'utf8')
      const entry = JSON.parse(data)
      const { value, lastModified } = entry

      let cacheTags = entry.tags

      if (
        (!cacheTags || cacheTags.length === 0) &&
        value.headers &&
        value.headers['x-next-cache-tags']
      ) {
        cacheTags = value.headers['x-next-cache-tags'].split(',')
      }

      const tagsManifest = await loadTagsManifest()

      // Проверяем актуальность кэша
      let isStale = false
      for (const tag of cacheTags || []) {
        const tagData = tagsManifest.items[tag]
        if (tagData && tagData.revalidatedAt > lastModified) {
          isStale = true
          console.log(
            chalk.red(
              `♻️ Сущность кэша для ключа ${chalk.bold(
                key,
              )} устарела согласно ревалидации тега ${chalk.bold(tag)}`,
            ),
          )
          break
        }
      }

      if (isStale) {
        console.log(
          chalk.yellow(
            `⚠️ Сущность кэша для ключа ${chalk.bold(key)} устарела`,
          ),
        )
        return null
      }

      console.log(chalk.green(`✅ Обнаружен кэш для ключа: ${chalk.bold(key)}`))
      return {
        lastModified,
        value,
      }
    } catch (err) {
      console.log(
        chalk.yellow(`⚠️ Не обнаружен кэш для ключа: ${chalk.bold(key)}`, err),
      )
      return null
    }
  }

  // Записывает данные (сущность) в кэш
  async set(key, data, ctx = {}) {
    let tags = ctx.tags || []

    if (data && data.headers && data.headers['x-next-cache-tags']) {
      const headerTags = data.headers['x-next-cache-tags'].split(',')
      tags = [...new Set([...tags, ...headerTags])]
    }

    const entry = {
      value: data,
      lastModified: Date.now(),
      tags,
    }

    const filePath = this.getFilePath(key)

    try {
      await fs.writeFile(filePath, JSON.stringify(entry))
      console.log(
        chalk.cyan(`📥 В кэш записаны данные для ключа: ${chalk.bold(key)}`),
      )
      if (tags.length > 0) {
        console.log(chalk.gray(`   Теги: ${tags.join(', ')}`))
      }
    } catch (err) {
      console.error(`Провал записи в кэш данных для ключа: ${key}`, err)
    }
  }

  // Обновляет теги
  async revalidateTag(tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags]
    console.log(
      chalk.magenta(`🔄 Обновление тегов: ${chalk.bold(tagsArray.join(', '))}`),
    )

    const now = Date.now()

    for (const tag of tagsArray) {
      await updateTagsManifest(tag, now)
      console.log(
        chalk.blue(
          `   ⏰ Тег ${chalk.bold(tag)} обновлен ${new Date(
            now,
          ).toISOString()}`,
        ),
      )
    }

    console.log(
      chalk.magenta(
        `✨ Завершено обновление тегов: ${chalk.bold(tagsArray.join(', '))}.`,
      ),
    )
  }
}

export default CacheHandler
