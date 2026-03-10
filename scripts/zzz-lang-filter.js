'use strict'

// 判断文章语言（与 related_post.js 保持一致）
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

// 上下篇导航：只在同语言文章中切换
hexo.extend.helper.register('post_pagination', function (page) {
  if (!page) return ''

  const currentLang = detectLang(page)
  const allPosts = hexo.locals.get('posts').toArray()
    .filter(p => detectLang(p) === currentLang)
    .sort((a, b) => b.date - a.date)

  const idx = allPosts.findIndex(p => p.path === page.path)
  if (idx === -1) return ''

  // Butterfly 默认：post_pagination=1 时，prev=新文章，next=旧文章
  const prevPost = idx > 0 ? allPosts[idx - 1] : null       // 更新的
  const nextPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : null  // 更旧的

  if (!prevPost && !nextPost) return ''

  const { url_for, _p } = this

  function renderLink(post, key, fullWidth) {
    if (!post) return ''
    const desc = post.excerpt ? post.excerpt.replace(/<[^>]+>/g, '').substring(0, 200) : ''
    const cover = post.cover || 'var(--default-bg-color)'
    const cls = ['pagination-related', !desc ? 'no-desc' : '', fullWidth ? 'full-width' : ''].filter(Boolean).join(' ')
    const align = key === 'next' ? 'text-right' : ''
    let html = `<a class="${cls}" href="${url_for(post.path)}" title="${post.title}">`
    html += post.cover_type === 'img'
      ? `<img class="cover" src="${url_for(cover)}" alt="cover">`
      : `<div class="cover" style="background: ${cover}"></div>`
    html += `<div class="info ${align}"><div class="info-1">`
    html += `<div class="info-item-1">${_p('pagination.' + key)}</div>`
    html += `<div class="info-item-2">${post.title}</div>`
    html += `</div>`
    if (desc) html += `<div class="info-2"><div class="info-item-1">${desc}</div></div>`
    html += `</div></a>`
    return html
  }

  let result = '<nav class="pagination-post" id="pagination">'
  result += renderLink(prevPost, 'prev', !nextPost)
  result += renderLink(nextPost, 'next', !prevPost)
  result += '</nav>'
  return result
})
