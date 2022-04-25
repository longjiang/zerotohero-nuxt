export default {
  env: {
    baseUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Zero to Hero Languages',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      // { name: 'referrer', content: 'no-referrer'}, // Turned off because some youtube videos will not load.
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/img/icons/favicon.ico' },
      { rel: 'stylesheet', href: '/vendor/fontawesome-free-5.15.4-web/css/all.min.css' },
    ],
    script: [
      { hid: 'russian-legacy', src: '/js/russian-legacy.js', defer: true },
      { hid: 'papaparse', src: '/vendor/papaparse/papaparse.min.js', defer: true },
      { hid: 'jquery', src: '/vendor/jquery/jquery.min.js', defer: true },
      { hid: 'axios', src: '/vendor/axios/axios.min.js', defer: true },
      { hid: 'underscore', src: '/vendor/underscore/underscore.js', defer: true },
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'css-percentage-circle',
    'video.js/dist/video-js.css',
    '@/assets/css/zerotohero.scss',
  ],

  router: {
    middleware: [
      'language-switch',
    ]
  },

  vue: {
    config: {
      runtimeCompiler: true
    }
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    ['@nuxtjs/router-extras', { /* module options */ }],
    '@nuxtjs/pwa'
  ],

  pwa: {
    manifest: {
      name: 'Zero to Hero Education',
      short_name: 'Zero to Hero',
      description: 'Language education done right.',
      theme_color: '#343a40',
      useWebmanifestExtension: false
    },
    workbox: {
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

  googleFonts: {
    families: {
      Lato: [400, 700],
      Pacifico: true
    },
    display: 'swap'
  },

  modules: [
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    'nuxt-i18n',
    '@nuxtjs/google-fonts',
    ['nuxt-lazy-load', {
      defaultImage: '/img/placeholder-faded.png',
      directiveOnly: false
    }],
  ],

  bootstrapVue: {
    components: ['BFormInput', 'BFormFile', 'BFormGroup', 'BFormSelect', 'BFormTextarea', 'BFormSelectOption', 'BButton', 'BProgress', 'BTable',
      'BDropdown', 'BDropdownItem', 'BFormCheckbox', 'BFormCheckboxGroup', 'BFormRadio', 'BButtonGroup', 'BInputGroup', 'BInputGroupAppend', 'BInputGroupText', 'BDropdownDivider', 'BProgressBar', 'BModal'],
    directives: ['VBModal']
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~plugins/main.js',
    { src: '~/plugins/pwa-update.js', mode: 'client' }
  ],

  build: {
    extend(config, { isDev, isClient }) {
      config.resolve.alias['vue'] = 'vue/dist/vue.common'
      // Extend only webpack config for client-bundle
      if (isDev && isClient) {
        config.devtool = '#source-map'
      } else {
        config.devtool = false
      }
    }
  },

  generate: {
    routes: [
      '/'
    ]
  }
}
