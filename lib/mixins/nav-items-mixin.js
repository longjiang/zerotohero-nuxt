import { LANGS_WITH_CONTENT, LANGS_WITH_LEVELS, l2LevelName } from "../utils";

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
              name: "l1-l2-category-slug",
              params: { slug: 10 },
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
              name: "l1-l2-youtube-browse",
              title: `YouTube`,
              count: this.stats ? this.stats.allVideos : undefined,
              icon: "fab fa-youtube",
              show: true,
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
              name: "l1-l2-youtube-browse",
              icon: "fa fa-grid-2",
              title: `More`,
              // count: this.stats ? this.stats.allVideos : undefined,
              show: true,
              children: [
                {
                  name: "l1-l2-category-slug",
                  params: { slug: "movies" },
                  icon: "fa fa-film",
                  title: `Movies`,
                  show: true,
                },
                {
                  name: "l1-l2-live-tv",
                  icon: "fa-solid fa-satellite-dish",
                  title: "Live TV",
                  show: this.hasLiveTV,
                },
                {
                  name: "l1-l2-audiobooks",
                  icon: "fa fa-book-open",
                  title: `Audiobooks`,
                  count: this.audioBooksCount,
                  show: true,
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
                  name: "l1-l2-lesson-videos",
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
                  title: "Random",
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
                  name: "l1-l2-watch-history",
                  icon: "fas fa-history",
                  title: "My History",
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
                  name: "l1-l2-recommended-video",
                  icon: "fas fa-telescope",
                  title: `Discover`,
                  show: true,
                },
              ],
            },
            {
              name: "l1-l2-show",
              show: false,
            },
            {
              name: "l1-l2-video-view-type",
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
          icon: "fas fa-book-open",
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
              title: "Local ePub",
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
              name: "l1-l2-bookshelf",
              title: "Bookshelf",
              icon: "fas fa-book-reader",
              show: this.$auth?.loggedIn,
            },
            {
              name: "l1-l2-gutenberg",
              show: false,
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              name: "l1-l2-library",
              show: true,
              children: [
                {
                  name: "l1-l2-web-reader",
                  title: "Web Reader",
                  icon: "fas fa-globe-asia",
                  show: true,
                },
                {
                  name: "l1-l2-library",
                  title: "Books (Legacy)",
                  icon: "fas fa-book-open",
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
                {
                  name: "l1-l2-my-playlists",
                  icon: "fas fa-list",
                  title: "My Playlists",
                  show: true,
                },
              ],
            },
          ],
        },
        {
          icon: "fas fa-spell-check",
          title: "Vocabulary",
          name: "dictionary",
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
              name: "l1-l2-saved-words",
              icon: "fas fa-star",
              title: "My Words",
              show: true,
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              // count: this.stats ? this.stats.allVideos : undefined,
              name: "l1-l2-saved-phrases",
              show: true,
              children: [
                {
                  name: "l1-l2-phrasebooks",
                  icon: "fa fa-comment-alt",
                  title: "Word Books",
                  show: this.hasPhrasebooks,
                },
                {
                  name: "l1-l2-phrasebook",
                  show: false,
                },
                {
                  name: "l1-l2-phrasebook-phrase",
                  show: false,
                },
                {
                  name: "l1-l2-saved-phrases",
                  icon: "fas fa-bookmark",
                  title: "My Phrases",
                  show: true,
                },
                {
                  name: "l1-l2-phrase",
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
                  name: "l1-l2-new-levels",
                  icon: "fa fa-signal",
                  title: "New HSK Words",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-new-levels-graphic",
                  icon: "fas fa-exchange-alt",
                  title: "Old vs New HSK",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-compare",
                  show: false,
                },
                {
                  name: "l1-l2-compare-phrases",
                  show: false,
                },
                {
                  name: "l1-l2-explore-related",
                  icon: "fas fa-project-diagram",
                  title: "Word Explorer",
                  params: { arg: "中國,zhōng_guó,0" },
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-explore-roots",
                  icon: "fa fa-wrench",
                  title: "Word Builder",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-idioms",
                  icon: "fa fa-border-all",
                  title: "Idioms",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-radicals",
                  icon: "fa fa-code-branch",
                  title: "Radicals",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-characters",
                  icon: "fa fa-pen-alt",
                  title: "Characters",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-separable",
                  icon: "fa fa-angle-double-right",
                  title: "Separables",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-explore-topics",
                  icon: "fas fa-certificate",
                  title: "Words by Topic",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-transcription",
                  title: "Phonetic Transcription",
                  icon: "fa-regular fa-comment-lines",
                  show: true,
                },
                {
                  name: "l1-l2-pinyin-list",
                  title: "Pinyin List",
                  icon: "fa fa-list",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "l1-l2-lookup-by-tones",
                  title: "Lookup by Tones",
                  icon: "fa fa-music",
                  show: ["zh"].includes(this.$l2?.code),
                },
                {
                  name: "learn",
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
              name: "l1-l2-resources",
              title: "Resources",
              icon: "fas fa-gem",
              show: true,
            },
            {
              name: "l1-l2-articles-reddit",
              title: "Forum",
              icon: "fab fa-reddit",
              show: true,
              params: { method: "list" },
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              name: "l1-l2-tutoring",
              show: true,
              children: [
                {
                  name: "l1-l2-tutoring",
                  title: "Tutoring Kit",
                  icon: "fas fa-folder",
                  show: true,
                },
                {
                  name: "l1-l2-tutoring-lesson",
                  show: false,
                },
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
                {
                  name: "l1-l2-studysheet",
                  title: "Study Sheet",
                  icon: "fas fa-print",
                  show: ["ru", "en", "zh"].includes(this.$l2?.code),
                },
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
          icon: "fas fa-circle-info",
          title: "About",
          show: true,
          children: [
            {
              name: "l1-l2-language-info",
              title: this.$l2?.name,
              icon: "fas fa-flag",
              show: true,
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
              name: "l1-l2-contact",
              icon: "fas fa-id-card",
              show: true,
              title: "Contact Us",
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              name: "updates",
              show: true,
              children: [
                {
                  name: "language-map",
                  title: `Map of Languages`,
                  icon: "fas fa-globe-asia",
                  show: true,
                },
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
                  name: "compare-languages",
                  title: "Compare Languages",
                  icon: "fa-solid fa-arrow-right-arrow-left",
                  show: true,
                },
                {
                  name: "translators",
                  title: "Web Translators",
                  icon: "fas fa-language",
                  show: true,
                },
                {
                  name: "stats",
                  title: "Language Player Stats",
                  icon: "fas fa-chart-simple",
                  show: true,
                },
                {
                  name: "popular",
                  title: "What's Popular",
                  icon: "fas fa-fire",
                  show: true,
                },
                {
                  name: "updates",
                  title: "What’s New",
                  icon: "fab fa-twitter",
                  show: true,
                },
                {
                  name: "articles-wiki",
                  title: "Blog",
                  icon: "fas fa-copy",
                  show: true,
                },
                {
                  name: "page",
                  params: { id: 17 },
                  icon: "fas fa-file",
                  title: "Privacy Policy",
                  show: true,
                },
                {
                  name: "phonological-features",
                  show: false,
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
              name: "l1-l2-login",
              icon: "fas fa-key",
              title: "Login",
              show: this.l1 && this.l2 && !(this.$auth && this.$auth.loggedIn),
              params: { l1: this.l1?.code, l2: this.l2?.code },
            },
            {
              name: "l1-l2-register",
              icon: "fas fa-user-plus",
              title: "Register",
              show: this.l1 && this.l2 && !(this.$auth && this.$auth.loggedIn),
              params: { l1: this.l1?.code, l2: this.l2?.code },
            },
            {
              name: "l1-l2-logout",
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
                  name: "admin-check-cors",
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
              name: "watch-history",
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
                  name: "l1-l2-watch-history",
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
              ],
            },
          ],
        },
      ];
      return items;
    },
  },
};
