import { DIRECTUS_URL } from "./lib/utils";

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
/en/ja/tv-shows`.split('\n').filter(Boolean)

const excludePaths = ['/zh/en/online-courses', '/en/zh/online-courses']

popularPaths = popularPaths.filter(path => !excludePaths.includes(path))

popularPaths = popularPaths.map(path => path.replace('/youtube/view/',  '/video-view/youtube/'))

const hostname = process.env.URL ? process.env.URL : 'http://localhost:3000'

const routes = async () => {
  const { $content } = require('@nuxt/content');
  const files = await $content().only(['path']).fetch();

  return files.map(file => (file.path === '/index' ? '/' : file.path)).concat(['/privacy-policy', '/']).concat(popularPaths);
}

let defaultDateTimeFormat =  {
  short: {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }
}

let dateTimeFormats = {}

for (let lang of 'af ar ca zh hr nl en fi fr de el hi hu id ga it ja ko la nan no pl pt ro ru sr es sw sv th tr vi'.split(' ')) {
  dateTimeFormats[lang] = defaultDateTimeFormat
}

const childProcess = require('child_process');

let COMMIT_REF, BRANCH, TAG;

try {
  COMMIT_REF = process.env.COMMIT_REF || childProcess
    .execSync('git rev-parse HEAD')
    .toString().trim();
  BRANCH = process.env.BRANCH || childProcess
    .execSync('git symbolic-ref --short HEAD')
    .toString().trim();
  TAG = process.env.TAG || childProcess
    .execSync('git describe --tags --abbrev=0')
    .toString().trim();
} catch (error) {
  console.error('Error while getting Git information:', error);
}

export default {
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
    title: 'Language Player',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
      { name: "apple-itunes-app", content: "app-id=1623985525" }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/img/icons/favicon.ico' },
      { rel: 'stylesheet', href: '/vendor/fontawesome-pro-6.1.1-web/css/all.min.css' },
      { rel: 'stylesheet', href: '/fonts/fonts.css' },
      { rel: 'stylesheet', href: '/vendor/octicons/octicons.css' },
      // { rel: 'stylesheet', href: '/vendor/bootstrap/bootstrap.min.css' },
      // { rel: 'stylesheet', href: '/vendor/bootstrap-vue/bootstrap-vue.min.css' }
    ],
    script: [
      { hid: 'russian-legacy', src: '/js/russian-legacy.js', defer: true },
      { hid: 'papaparse', src: '/vendor/papaparse/papaparse.min.js', defer: true },
      { hid: 'jquery', src: '/vendor/jquery/jquery.min.js', defer: true },
      { hid: 'axios', src: '/vendor/axios/axios.min.js', defer: true },
      { hid: 'underscore', src: '/vendor/underscore/underscore.js', defer: true },
      { hid: 'hls', src: '/vendor/hls.js@1.4.0/hls.min.js', defer: true }
    ]
  },

  router: {
    middleware: [
      'language-switch',
      'redirectPaths'
    ]
  },

  vue: {
    config: {
      runtimeCompiler: true
    }
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: {
    dirs: [
      '~/components',
    ]
  },

  pwa: {
    icon: {
      fileName: 'icon4.png', // Renamed from icon.png in order for the pwa module to regenerate updated icons
      purpose: 'maskable', // So that the user's os will add masking/padding around the icon (rounded corner, circle, etc)
    },
    manifest: {
      name: 'Language Player',
      short_name: 'Language Player',
      description: 'Learn languages with videos.',
      theme_color: '#1d1d1d',
      useWebmanifestExtension: false
    },
    workbox: {
      cacheAssets: [
        '/workers/dict-worker.js',
        '/js/dialect-dict.js',
        '/js/ecdict.js',
        '/js/edict.js',
        '/js/freedict.js',
        '/js/hsk-cedict.js',
        '/js/kengdic.js',
        '/js/klingonska.js',
        '/js/openrussian.js',
        '/js/russian-legacy.js',
        '/js/wiktionary.js',
      ],
      runtimeCaching: [{
        urlPattern: 'http://server.chinesezerotohero.com/.*',
        handler: 'CacheFirst',
        options: {
          cacheName: 'dictionaries',
          expiration: {
            maxEntries: 10,
          },
        },
      }],
    }
  },

  modules: [
    'bootstrap-vue/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/axios',
    '@nuxt/content',
    ['nuxt-i18n', {
      vueI18n: {
        fallbackLocale: 'en',
        dateTimeFormats,
        silentTranslationWarn: true
      }
    }],
    '@nuxtjs/auth-next',
    '@nuxtjs/toast',

    ['nuxt-lazy-load', {
      // These are the default values
      native: false, // https://caniuse.com/loading-lazy-attr
      directiveOnly: false,

      // Default image must be in the static folder
      defaultImage: '/img/placeholder-faded.png',
    }]
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    'nuxt-delay-hydration',
    ['@nuxtjs/router-extras', { /* module options */ }],
    '@nuxtjs/pwa'
  ],

  delayHydration: {
    mode: 'manual',
  },

  toast: {
    position: 'top-center'
  },

  auth: {
    redirect: {
      login: false,
      logout: false,
      callback: false,
      home: '/dashboard'
    },
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'data.token',
          global: true,
          maxAge: 60 * 60 * 24 * 30, // Set in Directus settings
          // required: true,
          // type: 'Bearer'
        },
        refreshToken: {
          property: 'data.token',
          data: 'token',
          maxAge: 60 * 60 * 24 * 30
        },
        user: {
          property: 'data.user',
          autoFetch: false
        },
        endpoints: {
          login: { url: `${DIRECTUS_URL}zerotohero/auth/authenticate`, method: 'post' },
          refresh: { url: `${DIRECTUS_URL}zerotohero/auth/refresh`, method: 'post' },
          logout: { url: `${DIRECTUS_URL}zerotohero/auth/logout`, method: 'post' },
          user: false
        }
      }
    }
  },

  bootstrapVue: {
    components: ['BForm', 'BSpinner', 'BCard', 'BFormInput', 'BFormFile', 'BFormGroup', 'BFormSelect', 'BFormTextarea', 'BFormSelectOption', 'BButton', 'BProgress', 'BTable',
      'BDropdown', 'BDropdownItem', 'BFormCheckbox', 'BFormCheckboxGroup', 'BFormRadio', 'BButtonGroup', 'BInputGroup', 'BInputGroupAppend', 'BInputGroupText', 'BDropdownDivider', 'BProgressBar', 'BModal'],
    directives: ['VBModal'],
    bootstrapCSS: false, // We want to override the default bootstrap css
    bootstrapVueCSS: false // We want to override the default bootstrap vue css
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/directus.js' },
    { src: '~/plugins/global-mixin' },
    { src: '~/plugins/idle-vue.js', mode: 'client' },
    { src: '~/plugins/ios-in-app-purchase.js', mode: 'client' },
    { src: '~/plugins/main.js' },
    { src: '~/plugins/paypal.js', mode: 'client' },
    { src: '~/plugins/pwa-update.js', mode: 'client' },
    { src: '~/plugins/shared-mutations.js', mode: 'client' },
    { src: '~/plugins/stripe.js', mode: 'client' },
    { src: '~/plugins/subs.js' },
    { src: '~/plugins/vue-slider.js', mode: 'client' },
    { src: '~/plugins/vuex-persist.js', mode: 'client' },
  ],

  build: {
    publicPath: '/nuxt/',
    /* Extending webpack config */
    /* https://vue-loader.vuejs.org/guide/css-modules.html */
    loaders: {
      cssModules: {
        modules: true
      }
    },
    extend(config, { isDev, isClient }) {
      config.resolve.alias['vue'] = 'vue/dist/vue.common'
      // Extend only webpack config for client-bundle
      if (isDev && isClient) {
        config.devtool = 'eval-source-map'
      } else {
        config.devtool = false
      }
      config.module.rules.push({
        test: /\.(csv|txt|md)$/i,
        loader: 'raw-loader',
      });
    },
    transpile: [
      'iframe-translator',
      'defu'
    ]
  },
  target: 'static',
  generate: {
    routes,
    fallback: true,
    crawler: false
  },
  sitemap: {
    hostname,
    gzip: true,
    exclude: [
      // Exclude any paths you don't want to be indexed
    ],
    routes
  },
}