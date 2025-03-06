import { LANGS_WITH_CONTENT, LANGS_WITH_LEVELS, l2LevelName } from "@/lib/utils";

export default {
  computed: {
    menu() {
      let items = [
        {
          icon: "fa-solid fa-photo-film-music",
          title: "Media",
          show: LANGS_WITH_CONTENT.includes(this.$l2?.code),
          children: [
            {
              name: "l1-l2-explore-media",
              icon: "fas fa-home",
              title: `Home`,
              // count: this.stats ? this.stats.allVideos : undefined,
              show: true,
            },
            {
              name: "l1-l2-music",
              icon: "fa fa-music",
              title: `Music`,
              show: true,
            },
            {
              name: "l1-l2-tv-shows",
              icon: "fa fa-tv",
              title: `TV Shows`,
              count: this.tvShowsCount,
              show: this.tvShowsCount,
            },
            {
              name: "l1-l2-live-tv",
              icon: "fa-solid fa-satellite-dish",
              title: "Live TV",
              show: this.hasLiveTV,
            },
            {
              name: "l1-l2-set-content-preferences",
              icon: "fas fa-cog",
              title: `Set Content Preferences`,
              show: false,
            },
            {
              name: "l1-l2-set-language-level",
              icon: "fas fa-cog",
              title: `Set Language Level`,
              show: false,
            },
            {
              icon: "fa fa-grid-2",
              title: `More`,
              // count: this.stats ? this.stats.allVideos : undefined,
              show: true,
              children: [
                {
                  name: "l1-l2-youtube-browse-category-level-locale-start",
                  params: { level: 'all', category: 'all', start: 0, locale: 'all' },
                  title: `YouTube`,
                  count: this.stats ? this.stats.allVideos : undefined,
                  icon: "fab fa-youtube",
                  show: true,
                },
                {
                  name: "l1-l2-category-slug",
                  params: { slug: "movies" },
                  icon: "fa fa-film",
                  title: `Movies`,
                  show: true,
                },
                {
                  name: "l1-l2-audiobooks",
                  icon: "fa fa-book-open",
                  title: `Audiobooks`,
                  count: this.audioBooksCount,
                  show: this.audioBooksCount,
                },
                {
                  name: "l1-l2-category-slug",
                  params: { slug: 25 },
                  icon: "fa fa-newspaper",
                  title: `News`,
                  show: true,
                },
                {
                  name: "l1-l2-category-slug",
                  params: { slug: "kids" },
                  icon: "fas fa-baby",
                  title: `Kids`,
                  show: true,
                },
                {
                  name: "l1-l2-youtube-channels",
                  title: `Channels`,
                  icon: "fab fa-youtube",
                  show: true,
                },
                {
                  name: "l1-l2-categories",
                  icon: "fas fa-folder",
                  title: `Categories`,
                  show: true,
                },
                {
                  name: "l1-l2-video-view-type",
                  title: "Open MP4...",
                  icon: "fas fa-folder-open",
                  show: true,
                  params: { type: "bring-your-own" },
                },
                {
                  name: "l1-l2-lesson-videos", // We omit 'chinese' in the name to support legacy urls.
                  icon: "fas fa-person-chalkboard",
                  title: `Lesson Expansion Videos`,
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-feed",
                  icon: "fas fa-stream",
                  title: `Feed`,
                  show: true,
                },
                {
                  name: "l1-l2-discover-shows",
                  title: "Discover TV Shows",
                  icon: "fas fa-random",
                  show: this.l1 && this.l2,
                  params: { l1: this.l1?.code, l2: this.l2?.code },
                },
                {
                  name: "l1-l2-youtube-search",
                  title: `Search`,
                  icon: "fas fa-search",
                  show: true,
                },
                {
                  name: "l1-l2-youtube-import",
                  title: `Import from YouTube`,
                  icon: "fas fa-file-import",
                  show: true,
                },
                {
                  name: "l1-l2-youtube-history",
                  icon: "fas fa-history",
                  title: "My Watch History",
                  show: true,
                },
                {
                  name: "l1-l2-youtube-likes",
                  icon: "fas fa-heart",
                  title: "Liked Videos",
                  show: true,
                },
                {
                  name: "l1-l2-my-playlists",
                  icon: "fas fa-list",
                  title: "My Playlists",
                  show: true,
                },
                {
                  name: 'playlist-id',
                  show: false,
                },
              ],
            },
            {
              name: "l1-l2-show-type-id",
              show: false,
            },
            {
              name: "l1-l2-video-view",
              show: false,
            },
            {
              name: "l1-l2-youtube-playlist",
              show: false,
            },
            {
              name: "l1-l2-youtube-channel",
              show: false,
            },
          ],
        },
        {
          icon: "fas fa-file-lines",
          title: "Reading",
          show:
            this.hasFeature("dictionary") || this.hasFeature("transliteration"),
          children: [
            {
              name: "l1-l2-reader",
              title: "Reader",
              icon: "fas fa-file-alt",
              show: false,
            },
            {
              name: "l1-l2-my-text",
              title: "Reader",
              icon: "fas fa-edit",
              show: this.$auth?.loggedIn,
            },
            {
              name: "l1-l2-epub",
              title: "eBook Reader",
              icon: "fas fa-book-circle-arrow-up",
              show: true,
            },
            {
              name: "l1-l2-books",
              title: "Books",
              icon: "fas fa-book",
              show: true,
            },
            {
              name: "l1-l2-gutenberg",
              show: false,
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              show: true,
              children: [
                {
                  name: "l1-l2-bookshelf",
                  title: "Bookshelf",
                  icon: "fas fa-book-reader",
                  show: this.$auth?.loggedIn,
                },
                {
                  name: "l1-l2-web-reader",
                  title: "Web Reader",
                  icon: "fas fa-globe-asia",
                  show: true,
                },
                {
                  name: "l1-l2-transcription",
                  title: "Phonetic Transcription",
                  icon: "fa-regular fa-comment-lines",
                  show: true,
                },
                {
                  name: "l1-l2-book",
                  show: false,
                },
                {
                  name: "l1-l2-book-list",
                  show: false,
                },
                {
                  name: "l1-l2-book-index",
                  show: false,
                },
                {
                  name: "l1-l2-book-chapter",
                  show: false,
                },
              ],
            },
          ],
        },
        {
          icon: "fas fa-book-blank",
          title: "Dictionary",
          name: "l1-l2-dictionary",
          show: this.hasFeature("dictionary") || this.hasPhrasebooks,
          children: [
            {
              name: "l1-l2-dictionary",
              icon: "fa fa-search",
              title: "Dictionary",
              show: this.hasFeature("dictionary"),
            },
            {
              name: "l1-l2-levels",
              icon: "fa fa-signal",
              title: this.$t('{level} Words', {level: this.$t(l2LevelName(this.$l2.code))}),
              show: LANGS_WITH_LEVELS.includes(this.$l2?.code),
            },
            {
              name: "l1-l2-phrasebooks",
              icon: "fa fa-comment-alt",
              title: "Phrasebooks",
              show: this.hasPhrasebooks,
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              // count: this.stats ? this.stats.allVideos : undefined,
              badge: this.savedWordsCount,
              show: true,
              children: [
                {
                  name: "l1-l2-saved-words",
                  icon: "fas fa-star",
                  title: "My Words",
                  badge: this.savedWordsCount,
                  show: true,
                },
                {
                  name: "l1-l2-phrasebook-bookId",
                  show: false,
                },
                {
                  name: "l1-l2-phrasebookz-bookId-phraseId",
                  show: false,
                },
                {
                  name: "l1-l2-saved-phrases",
                  icon: "fas fa-bookmark",
                  title: "My Phrases",
                  show: true,
                  badge: this.savedPhrasesCount,
                },
                {
                  name: "l1-l2-phrase-search-term",
                  icon: "fas fa-search",
                  title: "Look Up Phrases",
                  show: false,
                },
                {
                  name: "l1-l2-minimal-pairs",
                  icon: "fa fa-adjust",
                  title: "Minimal Pairs",
                  show: this.hasFeature("dictionary"),
                },
                {
                  name: "l1-l2-pinyin-list",
                  title: "Pronunciation List",
                  icon: "fa fa-list",
                  show: this.hasFeature("dictionary"),
                },
                {
                  name: "l1-l2-chinese-new-levels",
                  icon: "fa fa-signal",
                  title: "New HSK Words",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-chinese-new-levels-graphic",
                  icon: "fas fa-exchange-alt",
                  title: "Old vs New HSK",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-compare",
                  show: false,
                },
                {
                  name: "l1-l2-phrase-compare-term-compareTerm",
                  show: false,
                },
                {
                  name: "l1-l2-chinese-explore-related",
                  icon: "fas fa-project-diagram",
                  title: "Word Explorer",
                  params: { arg: "中國,zhōng_guó,0" },
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-chinese-explore-roots-arg",
                  icon: "fa fa-wrench",
                  title: "Word Builder",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-chinese-idioms",
                  icon: "fa fa-border-all",
                  title: "Idioms",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-chinese-radicals",
                  icon: "fa fa-code-branch",
                  title: "Radicals",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-chinese-characters",
                  icon: "fa fa-pen-alt",
                  title: "Characters",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-chinese-separable",
                  icon: "fa fa-angle-double-right",
                  title: "Separables",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-chinese-explore-topics",
                  icon: "fas fa-certificate",
                  title: "Words by Topic",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-chinese-lookup-by-tones",
                  title: "Lookup by Tones",
                  icon: "fa fa-music",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-chinese-pinyin-chart",
                  title: "Pinyin Chart",
                  icon: "fas fa-table-cells",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-learn",
                  show: false,
                },
              ],
            },
          ],
        },
        {
          icon: "fas fa-gem",
          title: "Resources",
          show: true,
          children: [
            {
              icon: "fas fa-road",
              name: "l1-l2-learning-path",
              title: "Path",
              show: true,
            },
            {
              name: "l1-l2-grammar",
              icon: "fas fa-list-ul",
              title: "Grammar",
              show: ["zh", "ja", "ko"].includes(this.$l2?.code),
            },
            {
              name: "l1-l2-grammar-view-id",
              show: false,
            },
            {
              name: "l1-l2-resource-list",
              title: "Resources",
              icon: "fas fa-gem",
              show: true,
            },
            // {
            //   name: "l1-l2-articles-reddit",
            //   title: "Forum",
            //   icon: "fab fa-reddit",
            //   show: true,
            //   params: { method: "list" },
            // },

            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              show: true,
              children: [
                {
                  name: "l1-l2-articles-wiki",
                  title: "Blog",
                  icon: "fas fa-copy",
                  show: true,
                },
                // {
                //   name: "l1-l2-tutoring-lesson-id",
                //   title: "Tutoring Kit",
                //   icon: "fas fa-folder",
                //   show: true,
                // },
                // {
                //   name: "l1-l2-tutoring-lesson",
                //   show: false,
                // },
                {
                  name: "l1-l2-klingon-keyboard",
                  icon: "fas fa-keyboard",
                  title: "Keyboard",
                  show: ["tlh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-hindi-bookmarklet",
                  icon: "fas fa-bookmark",
                  title: "Bookmarklet",
                  show: ["hi"].includes(this.$l2?.code),
                },
                // {
                //   name: "l1-l2-studysheet",
                //   title: "Study Sheet",
                //   icon: "fas fa-print",
                //   show: ["ru", "en", "zh"].includes(this.$l2?.code),
                // },
                {
                  name: "l1-l2-chinese-pinyin-squared",
                  title: "Pinyin Squared",
                  icon: "fa fa-superscript",
                  show: ["zh"].includes(this.$l2?.code),
                },
              ],
            },
          ],
        },
        {
          icon: "fas fa-globe",
          title: "Languages",
          show: true,
          children: [
            {
              name: "l1-l2-language-info",
              title: this.$l2?.name,
              icon: "fas fa-flag",
              show: true,
            },
            {
              name: "language-map",
              title: `Map of Languages`,
              icon: "fas fa-globe-asia",
              show: true,
            },
            {
              name: "compare-languages",
              title: "Compare Languages",
              icon: "fa-solid fa-arrow-right-arrow-left",
              show: true,
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              show: true,
              children: [
                {
                  name: "articles",
                  title: `Articles on Languages`,
                  icon: "fas fa-file",
                  show: true,
                },
                {
                  name: "language-icons",
                  title: "Face of the Language",
                  icon: "fas fa-user",
                  show: true,
                },
                {
                  name: "phonological-features",
                  title: "Phonological Features",
                  icon: "fas fa-lips",
                  show: true,
                },
                {
                  name: "translators",
                  title: "Web Translators",
                  icon: "fas fa-language",
                  show: true,
                },
              ],
            },
          ],
        },
        {
          icon: "fas fa-user",
          title: `${
            this.$auth &&
            this.$auth.loggedIn &&
            this.$auth.user &&
            this.$auth.user.first_name
              ? "Me"
              : "Login"
          }`,
          show: true,
          exact: true,
          children: [
            {
              name: "l1-l2-profile",
              icon: "fas fa-user",
              title: "Me",
              show: this.$auth?.loggedIn,
            },
            {
              name: "l1-l2-settings",
              icon: "fas fa-cog",
              title: "Settings",
              show: true,
            },
            {
              name: "login",
              icon: "fas fa-key",
              title: "Login",
              show: this.l1 && this.l2 && !(this.$auth && this.$auth.loggedIn),
              params: { l1: this.l1?.code, l2: this.l2?.code },
            },
            {
              name: "register",
              icon: "fas fa-user-plus",
              title: "Register",
              show: this.l1 && this.l2 && !(this.$auth && this.$auth.loggedIn),
              params: { l1: this.l1?.code, l2: this.l2?.code },
            },
            {
              name: "logout",
              icon: "fas fa-sign-out-alt",
              title: "Logout",
              show: this.l1 && this.l2 && this.$auth?.loggedIn,
              params: { l1: this.l1?.code, l2: this.l2?.code },
            },{
              icon: "fas fa-wrench",
              title: "Admin",
              name: "admin-manage-subscriptions",
              show: this.$adminMode,
              children: [
                {
                  icon: "fas fa-wrench",
                  title: "Subscriptions",
                  name: "admin-manage-subscriptions",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Phrase Survey",
                  name: "admin-phrase-survey",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Test",
                  name: "admin-test",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Text Survey",
                  name: "admin-ngram",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Add Phrasebook",
                  name: "admin-phrasebook-creator",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Quality Assurance",
                  name: "admin-quality-assurance",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Break Lines",
                  name: "admin-break-lines",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "JSON to CSV",
                  name: "admin-json-to-csv",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Wiktionary CSV",
                  name: "admin-wiktionary-csv",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "DB Audit",
                  name: "admin-db-audit",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Assign Lesson Videos",
                  name: "admin-assign-lesson-videos",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Check CORS",
                  name: "check-cors",
                  show: this.$adminMode,
                },
                {
                  icon: "fas fa-wrench",
                  title: "Analytics",
                  name: "admin-analytics",
                  show: this.$adminMode,
                },
              ],
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              show: true,
              children: [
                {
                  name: "l1-l2-saved-words",
                  icon: "fas fa-star",
                  title: "My Words",
                  show: this.$auth?.loggedIn,
                },
                {
                  name: "l1-l2-saved-phrases",
                  icon: "fas fa-bookmark",
                  title: "My Phrases",
                  show: this.$auth?.loggedIn,
                },
                {
                  name: "l1-l2-youtube-history",
                  icon: "fas fa-history",
                  title: "My Watch History",
                  show: this.$auth?.loggedIn,
                },
                {
                  name: "l1-l2-youtube-likes",
                  icon: "fas fa-heart",
                  title: "My Liked Videos",
                  show: true,
                },
                {
                  name: "l1-l2-my-playlists",
                  icon: "fas fa-list-music",
                  title: "My Playlists",
                  show: true,
                },
                {
                  name: "l1-l2-bookshelf",
                  title: "My Bookshelf",
                  icon: "fas fa-books",
                  show: this.$auth?.loggedIn,
                },
                {
                  name: "l1-l2-my-text",
                  title: "My Texts",
                  icon: "fa-solid fa-notebook",
                  show: this.$auth?.loggedIn,
                },
                {
                  name: "l1-l2-about",
                  icon: "fas fa-circle-info",
                  show: true,
                  title: "About Us",
                },
                {
                  name: "l1-l2-faq",
                  icon: "fas fa-question-circle",
                  show: true,
                  title: "FAQ",
                },
                {
                  name: "l1-l2-contact-us",
                  icon: "fas fa-id-card",
                  show: true,
                  title: "Contact Us",
                },
                {
                  name: "stats",
                  title: "Language Player Stats",
                  icon: "fas fa-chart-simple",
                  show: true,
                },
                // {
                //   name: "popular",
                //   title: "What's Popular",
                //   icon: "fas fa-fire",
                //   show: true,
                // },
                // {
                //   name: "l1-l2-updates",
                //   title: "What’s New",
                //   icon: "fab fa-twitter",
                //   show: true,
                // },
                {
                  name: "l1-l2-page-id",
                  params: { id: 17 },
                  icon: "fas fa-file",
                  title: "Privacy Policy",
                  show: true,
                },
              ],
            },
          ],
        },
      ];
      return items;
    },
  },
};
