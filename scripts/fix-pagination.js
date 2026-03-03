/**
 * 后处理 HTML：修复上下篇和相关推荐的语言混乱问题
 * 直接在 HTML 生成后替换链接
 */

'use strict';

// 语言检测函数（与 lang-filter.js 保持一致）
function detectPostLang(post) {
  if (!post) return 'zh-CN';
  if (post.lang) return post.lang;
  if (post.categories) {
    const cats = post.categories.toArray();
    if (cats.some(c => c.name === 'English')) return 'en';
  }
  if (post.slug && post.slug.endsWith('-en')) return 'en';
  return 'zh-CN';
}

// 在 after_render:html filter 中修复分页链接
hexo.extend.filter.register('after_render:html', function(html, data) {
  // 只处理文章页面
  if (!data.page || data.page.layout !== 'post') return html;
  
  const currentLang = detectPostLang(data.page);
  const posts = hexo.locals.get('posts');
  const allPosts = posts.toArray();
  
  // 按语言分组并排序
  const sameLangPosts = allPosts
    .filter(post => detectPostLang(post) === currentLang)
    .sort((a, b) => (b.date || 0) - (a.date || 0));
  
  // 找到当前文章的索引
  const currentIndex = sameLangPosts.findIndex(post => post._id === data.page._id);
  
  if (currentIndex === -1) return html;
  
  const prevPost = currentIndex > 0 ? sameLangPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < sameLangPosts.length - 1 ? sameLangPosts[currentIndex + 1] : null;
  
  // 修复上下篇导航
  const paginationRegex = /<nav class="pagination-post"[^>]*>([\s\S]*?)<\/nav>/;
  const paginationMatch = html.match(paginationRegex);
  
  if (paginationMatch) {
    let newPagination = '<nav class="pagination-post" id="pagination">';
    
    if (prevPost) {
      const prevExcerpt = (prevPost.excerpt || '').replace(/<[^>]+>/g, '').substring(0, 200);
      const prevCover = prevPost.cover || 'var(--default-bg-color)';
      const prevCoverType = prevPost.cover_type;
      const hasDesc = prevExcerpt ? '' : ' no-desc';
      const fullWidth = nextPost ? '' : ' full-width';
      
      newPagination += `<a class="pagination-related${hasDesc}${fullWidth}" href="/${prevPost.path}" title="${escapeHtml(prevPost.title)}">`;
      if (prevCoverType === 'img') {
        newPagination += `<img class="cover" src="${prevCover}" alt="cover">`;
      } else {
        newPagination += `<div class="cover" style="background: ${prevCover}"></div>`;
      }
      newPagination += `<div class="info"><div class="info-1">`;
      newPagination += `<div class="info-item-1">上一篇</div>`;
      newPagination += `<div class="info-item-2">${escapeHtml(prevPost.title)}</div></div>`;
      if (prevExcerpt) {
        newPagination += `<div class="info-2"><div class="info-item-1">${escapeHtml(prevExcerpt)}</div></div>`;
      }
      newPagination += `</div></a>`;
    }
    
    if (nextPost) {
      const nextExcerpt = (nextPost.excerpt || '').replace(/<[^>]+>/g, '').substring(0, 200);
      const nextCover = nextPost.cover || 'var(--default-bg-color)';
      const nextCoverType = nextPost.cover_type;
      const hasDesc = nextExcerpt ? '' : ' no-desc';
      const fullWidth = prevPost ? '' : ' full-width';
      
      newPagination += `<a class="pagination-related${hasDesc}${fullWidth}" href="/${nextPost.path}" title="${escapeHtml(nextPost.title)}">`;
      if (nextCoverType === 'img') {
        newPagination += `<img class="cover" src="${nextCover}" alt="cover">`;
      } else {
        newPagination += `<div class="cover" style="background: ${nextCover}"></div>`;
      }
      newPagination += `<div class="info text-right"><div class="info-1">`;
      newPagination += `<div class="info-item-1">下一篇</div>`;
      newPagination += `<div class="info-item-2">${escapeHtml(nextPost.title)}</div></div>`;
      if (nextExcerpt) {
        newPagination += `<div class="info-2"><div class="info-item-1">${escapeHtml(nextExcerpt)}</div></div>`;
      }
      newPagination += `</div></a>`;
    }
    
    newPagination += '</nav>';
    html = html.replace(paginationRegex, newPagination);
  }
  
  // 修复相关推荐：移除非同语言的文章
  const relatedRegex = /<div class="relatedPosts">([\s\S]*?)<\/div><\/div><\/div>/;
  const relatedMatch = html.match(relatedRegex);
  
  if (relatedMatch) {
    // 提取所有相关文章链接
    const relatedListRegex = /<div class="relatedPosts-list">([\s\S]*?)<\/div><\/div>/;
    const relatedListMatch = relatedMatch[0].match(relatedListRegex);
    
    if (relatedListMatch) {
      const linkRegex = /<a class="pagination-related"[^>]*href="([^"]*)"[^>]*title="([^"]*)">([\s\S]*?)<\/a>/g;
      let match;
      const validLinks = [];
      
      while ((match = linkRegex.exec(relatedListMatch[1])) !== null) {
        const path = match[1].replace(/^\//, '');
        const post = allPosts.find(p => p.path === path);
        
        if (post && detectPostLang(post) === currentLang) {
          validLinks.push(match[0]);
        }
      }
      
      if (validLinks.length > 0) {
        const newRelatedList = '<div class="relatedPosts-list">' + validLinks.join('') + '</div></div>';
        const newRelated = relatedMatch[0].replace(relatedListRegex, newRelatedList);
        html = html.replace(relatedRegex, newRelated);
      }
    }
  }
  
  return html;
});

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
