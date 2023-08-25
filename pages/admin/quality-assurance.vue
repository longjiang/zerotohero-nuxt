<router>
  {
    path: '/:l1/:l2/admin/quality-assurance',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5">
      <div class="row">
        <div :class="{ 'col-sm-12 mb-5': true }">
          <h1>Quality Assurance Checklist</h1>
          <ul>
            <li v-for="route in routes" :key="route">
              <nuxt-link :to="route">{{ route }}</nuxt-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const popularPaths = `/
/dashboard
/en/zh/explore-media
/en/zh/dictionary
/language-map
/register
/en/zh/reader
/login
/zh/en/explore-media
/en/zh/set-content-preferences
/en/zh/grammar
/en/zh/set-language-level
/en/zh/learning-path
/en/zh/explore/levels
/en/ja/explore-media
/en/zh/profile
/en/zh/tv-shows
/zh/en/set-language-level
/en/zh/phrasebooks
/zh/en/reader
/en/en/explore-media
/zh/en/set-content-preferences
/zh/en/learning-path
/en/zh/youtube/view/MSRJY_qehlQ
/zh/en/dictionary
/go-pro
/en/zh/youtube/view/nixrQRrPy2k
/zh/en/live-tv
/en/zh/youtube/search
/en/ja/set-content-preferences
/en/zh/all-media
/en/zh/live-tv
/en/zh/youtube/view/qIko053otwQ
/en/zh/youtube/view/kqxzTZ6Jp-M
/en/zh/talks
/en/zh/settings
/en/fr/explore-media
/en/ko/explore-media
/en/zh/saved-words
/en/de/explore-media
/en/zh/explore/new-levels
/en/ja/live-tv
/en/zh/books
/en/ja/reader
/en/zh/online-courses
/en/zh/phrasebook/452
/en/es/explore-media
/en/zh/youtube/view/ppwO0lxrz5g
/zh/en/books
/en/zh/youtube/view/KlFA5qxz4iA
/zh/en/profile
/zh/en/tv-shows
/en/en/set-content-preferences
/en/zh/youtube/view/WxZvXPTBC0A
/en/zh/youtube/view/BfKhREVFLkQ
/en/zh/contact-us
/en/zh/youtube/view/iSkZytjAfks
/en/zh/youtube/view/jkN1kB2G5x0
/en/ru/explore-media
/en/en/set-language-level
/en/ja/dictionary
/en/zh/youtube/view/e21AC8qPLLA
/zh/en/talks
/en/en/reader
/en/ja/learning-path
/zh/en/phrasebooks
/en/zh/youtube/view/HqODiKTH8a4
/en/en/live-tv
/zh/en/contact-us
/zh/en/phrasebook/478
/en/zh/youtube/browse
/en/ko/set-content-preferences
/forgot-password
/en/zh/youtube/view/M8tZmljZdTA
/en/zh/youtube/view/fy3enrrXeOU
/zh/en
/en/zh/youtube/browse/all/1
/en/zh/youtube/view/vUnRePT8juE
/en/en/learning-path
/en/zh/youtube/view/jz1IgOG1lZg
/logout
/zh/en/my-text
/en/zh/youtube/view/P7Ogdtg_71w
/en/zh/youtube/view/szzpWY8_vDE
/en/en/dictionary
/zh/en/online-courses
/en/fr/set-language-level
/en/zh/my-text
/en/zh/resource/list/all/all
/en/ar/explore-media
/en/zh/web-reader
/en/zh/youtube/view/TK_WYjrcoqc
/en/zh/youtube/view/LQiWx3SrJ8Y
/en/zh/learn/hsk/1,1,1
/en/fr/set-content-preferences
/en/zh/youtube/view/pNIRHvS2bLM
/en/zh/youtube/view/jya768fqQ7g
/en/zh/youtube/view/mmDD-QWlQpU
/en/hi/explore-media
/en/ja/tv-shows`.split('\n').filter(Boolean)

export default {
  data() {
    return {
      routes: popularPaths,
    };
  },
};
</script>
