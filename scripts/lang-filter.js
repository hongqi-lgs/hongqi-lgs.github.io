/**
 * 语言过滤 Helper
 * 为 Butterfly 主题的相关推荐和上下篇功能添加语言过滤
 */

'use strict';

// 共享的语言检测函数
function detectPostLang(post) {
  if (!post) return 'zh-CN';
  
  // 检查 front-matter 中的 lang 字段
  if (post.lang) return post.lang;
  
  // 检查分类中是否有 English
  if (post.categories) {
    const cats = post.categories.toArray();
    if (cats.some(c => c.name === 'English')) return 'en';
  }
  
  // 检查 slug 是否以 -en 结尾
  if (post.slug && post.slug.endsWith('-en')) return 'en';
  
  return 'zh-CN';
}

// Helper: 获取文章语言
hexo.extend.helper.register('get_post_lang', function (post) {
  return detectPostLang(post);
});

// Helper: 获取同语言的文章列表
hexo.extend.helper.register('get_posts_by_lang', function (posts, lang) {
  const get_post_lang = this.get_post_lang;
  return posts.filter(post => get_post_lang(post) === lang);
});

// 覆盖 Butterfly 主题的 related_posts helper，添加语言过滤
hexo.extend.helper.register('related_posts', function (currentPost) {
  const currentLang = detectPostLang(currentPost);
  
  const relatedPosts = new Map();
  const tagsData = currentPost.tags;

  if (!tagsData || !tagsData.length) return '';

  // 按标签找相关文章，但只选择同语言的文章
  tagsData.forEach(tag => {
    const posts = tag.posts;
    posts.forEach(post => {
      if (currentPost.path === post.path) return;
      
      // 语言过滤：只添加同语言的文章
      if (detectPostLang(post) !== currentLang) return;

      if (relatedPosts.has(post.path)) {
        relatedPosts.get(post.path).weight += 1;
      } else {
        // 获取摘要
        const getPostDesc = post.postDesc || (post.excerpt ? post.excerpt.replace(/<[^>]+>/g, '').substring(0, 200) : '');
        relatedPosts.set(post.path, {
          title: post.title,
          path: post.path,
          cover: post.cover,
          cover_type: post.cover_type,
          weight: 1,
          updated: post.updated,
          created: post.date,
          postDesc: getPostDesc,
          random: Math.random()
        });
      }
    });
  });

  if (relatedPosts.size === 0) {
    return '';
  }

  const hexoConfig = hexo.config;
  const config = hexo.theme.config;

  const limitNum = config.related_post.limit || 6;
  const dateType = config.related_post.date_type || 'created';
  const headlineLang = this._p('post.recommend');

  const relatedPostsList = Array.from(relatedPosts.values()).sort((a, b) => {
    if (b.weight !== a.weight) {
      return b.weight - a.weight;
    }
    return b.random - a.random;
  });

  let result = '<div class="relatedPosts">';
  result += `<div class="headline"><i class="fas fa-thumbs-up fa-fw"></i><span>${headlineLang}</span></div>`;
  result += '<div class="relatedPosts-list">';

  for (let i = 0; i < Math.min(relatedPostsList.length, limitNum); i++) {
    let { cover, title, path, cover_type, created, updated, postDesc } = relatedPostsList[i];
    const { escape_html, url_for, date } = this;
    cover = cover || 'var(--default-bg-color)';
    title = escape_html(title);
    const className = postDesc ? 'pagination-related' : 'pagination-related no-desc';
    result += `<a class="${className}" href="${url_for(path)}" title="${title}">`;
    if (cover_type === 'img') {
      result += `<img class="cover" src="${url_for(cover)}" alt="cover">`;
    } else {
      result += `<div class="cover" style="background: ${cover}"></div>`;
    }
    if (dateType === 'created') {
      result += `<div class="info text-center"><div class="info-1"><div class="info-item-1"><i class="far fa-calendar-alt fa-fw"></i> ${date(created, hexoConfig.date_format)}</div>`;
    } else {
      result += `<div class="info text-center"><div class="info-1"><div class="info-item-1"><i class="fas fa-history fa-fw"></i> ${date(updated, hexoConfig.date_format)}</div>`;
    }
    result += `<div class="info-item-2">${title}</div></div>`;

    if (postDesc) {
      result += `<div class="info-2"><div class="info-item-1">${postDesc}</div></div>`;
    }
    result += '</div></a>';
  }

  result += '</div></div>';
  return result;
});

// 注意：我们不在服务端修改 prev/next（会导致循环引用和栈溢出）
// 而是依赖前端 i18n.js 中的 translatePostLinks 函数来替换链接
