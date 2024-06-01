import { DIRECTUS_URL } from "./lib/utils";
import { $content } from '@nuxt/content'; // Originally const { $content } = require("@nuxt/content"); inside the routes function before upgrading to Nuxt Bridge
import { defineNuxtConfig } from '@nuxt/bridge'

let popularPaths = `/
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
/en/ja/tv-shows`
  .split("\n")
  .filter(Boolean);

const excludePaths = ["/zh/en/online-courses", "/en/zh/online-courses"];

popularPaths = popularPaths.filter((path) => !excludePaths.includes(path));

popularPaths = popularPaths.map((path) =>
  path.replace("/youtube/view/", "/video-view/youtube/")
);

const hostname = process.env.URL ? process.env.URL : "http://localhost:3000";

const routes = async () => {
  const files = await $content().only(["path"]).fetch();

  return files
    .map((file) => (file.path === "/index" ? "/" : file.path))
    .concat(["/privacy-policy", "/"])
    .concat(popularPaths);
};

let defaultDateTimeFormat = {
  short: {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  long: {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  },
};

let dateTimeFormats = {};

for (let lang of "af ar ca zh hr nl en fi fr de el hi hu id ga it ja ko la nan no pl pt ro ru sr es sw sv th tr vi".split(
  " "
)) {
  dateTimeFormats[lang] = defaultDateTimeFormat;
}

const childProcess = require("child_process");

let COMMIT_REF, BRANCH, TAG;

try {
  COMMIT_REF =
    process.env.COMMIT_REF ||
    childProcess.execSync("git rev-parse HEAD").toString().trim();
  BRANCH =
    process.env.BRANCH ||
    childProcess.execSync("git symbolic-ref --short HEAD").toString().trim();
  TAG =
    process.env.TAG ||
    childProcess.execSync("git describe --tags --abbrev=0").toString().trim();
} catch (error) {
  console.error("Error while getting Git information:", error);
}


export default defineNuxtConfig({
  bridge: false,
  env: {
    baseUrl: hostname,
    openAIToken: process.env.OPEN_AI_TOKEN,
    COMMIT_REF,
    BRANCH,
    TAG,
  },
  // server: {
  //   host: '0.0.0.0' // default: 'localhost'
  // },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "Language Player",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content:
          "viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
      },
      { name: "apple-itunes-app", content: "app-id=1623985525" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/img/icons/favicon.ico" },
      {
        rel: "stylesheet",
        href: "/vendor/fontawesome-pro-6.1.1-web/css/all.min.css",
      },
      { rel: "stylesheet", href: "/fonts/fonts.css" },
      { rel: "stylesheet", href: "/vendor/octicons/octicons.css" },
      // { rel: 'stylesheet', href: '/vendor/bootstrap/bootstrap.min.css' },
      // { rel: 'stylesheet', href: '/vendor/bootstrap-vue/bootstrap-vue.min.css' }
    ],
    script: [
      { hid: "russian-legacy", src: "/js/russian-legacy.js", defer: true },
      {
        hid: "papaparse",
        src: "/vendor/papaparse/papaparse.min.js",
        defer: true,
      },
      { hid: "jquery", src: "/vendor/jquery/jquery.min.js", defer: true },
      { hid: "axios", src: "/vendor/axios/axios.min.js", defer: true },
      {
        hid: "underscore",
        src: "/vendor/underscore/underscore.js",
        defer: true,
      },
      { hid: "hls", src: "/vendor/hls.js@1.4.0/hls.min.js", defer: true },
    ],
  },

  router: {
    middleware: ["language-switch", "redirectPaths"],
    extendRoutes(routes, resolve) {
      const customRoutes = [
        {
          name: "assign-lesson-videos",
          path: "/:l1/:l2/admin/assign-lesson-videos/:level?/:lesson?",
          component: "./pages/admin/assign-lesson-videos",
        },
        {
          name: "l1-l2-lesson-videos",
          path: "/:l1/:l2/lesson-videos/:level?/:lesson?",
          component: "./pages/_l1/_l2/chinese/lesson-videos",
        },
        {
          name: "compare-languages",
          path: "/compare-languages/:bookId?/:en?/:wiktionary?",
          component: "./pages/compare-languages",
        },
        {
          name: "l1-l2-reddit-articles",
          path: "/:l1/:l2/articles/reddit/:method?/:args?",
          component: "./pages/_l1/_l2/articles/reddit",
        },
        {
          name: "l1-l2-wiki-articles",
          path: "/:l1/:l2/articles/wiki/:method?/:args?",
          component: "./pages/_l1/_l2/articles/wiki",
        },
        {
          name: "l1-l2-audiobooks",
          path: "/:l1/:l2/audiobooks/:category?/:tag?/:level?",
          component: "./pages/_l1/_l2/audiobooks",
        },
        {
          name: "l1-l2-book-index",
          path: "/:l1/:l2/book/index",
          component: "./pages/_l1/_l2/book/index",
        },
        {
          name: "l1-l2-dictionary",
          path: "/:l1/:l2/dictionary/:method?/:args?",
          component: "./pages/_l1/_l2/dictionary",
        },
        {
          name: "l1-l2-discover-shows",
          path: "/discover-shows/:l1?/:l2?/:type?",
          component: "./pages/discover-shows",
        },
        {
          name: "l1-l2-youtube-search-results",
          path: "/:l1/:l2/youtube/search/:term?/:start?",
          component: "./pages/_l1/_l2/youtube/search.vue",
        },
        {
          name: "l1-l2-youtube-playlist",
          path: "/:l1/:l2/youtube/playlist/:playlist_id?/:title?",
          component: "./pages/_l1/_l2/youtube/playlist.vue",
        },
        {
          name: "l1-l2-gutenberg",
          path: "/:l1/:l2/gutenberg/:id/:page?/:title?",
          component: "./pages/_l1/_l2/gutenberg.vue",
        },
        {
          name: "l1-l2-chinese-separable",
          path: "/:l1/:l2/separable/:method?/:args?",
          component: "./pages/_l1/_l2/chinese/separable.vue",
        },
        {
          name: "l1-l2-youtube-channel",
          path: "/:l1/:l2/youtube/channel/:channel_id?/:title?",
          component: "./pages/_l1/_l2/youtube/channel.vue",
        },

        {
          name: "l1-l2-video-view-type",
          path: "/:l1/:l2/video-view/:type/:youtube_id?/:directus_id?/:lesson?",
          component: "./pages/_l1/_l2/video-view/_type.vue",
        },
        {
          name: "l1-l2-learn",
          path: "/:l1/:l2/learn/:method?/:argsProp?/:index?",
          component: "./pages/_l1/_l2/learn",
        },
        {
          name: "l1-l2-page",
          path: "/:l1/:l2/page/:id/:title?",
          component: "./pages/_l1/_l2/page/_id",
        },
        {
          name: "l1-l2-phrase-search-term",
          path: "/:l1/:l2/phrase/search/:term?/:dict?",
          component: "./pages/_l1/_l2/phrase/search/_term",
        },
        {
          name: "l1-l2-phrasebook",
          path: "/:l1/:l2/phrasebook/:bookId/:phraseId/:phrase?",
          component: "./pages/_l1/_l2/phrasebook/_bookId/_phraseId",
        },
        {
          name: "l1-l2-tv-shows",
          path: "/:l1/:l2/tv-shows/:category?/:tag?/:level?",
          component: "./pages/_l1/_l2/tv-shows",
        },
        {
          name: "l1-l2-reader",
          path: "/:l1/:l2/reader/:method?/:arg?",
          component: "./pages/_l1/_l2/reader",
        },
        {
          name: "l1-l2-tutoring",
          path: "/:l1/:l2/tutoring/:level?",
          component: "./pages/_l1/_l2/tutoring",
        },
        {
          name: "l1-l2-talks",
          path: "/:l1/:l2/talks/:category?/:tag?/:level?",
          component: "./pages/_l1/_l2/talks",
        },
        {
          name: "l1-l2-resource-list",
          path: "/:l1/:l2/resource/list/:topic?/:type?",
          component: "./pages/_l1/_l2/resource/list",
        },
        {
          name: "l1-l2-saved-phrases",
          path: "/:l1/:l2/saved-phrases/:initId?",
          component: "./pages/_l1/_l2/saved-phrases",
        },
      ];

      // Check if routes contain a custom route, if not, add it, otherwise update it
      for (const route of customRoutes) {
        const index = routes.findIndex((r) => r.name === route.name);
        if (index === -1) {
          routes.push({
            name: route.name,
            path: route.path,
            component: resolve(__dirname, route.component),
          });
        } else {
          routes[index] = {
            ...routes[index],
            path: route.path,
            component: resolve(__dirname, route.component),
          };
        }
      }
      routes.forEach(route => {
        route.props = true; // Enable props throughout
        route.path = route.path?.replace('/:l2?', '/:l2'); // Make sure l2 is required
      });
    },
  },

  vue: {
    config: {
      runtimeCompiler: true,
    },
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: {
    dirs: ["~/components"],
  },

  pwa: {
    icon: {
      fileName: "icon4.png", // Renamed from icon.png in order for the pwa module to regenerate updated icons
      purpose: "maskable", // So that the user's os will add masking/padding around the icon (rounded corner, circle, etc)
    },
    manifest: {
      name: "Language Player",
      short_name: "Language Player",
      description: "Learn languages with videos.",
      theme_color: "#1d1d1d",
      useWebmanifestExtension: false,
    },
    workbox: {
      cacheAssets: [
        "/workers/dict-worker.js",
        "/js/dialect-dict.js",
        "/js/ecdict.js",
        "/js/edict.js",
        "/js/freedict.js",
        "/js/hsk-cedict.js",
        "/js/kengdic.js",
        "/js/klingonska.js",
        "/js/openrussian.js",
        "/js/russian-legacy.js",
        "/js/wiktionary.js",
      ],
      runtimeCaching: [
        {
          urlPattern: "http://server.chinesezerotohero.com/.*",
          handler: "CacheFirst",
          options: {
            cacheName: "dictionaries",
            expiration: {
              maxEntries: 10,
            },
          },
        },
      ],
    },
  },

  modules: [
    "bootstrap-vue/nuxt",
    "@nuxtjs/sitemap",
    "@nuxtjs/axios",
    "@nuxt/content",
    [
      "nuxt-i18n",
      {
        locales: [
          { code: "af", file: "af.json" },
          { code: "am", file: "am.json" },
          { code: "ar", file: "ar.json" },
          { code: "as", file: "as.json" },
          { code: "az", file: "az.json" },
          { code: "bg", file: "bg.json" },
          { code: "bn", file: "bn.json" },
          { code: "bo", file: "bo.json" },
          { code: "bs", file: "bs.json" },
          { code: "ca", file: "ca.json" },
          { code: "cs", file: "cs.json" },
          { code: "cy", file: "cy.json" },
          { code: "da", file: "da.json" },
          { code: "de", file: "de.json" },
          { code: "dsb", file: "dsb.json" },
          { code: "dv", file: "dv.json" },
          { code: "el", file: "el.json" },
          { code: "en", file: "en.json" },
          { code: "es", file: "es.json" },
          { code: "et", file: "et.json" },
          { code: "eu", file: "eu.json" },
          { code: "fa", file: "fa.json" },
          { code: "fi", file: "fi.json" },
          { code: "fil", file: "fil.json" },
          { code: "fj", file: "fj.json" },
          { code: "fo", file: "fo.json" },
          { code: "fr", file: "fr.json" },
          { code: "ga", file: "ga.json" },
          { code: "gl", file: "gl.json" },
          { code: "gom", file: "gom.json" },
          { code: "gu", file: "gu.json" },
          { code: "ha", file: "ha.json" },
          { code: "he", file: "he.json" },
          { code: "hi", file: "hi.json" },
          { code: "hr", file: "hr.json" },
          { code: "hsb", file: "hsb.json" },
          { code: "ht", file: "ht.json" },
          { code: "hu", file: "hu.json" },
          { code: "hy", file: "hy.json" },
          { code: "id", file: "id.json" },
          { code: "ig", file: "ig.json" },
          { code: "ikt", file: "ikt.json" },
          { code: "is", file: "is.json" },
          { code: "it", file: "it.json" },
          { code: "iu", file: "iu.json" },
          { code: "ja", file: "ja.json" },
          { code: "ka", file: "ka.json" },
          { code: "kk", file: "kk.json" },
          { code: "km", file: "km.json" },
          { code: "kmr", file: "kmr.json" },
          { code: "kn", file: "kn.json" },
          { code: "ko", file: "ko.json" },
          { code: "ku", file: "ku.json" },
          { code: "ky", file: "ky.json" },
          { code: "ln", file: "ln.json" },
          { code: "lo", file: "lo.json" },
          { code: "lt", file: "lt.json" },
          { code: "lv", file: "lv.json" },
          { code: "lzh", file: "lzh.json" },
          { code: "mai", file: "mai.json" },
          { code: "mg", file: "mg.json" },
          { code: "mi", file: "mi.json" },
          { code: "mk", file: "mk.json" },
          { code: "mn", file: "mn.json" },
          { code: "mr", file: "mr.json" },
          { code: "ms", file: "ms.json" },
          { code: "mt", file: "mt.json" },
          { code: "mww", file: "mww.json" },
          { code: "my", file: "my.json" },
          { code: "nb", file: "nb.json" },
          { code: "ne", file: "ne.json" },
          { code: "nl", file: "nl.json" },
          { code: "no", file: "no.json" },
          { code: "nso", file: "nso.json" },
          { code: "or", file: "or.json" },
          { code: "otq", file: "otq.json" },
          { code: "pa", file: "pa.json" },
          { code: "pl", file: "pl.json" },
          { code: "prs", file: "prs.json" },
          { code: "ps", file: "ps.json" },
          { code: "pt", file: "pt.json" },
          { code: "ro", file: "ro.json" },
          { code: "ru", file: "ru.json" },
          { code: "rw", file: "rw.json" },
          { code: "sd", file: "sd.json" },
          { code: "si", file: "si.json" },
          { code: "sk", file: "sk.json" },
          { code: "sl", file: "sl.json" },
          { code: "sm", file: "sm.json" },
          { code: "sn", file: "sn.json" },
          { code: "so", file: "so.json" },
          { code: "sq", file: "sq.json" },
          { code: "sr", file: "sr.json" },
          { code: "st", file: "st.json" },
          { code: "sv", file: "sv.json" },
          { code: "ta", file: "ta.json" },
          { code: "te", file: "te.json" },
          { code: "th", file: "th.json" },
          { code: "ti", file: "ti.json" },
          { code: "tk", file: "tk.json" },
          { code: "tlh", file: "tlh.json" },
          { code: "tn", file: "tn.json" },
          { code: "to", file: "to.json" },
          { code: "tr", file: "tr.json" },
          { code: "tt", file: "tt.json" },
          { code: "ty", file: "ty.json" },
          { code: "ug", file: "ug.json" },
          { code: "uk", file: "uk.json" },
          { code: "uz", file: "uz.json" },
          { code: "vi", file: "vi.json" },
          { code: "xh", file: "xh.json" },
          { code: "yo", file: "yo.json" },
          { code: "yua", file: "yua.json" },
          { code: "yue", file: "yue.json" },
          { code: "zh", file: "zh.json" },
          { code: "zu", file: "zu.json" },
        ],
        lazy: true, // This means the JSON files are loaded only when the corresponding locale is activated
        langDir: "static/locales", // This indicates that your JSON files are in the 'locales' directory relative to the root of your project.
        strategy: "no_prefix", // Use this strategy if you don't want to prefix URLs with the locale code. Adjust as per your requirement.
        defaultLocale: "en",
        vueI18n: {
          fallbackLocale: "en",
          dateTimeFormats,
          silentTranslationWarn: true,
        },
      },
    ],
    "@nuxtjs/auth-next",
    "@nuxtjs/toast",

    [
      "nuxt-lazy-load",
      {
        // These are the default values
        native: false, // https://caniuse.com/loading-lazy-attr
        directiveOnly: false,

        // Default image must be in the static folder
        defaultImage: "/img/placeholder-faded.png",
      },
    ],
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: ["@nuxtjs/pwa"],

  toast: {
    position: "top-center",
  },

  auth: {
    redirect: {
      login: false,
      logout: false,
      callback: false,
      home: "/dashboard",
    },
    strategies: {
      local: {
        scheme: "refresh",
        token: {
          property: "data.token",
          global: true,
          maxAge: 60 * 60 * 24 * 30, // Set in Directus settings
          // required: true,
          // type: 'Bearer'
        },
        refreshToken: {
          property: "data.token",
          data: "token",
          maxAge: 60 * 60 * 24 * 30,
        },
        user: {
          property: "data.user",
          autoFetch: false,
        },
        endpoints: {
          login: {
            url: `${DIRECTUS_URL}zerotohero/auth/authenticate`,
            method: "post",
          },
          refresh: {
            url: `${DIRECTUS_URL}zerotohero/auth/refresh`,
            method: "post",
          },
          logout: {
            url: `${DIRECTUS_URL}zerotohero/auth/logout`,
            method: "post",
          },
          user: false,
        },
      },
    },
  },

  bootstrapVue: {
    components: [
      "BForm",
      "BSpinner",
      "BCard",
      "BFormInput",
      "BFormFile",
      "BFormGroup",
      "BFormSelect",
      "BFormTextarea",
      "BFormSelectOption",
      "BButton",
      "BProgress",
      "BTable",
      "BDropdown",
      "BDropdownItem",
      "BFormCheckbox",
      "BFormCheckboxGroup",
      "BFormRadio",
      "BButtonGroup",
      "BInputGroup",
      "BInputGroupAppend",
      "BInputGroupText",
      "BDropdownDivider",
      "BProgressBar",
      "BModal",
    ],
    directives: ["VBModal"],
    bootstrapCSS: false, // We want to override the default bootstrap css
    bootstrapVueCSS: false, // We want to override the default bootstrap vue css
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: "~/plugins/directus.js" },
    { src: "~/plugins/global-mixin" },
    { src: "~/plugins/idle-vue.js", mode: "client" },
    { src: "~/plugins/ios-in-app-purchase.js", mode: "client" },
    { src: "~/plugins/main.js" },
    { src: "~/plugins/paypal.js", mode: "client" },
    { src: "~/plugins/pwa-update.js", mode: "client" },
    { src: "~/plugins/shared-mutations.js", mode: "client" },
    { src: "~/plugins/stripe.js", mode: "client" },
    { src: "~/plugins/subs.js" },
    { src: "~/plugins/vue-slider.js", mode: "client" },
    { src: "~/plugins/vuex-persist.js", mode: "client" },
  ],

  build: {
    publicPath: "/nuxt/",
    /* Extending webpack config */
    /* https://vue-loader.vuejs.org/guide/css-modules.html */
    loaders: {
      cssModules: {
        modules: true,
      },
    },
    extend(config, { isDev, isClient }) {
      config.resolve.alias["vue"] = "vue/dist/vue.common";
      // Extend only webpack config for client-bundle
      if (isDev && isClient) {
        config.devtool = "eval-source-map";
      } else {
        config.devtool = false;
      }
      config.module.rules.push({
        test: /\.(csv|txt|md)$/i,
        loader: "raw-loader",
      });
    },
    transpile: ["iframe-translator", "defu"],
  },
  target: "static",
  generate: {
    routes,
    fallback: true,
    crawler: false,
  },
  sitemap: {
    hostname,
    gzip: true,
    exclude: [
      // Exclude any paths you don't want to be indexed
    ],
    routes,
  },
});
