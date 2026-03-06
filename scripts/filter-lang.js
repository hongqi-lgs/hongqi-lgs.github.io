'use strict';

// 首页显示所有文章，前端 i18n.js 根据语言动态过滤显示
// 分页问题：前端过滤会导致每页显示数量不一致，这是已知限制

// 给每篇文章注入 data-post-lang 属性，方便前端识别
hexo.extend.filter.register('after_post_render', function (data) {
  const categories = data.categories ? data.categories.map(cat => cat.name) : [];
  let lang = 'zh-CN';
  if (categories.includes('English')) {
    lang = 'en';
  } else if (categories.includes('Japanese')) {
    lang = 'ja';
  }
  // 在文章摘要和内容中注入标记（用于首页卡片识别）
  data.lang_mark = lang;
  return data;
});

// 覆盖 index generator，包含所有文章，但给每篇文章添加语言标记
hexo.extend.generator.register('index', function (locals) {
  const config = this.config;
  const posts = locals.posts.sort(config.index_generator.order_by || '-date');

  const paginationDir = config.pagination_dir || 'page';
  const perPage = config.index_generator.per_page != null ? config.index_generator.per_page : config.per_page;
  const path = config.index_generator.path || '';

  const pages = perPage ? Math.ceil(posts.length / perPage) : 1;
  const result = [];

  for (let i = 0; i < pages; i++) {
    const start = i * (perPage || posts.length);
    const end = perPage ? start + perPage : posts.length;
    const pagePosts = posts.slice(start, end);

    result.push({
      path: i === 0 ? (path || 'index.html') : (path ? path + '/' : '') + paginationDir + '/' + (i + 1) + '/index.html',
      data: {
        base: path ? '/' + path + '/' : '/',
        total: pages,
        current: i + 1,
        current_url: i === 0 ? (path ? '/' + path + '/' : '/') : '/' + (path ? path + '/' : '') + paginationDir + '/' + (i + 1) + '/',
        posts: pagePosts,
        prev: i > 0 ? (i === 1 ? (path ? '/' + path + '/' : '/') : '/' + (path ? path + '/' : '') + paginationDir + '/' + i + '/') : 0,
        prev_link: i > 0 ? (i === 1 ? (path ? '/' + path + '/' : '/') : '/' + (path ? path + '/' : '') + paginationDir + '/' + i + '/') : '',
        next: i < pages - 1 ? '/' + (path ? path + '/' : '') + paginationDir + '/' + (i + 2) + '/' : 0,
        next_link: i < pages - 1 ? '/' + (path ? path + '/' : '') + paginationDir + '/' + (i + 2) + '/' : ''
      },
      layout: ['index', 'archive']
    });
  }

  return result;
});
