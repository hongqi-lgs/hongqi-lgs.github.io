'use strict'

// 判断文章语言：优先 front-matter lang 字段，其次分类名，最后文件路径后缀
function detectLang(post) {
  if (!post) return 'zh-CN'
  if (post.lang) return post.lang
  const path = post.path || post.slug || ''
  if (/-en\/?$/.test(path)) return 'en'
  if (/-ja\/?$/.test(path)) return 'ja'
  if (post.categories) {
    const cats = post.categories.toArray ? post.categories.toArray() : []
    if (cats.some(c => c.name === 'English')) return 'en'
    if (cats.some(c => c.name === 'Japanese')) return 'ja'
  }
  return 'zh-CN'
}

hexo.extend.helper.register('related_posts', function (currentPost) {
  const currentLang = detectLang(currentPost)
  const relatedPosts = new Map()
  const tagsData = currentPost.tags
  if (!tagsData || !tagsData.length) return ''

  tagsData.forEach(tag => {
    tag.posts.forEach(post => {
      if (currentPost.path === post.path) return
      if (detectLang(post) !== currentLang) return  // 只推荐同语言

      if (relatedPosts.has(post.path)) {
        relatedPosts.get(post.path).weight += 1
      } else {
        const desc = post.excerpt ? post.excerpt.replace(/<[^>]+>/g, '').substring(0, 200) : ''
        relatedPosts.set(post.path, {
          title: post.title,
          path: post.path,
          cover: post.cover,
          cover_type: post.cover_type,
          weight: 1,
          updated: post.updated,
          created: post.date,
          postDesc: desc,
          random: Math.random()
        })
      }
    })
  })

  if (relatedPosts.size === 0) return ''

  const config = hexo.theme.config
  const limitNum = (config.related_post && config.related_post.limit) || 6
  const dateType = (config.related_post && config.related_post.date_type) || 'created'
  const headlineLang = this._p('post.recommend')
  const { escape_html, url_for, date } = this

  const list = Array.from(relatedPosts.values())
    .sort((a, b) => b.weight !== a.weight ? b.weight - a.weight : b.random - a.random)

  let result = `<div class="relatedPosts"><div class="headline"><i class="fas fa-thumbs-up fa-fw"></i><span>${headlineLang}</span></div><div class="relatedPosts-list">`

  for (let i = 0; i < Math.min(list.length, limitNum); i++) {
    const { cover, title, path, cover_type, created, updated, postDesc } = list[i]
    const c = cover || 'var(--default-bg-color)'
    const t = escape_html(title)
    const cls = postDesc ? 'pagination-related' : 'pagination-related no-desc'
    const d = dateType === 'created' ? date(created, hexo.config.date_format) : date(updated, hexo.config.date_format)
    const icon = dateType === 'created' ? 'fa-calendar-alt' : 'fa-history'
    result += `<a class="${cls}" href="${url_for(path)}" title="${t}">`
    result += cover_type === 'img' ? `<img class="cover" src="${url_for(c)}" alt="cover">` : `<div class="cover" style="background: ${c}"></div>`
    result += `<div class="info text-center"><div class="info-1"><div class="info-item-1"><i class="far ${icon} fa-fw"></i> ${d}</div><div class="info-item-2">${t}</div></div>`
    if (postDesc) result += `<div class="info-2"><div class="info-item-1">${postDesc}</div></div>`
    result += `</div></a>`
  }

  result += '</div></div>'
  return result
})
