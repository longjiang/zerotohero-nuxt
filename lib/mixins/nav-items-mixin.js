import { LANGS_WITH_CONTENT } from "@/lib/utils";

export default {
  computed: {
    menu() {
      let items = [
        {
          icon: "fas fa-play",
          title: "Media",
          show: LANGS_WITH_CONTENT.includes(this.$l2.code),
          children: [
            {
              name: "explore-media",
              icon: "fas fa-telescope",
              title: `Home`,
              // count: this.stats ? this.stats.allVideos : undefined,
              show: true,
            },
            {
              name: "tv-shows",
              icon: "fa fa-tv",
              title: `TV Shows`,
              count: this.tvShowsCount,
              show: this.tvShowsCount,
            },
            {
              name: "youtube-browse",
              title: `YouTube`,
              count: this.stats ? this.stats.allVideos : undefined,
              icon: "fa-solid fa-films",
              show: true,
            },
            {
              path: this.musicPath,
              icon: "fa fa-music",
              title: `Music`,
              count: this.stats ? this.stats.music : undefined,
              show: this.musicPath,
            },
            {
              name: "set-content-preferences",
              icon: "fas fa-cog",
              title: `Set Content Preferences`,
              show: false,
            },
            {
              name: "set-language-level",
              icon: "fas fa-cog",
              title: `Set Language Level`,
              show: false,
            },
            {
              icon: "fa fa-grid-2",
              title: `More`,
              // count: this.stats ? this.stats.allVideos : undefined,
              name: "youtube-browse",
              show: true,
              children: [
                {
                  name: "live-tv",
                  icon: "fa fa-tv-retro",
                  title: "Live TV",
                  show: this.hasLiveTV,
                },
                {
                  name: "talks",
                  title: `YouTube Channels`,
                  count: this.talksCount,
                  icon: "fab fa-youtube",
                  show: this.talksCount,
                },
                {
                  name: "all-media",
                  icon: "fas fa-folder",
                  title: `Categories`,
                  show: true,
                },
                {
                  path: this.moviesPath,
                  icon: "fa fa-film",
                  title: `Movies`,
                  count: this.stats ? this.stats.movies : undefined,
                  show: this.moviesPath,
                },
                {
                  name: "audiobooks",
                  icon: "fa fa-book-open",
                  title: `Audiobooks`,
                  count: this.audioBooksCount,
                  show: this.audioBooksCount,
                },
                {
                  path: this.newsPath,
                  icon: "fa fa-newspaper",
                  title: `News`,
                  count: this.stats ? this.stats.news : undefined,
                  show: this.newsPath,
                },
                {
                  name: "youtube-browse",
                  icon: "fas fa-baby",
                  title: `Kids`,
                  // count: this.stats ? this.stats.music : undefined,
                  params: { kidsOnly: true, category: "all", level: "all" },
                  show: true,
                },
                {
                  name: "chinese-lesson-videos",
                  icon: "fas fa-person-chalkboard",
                  title: `Lesson Expansion Videos`,
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "feed",
                  icon: "fas fa-stream",
                  title: `Feed`,
                  show: true,
                },
                {
                  name: "discover-shows",
                  title: "Random",
                  icon: "fas fa-random",
                  show: true,
                  params: { l1: this.l1.code, l2: this.l2.code },
                },
                {
                  name: "youtube-search",
                  title: `Search`,
                  icon: "fas fa-search",
                  show: true,
                },
                {
                  name: "youtube-import",
                  title: `Import from YouTube`,
                  icon: "fas fa-file-import",
                  show: true,
                },
                {
                  name: "video-view",
                  title: "Local Video File",
                  icon: "fas fa-folder-open",
                  show: true,
                  params: { type: "bring-your-own" },
                },
                {
                  name: "watch-history",
                  icon: "fas fa-history",
                  title: "My History",
                  show: true,
                },
                {
                  name: "my-playlists",
                  icon: "fas fa-list",
                  title: "My Playlists",
                  show: true,
                },
              ],
            },
            {
              name: "show",
              show: false,
            },
            {
              name: "video-view",
              show: false,
            },
            {
              name: "youtube-playlist",
              show: false,
            },
            {
              name: "youtube-channel",
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
              name: "reader",
              title: "Reader",
              icon: "fas fa-file-alt",
              show: false,
            },
            {
              name: "my-text",
              title: "Reader",
              icon: "fas fa-edit",
              show: this.$auth?.loggedIn,
            },
            {
              name: "epub",
              title: "Local ePub",
              icon: "fas fa-book-circle-arrow-up",
              show: true,
            },
            {
              name: "books",
              title: "Books",
              icon: "fas fa-book",
              show: true,
            },
            {
              name: "bookshelf",
              title: "Bookshelf",
              icon: "fas fa-book-reader",
              show: this.$auth?.loggedIn,
            },
            {
              name: "gutenberg",
              show: false,
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              name: "library",
              show: true,
              children: [
                {
                  name: "web-reader",
                  title: "Web Reader",
                  icon: "fas fa-globe-asia",
                  show: true,
                },
                {
                  name: "library",
                  title: "Books (Legacy)",
                  icon: "fas fa-book-open",
                  show: true,
                },
                {
                  name: "book",
                  show: false,
                },
                {
                  name: "book-list",
                  show: false,
                },
                {
                  name: "book-index",
                  show: false,
                },
                {
                  name: "book-chapter",
                  show: false,
                },
                {
                  name: "my-playlists",
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
              name: "dictionary",
              icon: "fa fa-search",
              title: "Dictionary",
              show: this.hasFeature("dictionary"),
            },
            {
              name: "phrasebooks",
              icon: "fa fa-comment-alt",
              title: "Word Books",
              show: this.hasPhrasebooks,
            },
            {
              name: "phrasebook",
              show: false,
            },
            {
              name: "phrasebook-phrase",
              show: false,
            },
            {
              name: "chinese-levels",
              icon: "fa fa-signal",
              title: "HSK Words",
              show: ["zh"].includes(this.$l2.code),
            },
            {
              name: "saved-words",
              icon: "fas fa-star",
              title: "My Words",
              badge: this.savedWordsCount,
              show: true,
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              // count: this.stats ? this.stats.allVideos : undefined,
              name: "saved-phrases",
              badge: this.savedPhrasesCount,
              show: true,
              children: [
                {
                  name: "saved-phrases",
                  icon: "fas fa-bookmark",
                  title: "My Phrases",
                  show: true,
                  badge: this.savedPhrasesCount,
                },
                {
                  name: "phrase",
                  icon: "fas fa-search",
                  title: "Look Up Phrases",
                  show: false,
                },
                {
                  name: "minimal-pairs",
                  icon: "fa fa-adjust",
                  title: "Minimal Pairs",
                  show: this.hasFeature("dictionary"),
                },
                {
                  name: "chinese-new-levels",
                  icon: "fa fa-signal",
                  title: "New HSK Words",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "chinese-new-levels-graphic",
                  icon: "fas fa-exchange-alt",
                  title: "Old vs New HSK",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "compare",
                  show: false,
                },
                {
                  name: "compare-phrases",
                  show: false,
                },
                {
                  name: "chinese-explore-related",
                  icon: "fas fa-project-diagram",
                  title: "Word Explorer",
                  params: { arg: "中國,zhōng_guó,0" },
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "chinese-explore-roots",
                  icon: "fa fa-wrench",
                  title: "Word Builder",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "chinese-idioms",
                  icon: "fa fa-border-all",
                  title: "Idioms",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "chinese-radicals",
                  icon: "fa fa-code-branch",
                  title: "Radicals",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "chinese-characters",
                  icon: "fa fa-pen-alt",
                  title: "Characters",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "chinese-separable",
                  icon: "fa fa-angle-double-right",
                  title: "Separables",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "chinese-explore-topics",
                  icon: "fas fa-certificate",
                  title: "Words by Topic",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "transcription",
                  title: "Phonetic Transcription",
                  icon: "fa-regular fa-comment-lines",
                  show: true,
                },
                {
                  name: "chinese-pinyin-list",
                  title: "Pinyin List",
                  icon: "fa fa-list",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "chinese-lookup-by-tones",
                  title: "Lookup by Tones",
                  icon: "fa fa-music",
                  show: ["zh"].includes(this.$l2.code),
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
              name: "learning-path",
              title: "Path",
              show: true,
            },
            {
              name: "grammar",
              icon: "fas fa-list-ul",
              title: "Grammar",
              show: ["zh", "ja", "ko"].includes(this.$l2.code),
            },
            {
              name: "grammar-view",
              show: false,
            },
            {
              name: "resources",
              title: "Resources",
              icon: "fas fa-gem",
              show: true,
            },
            {
              name: "articles-reddit",
              title: "Forum",
              icon: "fab fa-reddit",
              show: true,
              params: { method: "list" },
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              name: "tutoring",
              show: true,
              children: [
                {
                  name: "language-info",
                  title: `Language Info`,
                  icon: "fas fa-flag",
                  show: true,
                },
                {
                  name: "tutoring",
                  title: "Tutoring Kit",
                  icon: "fas fa-folder",
                  show: true,
                },
                {
                  name: "tutoring-lesson",
                  show: false,
                },
                {
                  name: "ling-phonological-features",
                  show: false,
                },
                {
                  name: "klingon-keyboard",
                  icon: "fas fa-keyboard",
                  title: "Keyboard",
                  show: ["tlh"].includes(this.$l2.code),
                },
                {
                  name: "hindi-bookmarklet",
                  icon: "fas fa-bookmark",
                  title: "Bookmarklet",
                  show: ["hi"].includes(this.$l2.code),
                },
                {
                  name: "studysheet",
                  title: "Study Sheet",
                  icon: "fas fa-print",
                  show: ["ru", "en", "zh"].includes(this.$l2.code),
                },
                {
                  name: "chinese-pinyin-squared",
                  title: "Pinyin Squared",
                  icon: "fa fa-superscript",
                  show: ["zh"].includes(this.$l2.code),
                },
                {
                  name: "ling-language-map",
                  title: `Map of Languages`,
                  icon: "fas fa-globe-asia",
                  show: true,
                },
                {
                  name: "ling-language-icons",
                  title: "Face of the Language",
                  icon: "fas fa-user",
                  badge: this.savedWordsCount + this.savedPhrasesCount,
                  show: true,
                },
                {
                  name: "ling-phonological-features",
                  title: "Phonological Features",
                  icon: "fas fa-lips",
                  show: true,
                },
                {
                  name: "ling-compare-languages",
                  title: "Compare Languages",
                  icon: "fa-solid fa-arrow-right-arrow-left",
                  show: true,
                },
                {
                  name: "ling-translators",
                  title: "Web Translators",
                  icon: "fas fa-language",
                  show: true,
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
              name: "about",
              icon: "fas fa-circle-info",
              show: true,
              title: "About",
            },
            {
              name: "popular",
              title: "What's Popular",
              icon: "fas fa-fire",
              show: true,
            },
            {
              name: "faq",
              icon: "fas fa-question-circle",
              show: true,
              title: "FAQ",
            },
            {
              name: "contact",
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
              ],
            },
          ],
        },
        {
          icon: "fas fa-wrench",
          title: "Admin",
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
              icon: "fas fa-ellipsis-h",
              title: `More`,
              name: "admin-break-lines",
              show: true,
              children: [
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
              name: "profile",
              icon: "fas fa-user",
              title: "Me",
              show: this.$auth?.loggedIn,
            },
            {
              name: "saved-words",
              icon: "fas fa-star",
              title: "My Words",
              show: this.$auth?.loggedIn,
            },
            {
              name: "saved-phrases",
              icon: "fas fa-bookmark",
              title: "My Phrases",
              show: this.$auth?.loggedIn,
            },
            {
              name: "login",
              icon: "fas fa-key",
              title: "Login",
              show: !(this.$auth && this.$auth.loggedIn),
              params: { l1: this.l1.code, l2: this.l2.code },
            },
            {
              name: "register",
              icon: "fas fa-user-plus",
              title: "Register",
              show: !(this.$auth && this.$auth.loggedIn),
              params: { l1: this.l1.code, l2: this.l2.code },
            },
            {
              name: "logout",
              icon: "fas fa-sign-out-alt",
              title: "Logout",
              show: this.$auth?.loggedIn,
              params: { l1: this.l1.code, l2: this.l2.code },
            },
            {
              icon: "fas fa-ellipsis-h",
              title: `More`,
              name: "watch-history",
              show: true,
              children: [
                {
                  name: "watch-history",
                  icon: "fas fa-history",
                  title: "History",
                  show: this.$auth?.loggedIn,
                },
                {
                  name: "bookshelf",
                  title: "Bookshelf",
                  icon: "fas fa-book-reader",
                  show: this.$auth?.loggedIn,
                },
                {
                  name: "my-text",
                  title: "My Texts",
                  icon: "fas fa-edit",
                  show: this.$auth?.loggedIn,
                },
                {
                  name: "settings",
                  icon: "fas fa-cog",
                  title: "Settings",
                  show: true,
                },
              ],
            },
          ],
        },
      ];
      if (this.showOnly)
        items = items.filter((i) => i.title && this.showOnly.includes(i.title));
      return items;
    },
  },
};
