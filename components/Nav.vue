<template>
  <div
    :class="{
      'zth-nav-light': skin === 'light',
      'zth-nav-dark': skin === 'dark',
      'zth-nav-menu-bar': variant === 'menu-bar',
      'zth-nav-side-bar': variant === 'side-bar',
      'zth-nav-page': variant === 'page',
      'zth-nav-collapsed': collapsed,
      'zth-nav-bottom': bottom,
      'zth-nav-bottom-hidden': hidden,
      'has-secondary-nav': currentParent && currentParent.children,
    }"
  >
    <SiteTopBar
      v-if="variant === 'side-bar'"
      :variant="variant"
      :badge="savedWordsCount + savedPhrasesCount"
      @toggleCollapsed="toggleCollapsed"
    />
    <div
      :class="{
        'nav-menu-bar': variant === 'menu-bar',
        'nav-side-bar': variant === 'side-bar',
        'nav-page': variant === 'page',
      }"
    >
      <template v-if="variant === 'menu-bar' || variant === 'side-bar'">
        <nav :class="{ 'main-nav': true }">
          <!-- <div class="zth-header" v-if="showLogo">
            <LanguageLogo
              v-if="l1 && l2"
              :l1="l1"
              :l2="l2"
              branded="true"
              :icon="collapsed && variant === 'side-bar'"
              style="margin: 1.25rem 0 0.25rem 0"
            />
          </div> -->
          <div v-if="showMainNav" :class="{ 'main-nav-items': true }">
            <template
              v-for="(item, index) in menu.filter(
                (item) => item.show && to(item)
              )"
            >
              <!-- main nav items -->
              <NavItem
                :to="to(item)"
                :item="item"
                :level="1"
                :mode="mode"
                :key="`nav-${index}`"
                :active="
                  currentParent &&
                  currentParent === item &&
                  item.name !== 'index'
                "
                :badge="
                  item.icon === 'fas fa-user'
                    ? savedWordsCount + savedPhrasesCount
                    : undefined
                "
              />
            </template>
          </div>
          <div
            v-if="showMainNav && variant === 'side-bar' && !collapsed"
            class="end-nav"
          >
            <div v-if="$l2.logo" class="icon-description">
              <img
                class="logo-circle"
                :src="`/img/logo-square/${l2.code}.jpeg`"
                :alt="$l2.logoDesc"
              />
              <span v-if="$l2.logoDesc">
                {{ $l2.logoDesc.replace(/\s/g, " ") }},
              </span>
              a user of
              <b>{{ $l2.name }} ({{ $l2.code }})</b>
              .
            </div>
          </div>
        </nav>
        <nav
          v-if="showSecondaryNav && currentParent && currentParent.children"
          class="secondary-nav"
        >
          <!-- secondary nav items -->

          <router-link
            v-for="(child, index) in currentParent.children.filter(
              (child) => child.show
            )"
            :to="last(child) || child"
            :key="`subnav-item-${child.name || child.href}-${index}`"
            v-slot="{ href, route, navigate, isActive, isExactActive }"
            custom
          >
            <NavItem
              :mode="mode"
              :to="route.path"
              :item="child"
              :level="2"
              :showIcon="variant === 'side-bar'"
              :active="isExactActive"
              :badge="
                child.name === 'saved-words' && savedWordsCount > 0
                  ? savedWordsCount
                  : child.name === 'saved-phrases' && savedPhrasesCount > 0
                  ? savedPhrasesCount
                  : undefined
              "
              :href="child.href"
            />
          </router-link>
        </nav>
      </template>
      <template v-if="variant === 'page'">
        <div class="container">
          <div class="row">
            <template
              v-for="item in menu.filter(
                (item) =>
                  item.show &&
                  to(item) &&
                  !['Admin', 'Contact', 'Settings'].includes(item.title)
              )"
            >
              <template v-if="typeof item !== 'undefined' && item.children">
                <div
                  v-for="(child, index) in childrenAndGrandchildren(
                    item
                  ).filter((child) => child.show)"
                  :key="`subnav-${child.name || child.href}-${index}`"
                  :class="`col-6 col-sm-4 col-lg-3 col-xl-2
mb-1
p-1
feature-card-column
feature-card-name-${child.name}`"
                >
                  <NavItem
                    v-if="!child.children"
                    :to="last(child) || child"
                    :item="child"
                    mode="large-icon"
                    :badge="
                      child.name === 'saved-words' && savedWordsCount > 0
                        ? savedWordsCount
                        : child.name === 'saved-phrases' &&
                          savedPhrasesCount > 0
                        ? savedPhrasesCount
                        : undefined
                    "
                  ></NavItem>
                </div>
              </template>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";
import { mapState } from "vuex";
import { topics as TOPICS, languageLevels } from "@/lib/utils/language-levels";

export default {
  props: {
    l1: {
      type: Object,
    },
    l2: {
      type: Object,
    },
    variant: {
      default: "menu-bar", // or 'page', or 'side-bar'
    },
    bottom: {
      type: Boolean,
      default: false,
    },
    skin: {
      default: "light", // or 'dark'
    },
    mode: {
      type: String,
      default: "pill", // or 'icon'
    },
    showOnly: {
      type: Array,
    },
    showLogo: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    showMainNav: {
      type: Boolean,
      default: true,
    },
    showSecondaryNav: {
      type: Boolean,
      default: true,
    },
    autoHide: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      shortcuts: [],
      hidden: false,
      tvShowsCount: false,
      hasLiveTV: false,
      talksCount: false,
      audioBooksCount: false,
      musicPath: false,
      moviePath: false,
      newsPath: false,
      hasPhrasebooks: false,
      collapsed: false,
      stats: undefined,
    };
  },
  mounted() {
    this.bindKeys();
    if (this.$route.meta.collapseNav)
      this.collapsed = this.$route.meta.collapseNav;
    this.$emit("collapsed", this.collapsed);
    this.bindAutoHideBottomBarEvent();
  },
  created() {
    this.checkShows();
    this.checkPhrasebooks();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.checkShows();
      }
      if (mutation.type.startsWith("phrasebooks")) {
        this.checkPhrasebooks();
      }
      if (mutation.type.startsWith("stats")) {
        this.checkStats();
      }
    });
    if (this.$hasFeature("live-tv")) {
      this.hasLiveTV = true;
    }
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  unmounted() {
    this.unbindKeys();
  },
  watch: {
    $route() {
      if (this.$route.meta.collapseNav)
        this.collapsed = this.$route.meta.collapseNav;
      else this.collapsed = false;
      this.hidden = false;
    },
    collapsed() {
      this.$emit("collapsed", this.collapsed);
    },
  },
  computed: {
    ...mapState("fullHistory", ["fullHistory"]),
    fullHistoryPathsByL1L2() {
      return this.$store.getters["fullHistory/fullHistoryPathsByL1L2"]({
        l1: this.l1,
        l2: this.l2,
      });
    },
    userIsAdmin() {
      return this.$auth.user && this.$auth.user.role == 1;
    },
    native() {
      return Capacitor.isNativePlatform();
    },
    savedWordsCount() {
      let count = this.$store.getters["savedWords/count"]({ l2: this.l2.code });
      // eslint-disable-next-line vue/no-parsing-error
      return count;
    },
    savedPhrasesCount() {
      let count = this.$store.getters["savedPhrases/count"]({
        l2: this.l2.code,
      });
      // eslint-disable-next-line vue/no-parsing-error
      return count;
    },
    isPWA() {
      return (
        (typeof navigator !== "undefined" && navigator.standalone) ||
        (typeof window !== "undefined" &&
          window.matchMedia("(display-mode: standalone)").matches)
      );
    },
    currentParent() {
      return this.findParent(this.$route.name);
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    levels() {
      if (this.$l2) {
        return languageLevels(this.$l2);
      }
    },
    menu() {
      let items = [
        {
          icon: "fas fa-home",
          name: "learning-path",
          title: "Home",
          show: true,
        },
        {
          icon: "fas fa-play",
          title: "Media",
          show: true,
          children: [
            {
              name: "all-media",
              icon: "fas fa-telescope",
              title: `Explore`,
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
              name: "talks",
              title: `YouTube`,
              count: this.talksCount,
              icon: "fab fa-youtube",
              show: this.talksCount,
            },
            {
              name: "live-tv",
              icon: "fa fa-tv-retro",
              title: "Live TV",
              show: this.hasLiveTV,
            },
            {
              icon: "fa fa-grid-2",
              title: `Topics`,
              // count: this.stats ? this.stats.allVideos : undefined,
              name: "watch-history",
              show: true,
              children: [
                // {
                //   name: "all-media",
                //   icon: "fas fa-telescope",
                //   title: `Explore`,
                //   // count: this.stats ? this.stats.allVideos : undefined,
                //   show: this.$route.name !== "all-media",
                // },
                {
                  name: "watch-history",
                  icon: "fas fa-history",
                  title: "My History",
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
                  path: this.musicPath,
                  icon: "fa fa-music",
                  title: `Music`,
                  count: this.stats ? this.stats.music : undefined,
                  show: this.musicPath,
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
                  params: { topic: "kids", level: "all" },
                  show: true,
                },
                // {
                //   name: "live-tv",
                //   icon: "fa fa-tv-retro",
                //   title: "Live TV",
                //   show: this.hasLiveTV,
                // },
                {
                  name: "lesson-videos",
                  title: "Lesson Expansion",
                  icon: "fa fa-chalkboard-teacher",
                  show: this.l2.code === "zh",
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
                ...Object.keys(TOPICS).map((key) => {
                  let title = TOPICS[key];
                  return {
                    name: "youtube-browse",
                    params: { topic: key, level: "all" },
                    title,
                    show: true,
                    icon: "fa-solid fa-films",
                  };
                }),
                ...Object.keys(this.levels).map((key) => {
                  let title = this.levels[key].name;
                  return {
                    name: "youtube-browse",
                    params: { topic: "all", level: key },
                    title,
                    show: true,
                    icon: "fa-solid fa-films",
                  };
                }),
                {
                  name: "youtube-browse",
                  title: `Other`,
                  // count: this.stats ? this.stats.newVideos : undefined,
                  icon: "fa-solid fa-films",
                  show: true,
                },
              ],
            },
            // {
            //   name: "talks",
            //   icon: "fab fa-youtube",
            //   title: `YouTube`,
            //   count: this.talksCount,
            //   show: this.talksCount,
            // },
            // {
            //   name: "youtube-search",
            //   title: `Search`,
            //   icon: "fas fa-search",
            //   show: true,
            // },
            {
              name: "show",
              show: false,
            },
            {
              name: "youtube-view",
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
              show: true,
              // shortcut: (e) => e.code === "KeyR" && e.metaKey && e.shiftKey,
            },
            {
              name: "my-text",
              title: "My Texts",
              icon: "fas fa-edit",
              show: this.$auth?.loggedIn,
            },
            {
              name: "books",
              title: "Books",
              icon: "fas fa-book",
              show: true,
            },
            {
              name: "gutenberg",
              show: false,
            },
            {
              name: "web-reader",
              title: "Web Reader",
              icon: "fas fa-globe-asia",
              show: true,
              // shortcut: (e) => e.code === "KeyR" && e.metaKey && e.shiftKey,
            },
            {
              icon: "fa fa-grid-2",
              title: `More`,
              // count: this.stats ? this.stats.allVideos : undefined,
              name: "library",
              show: true,
              children: [
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
              shortcut: (e) => e.code === "KeyD" && e.metaKey && e.shiftKey,
            },
            {
              name: "phrasebooks",
              icon: "fa fa-comment-alt",
              title: "Phrasebooks",
              show: this.hasPhrasebooks,
            },
            {
              name: "saved-words",
              icon: "fas fa-star",
              title: "Saved Words",
              show: true,
            },
            {
              name: "saved-phrases",
              icon: "fas fa-bookmark",
              title: "Saved Phrases",
              show: true,
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
              name: "phrase",
              icon: "fas fa-search",
              title: "Look Up Phrases",
              show: false,
              shortcut: (e) => e.code === "KeyP" && e.metaKey && e.shiftKey,
            },
            {
              name: "minimal-pairs",
              icon: "fa fa-adjust",
              title: "Minimal Pairs",
              show: this.hasFeature("dictionary"),
            },
            {
              name: "levels",
              icon: "fa fa-signal",
              title: "HSK Words",
              show: this.hasFeature("levels"),
            },
            {
              name: "new-levels",
              icon: "fa fa-signal",
              title: "New HSK Words",
              show: this.hasFeature("levels"),
            },
            {
              name: "new-levels-graphic",
              icon: "fas fa-exchange-alt",
              title: "Old vs New HSK",
              show: this.hasFeature("levels"),
            },
            {
              name: "compare",
              show: false,
            },
            {
              name: "compare-phrases",
              show: false,
            },
          ],
        },
        {
          icon: "fas fa-gem",
          title: "Resources",
          show: true,
          children: [
            {
              name: "grammar",
              icon: "fas fa-list-ul",
              title: "Grammar",
              show: this.hasFeature("grammar"),
              shortcut: (e) => e.code === "KeyG" && e.metaKey && e.shiftKey,
            },
            {
              name: "noun-cases",
              icon: "fas fa-list-ul",
              title: "Grammar",
              show: this.hasFeature("noun-cases"),
            },
            {
              name: "grammar-view",
              show: false,
            },
            {
              name: "courses",
              title: "Courses",
              icon: "fas fa-graduation-cap",
              show: ["zh", "en"].includes(this.l2.code),
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
              icon: "fa fa-grid-2",
              title: `More`,
              // count: this.stats ? this.stats.allVideos : undefined,
              name: "tutoring",
              show: true,
              children: [
                {
                  name: "hall-of-heroes",
                  icon: "fa fa-trophy",
                  title: "Heroes",
                  show: this.l1.code === "en" && this.l2.code === "zh",
                },
                {
                  name: "textbooks-workbooks",
                  title: "Textbooks",
                  icon: "fas fa-book",
                  show: ["zh", "en"].includes(this.l2.code),
                },
                {
                  name: "video-count",
                  title: "Video Count",
                  icon: "fas fa-list-ol",
                  show: this.l2.code === "zh",
                },
                {
                  name: "pricing",
                  title: "Course Pricing",
                  icon: "fas fa-tag",
                  show: this.l2.code === "zh",
                },
                {
                  name: "course-release-schedule",
                  title: "Schedule",
                  icon: "fas fa-clock",
                  show: this.l2.code === "zh",
                },
                {
                  name: "affiliate-program",
                  icon: "fas fa-money-check-alt",
                  show: this.l2.code === "zh",
                  title: "Affiliate Program",
                },
                {
                  name: "explore-related",
                  icon: "fas fa-project-diagram",
                  title: "Word Explorer",
                  params: { arg: "中國,zhōng_guó,0" },
                  show: this.hasFeature("related"),
                },
                {
                  name: "explore-roots",
                  icon: "fa fa-wrench",
                  title: "Word Builder",
                  show: this.hasFeature("roots"),
                },
                {
                  name: "idioms",
                  icon: "fa fa-border-all",
                  title: "Idioms",
                  show: this.l2.code === "zh",
                },
                {
                  name: "radicals",
                  icon: "fa fa-code-branch",
                  title: "Radicals",
                  show: this.hasFeature("radicals"),
                },
                {
                  name: "characters",
                  icon: "fa fa-pen-alt",
                  title: "Characters",
                  show: this.hasFeature("characters"),
                },
                {
                  name: "separable",
                  icon: "fa fa-angle-double-right",
                  title: "Separables",
                  show: this.l2.code === "zh",
                },
                {
                  name: "explore-topics",
                  icon: "fas fa-certificate",
                  title: "Words by Topic",
                  show: this.hasFeature("explore-topics"),
                },
                {
                  name: "learn",
                  show: false,
                },
                {
                  name: "learn-interactive",
                  show: false,
                },
                {
                  name: "language-info",
                  title: `About {l2}`,
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
                  name: "keyboard",
                  icon: "fas fa-keyboard",
                  title: "Keyboard",
                  show: this.hasFeature("keyboard"),
                },
                {
                  name: "bookmarklet",
                  icon: "fas fa-bookmark",
                  title: "Bookmarklet",
                  show: this.hasFeature("bookmarklet"),
                },
                {
                  name: "pinyin-list",
                  title: "Pinyin List",
                  icon: "fa fa-list",
                  show: this.l2.code === "zh",
                },
                {
                  name: "studysheet",
                  title: "Study Sheet",
                  icon: "fas fa-print",
                  show: ["ru", "en", "zh"].includes(this.$l2.code),
                },
                {
                  name: "pinyin-squared",
                  title: "Pinyin Squared",
                  icon: "fa fa-superscript",
                  show: this.l2.code === "zh",
                },
                {
                  name: "language-icons",
                  title: "Language Users",
                  icon: "fas fa-user",
                  show: true,
                },
                {
                  name: "compare-languages",
                  title: "Compare Languages",
                  icon: "fas fa-globe-asia",
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
          icon: "fas fa-briefcase",
          title: "JW",
          show: this.userIsAdmin && this.$adminMode,
          children: [
            // {
            //   name: "jw-video",
            //   title: "Video",
            //   params: { languageAgnosticNaturalKey: "pub-mwbv_202205_3_VIDEO" },
            //   icon: "fas fa-book",
            //   show: this.userIsAdmin,
            // },
            {
              name: "jw-bible",
              title: "Bible",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-daytext",
              title: "Daily Text",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-explore",
              title: "Explore",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-meeting",
              title: "Meeting",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-publications",
              title: "Publications",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-questions",
              title: "Questions",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-diff-view",
              title: "Diff",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-history",
              title: "History",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-jesus",
              title: "Jesus' Life",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-maps",
              title: "Maps",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-search",
              title: "Search",
              icon: "fas fa-book",
              show: this.userIsAdmin,
            },
            {
              name: "jw-bible-book",
              show: false,
            },
            {
              name: "jw-bible-chapter",
              show: false,
            },
            {
              name: "jw-article",
              show: false,
            },
          ],
        },
        {
          icon: "fas fa-ellipsis-h",
          title: "More",
          show: true,
          children: [
            {
              name: "settings",
              icon: "fas fa-cog",
              title: "Settings",
              shortcut: (e) => e.code === "KeyS" && e.metaKey && e.shiftKey,
              show: true,
            },
            // {
            //   name: "discussions",
            //   icon: "fas fa-comment",
            //   show: true,
            //   title: "Forum",
            // },
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
              name: "page",
              params: { id: 17 },
              icon: "fas fa-file",
              title: "Privacy Policy",
              show: true,
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
              title: "Phrase Survey",
              name: "phrase-survey",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Text Survey",
              name: "ngram",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Add Phrasebook",
              name: "phrasebook-creator",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Test",
              name: "test",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Break Lines",
              name: "break-lines",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "JSON to CSV",
              name: "json-to-csv",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Wiktionary CSV",
              name: "wiktionary-csv",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "DB Audit",
              name: "db-audit",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "DB Upgrade",
              name: "db-upgrade",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Recover Subs",
              name: "recover-subs",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Assign Lesson Videos",
              name: "assign-lesson-videos",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Unavailable Videos",
              name: "unavailable-videos",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Analytics",
              name: "analytics",
              show: this.$adminMode,
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
              ? "Hi, " + this.$auth.user.first_name
              : "Login"
          }`,
          show: false,
          exact: true,
          children: [
            {
              name: "saved-words",
              icon: "fas fa-star",
              title: "Saved Words",
              show: this.$auth?.loggedIn,
            },
            {
              name: "saved-phrases",
              icon: "fas fa-bookmark",
              title: "Saved Phrases",
              show: this.$auth?.loggedIn,
            },
            {
              name: "watch-history",
              icon: "fas fa-history",
              title: "Watch History",
              show: this.$auth?.loggedIn,
            },
            {
              name: "bookshelf",
              title: "My Bookshelf",
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
              name: "profile",
              icon: "fas fa-user",
              title: "Profile & Progress",
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
            // {
            //   href: "https://sso.teachable.com/secure/133035/identity/login",
            //   icon: "fas fa-graduation-cap",
            //   title: "My Teachable Courses",
            //   show: this.$l2 && this.$l2.code === "zh",
            // },
            // {
            //   href: "https://m.cctalk.com/inst/stevmab3",
            //   icon: "fas fa-graduation-cap",
            //   title: "My CCtalk Courses",
            //   show: this.$l2 && this.$l2.code === "en",
            // },
            {
              name: "logout",
              icon: "fas fa-sign-out-alt",
              title: "Logout",
              show: this.$auth?.loggedIn,
              params: { l1: this.l1.code, l2: this.l2.code },
            },
          ],
        },
      ];
      if (this.showOnly)
        items = items.filter((i) => i.title && this.showOnly.includes(i.title));
      return items;
    },
  },
  methods: {
    findParent(name) {
      let parent = this.menu.find((item) => {
        if (item.name === "index") return false;
        let nameOfItemOrFirstChild = this.nameOfSelfOrFirstChild(item, true);
        if (nameOfItemOrFirstChild && name === nameOfItemOrFirstChild)
          return true;
        let href = this.$router.resolve({
          name: nameOfItemOrFirstChild,
        }).href;
        if (nameOfItemOrFirstChild && this.$route.path.includes(href))
          return true;
        if (item.children) {
          for (let child of item.children) {
            if (child.name === name) return true;
            if (child.children) {
              for (let grandchild of child.children) {
                if (grandchild.name === name) return true;
              }
            }
          }
        }
      });
      return parent;
    },
    /* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
    /* https://www.w3schools.com/howto/howto_js_navbar_hide_scroll.asp */
    bindAutoHideBottomBarEvent() {
      if (this.bottom && this.autoHide) {
        var prevScrollpos = window.pageYOffset;
        window.onscroll = () => {
          if (this.bottom) {
            var currentScrollPos = window.pageYOffset;
            if (prevScrollpos > currentScrollPos + 5) {
              this.hidden = false;
            } else if (prevScrollpos < currentScrollPos - 5) {
              this.hidden = true;
            }
            prevScrollpos = currentScrollPos;
          }
        };
      }
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    checkPhrasebooks() {
      this.hasPhrasebooks =
        this.$store.state.phrasebooks.phrasebooks &&
        this.$store.state.phrasebooks.phrasebooks[this.l2.code] &&
        this.$store.state.phrasebooks.phrasebooks[this.l2.code].length > 0;
    },
    checkStats() {
      this.stats =
        this.$store.state.stats.stats &&
        this.$store.state.stats.stats[this.l2.code];
    },
    checkShows() {
      let tvShowsCount =
        this.$store.state.shows.tvShows &&
        this.$store.state.shows.tvShows[this.l2.code] &&
        this.$store.state.shows.tvShows[this.l2.code].filter(
          (s) => !["Music", "Movies"].includes(s.title)
        ).length;

      let talksCount =
        this.$store.state.shows.talks &&
        this.$store.state.shows.talks[this.l2.code] &&
        this.$store.state.shows.talks[this.l2.code].filter(
          (s) => !["News"].includes(s.title) && !s.audiobook
        ).length;
      this.tvShowsCount = tvShowsCount;
      this.talksCount = talksCount;
      if (tvShowsCount > 0) {
        let musicShow = this.$store.state.shows.tvShows[this.l2.code].find(
          (s) => s.title === "Music"
        );
        if (musicShow) {
          this.musicPath = `/${this.$l1.code}/${this.$l2.code}/show/tv-show/${musicShow.id}`;
        }
        let moviesShow = this.$store.state.shows.tvShows[this.l2.code].find(
          (s) => s.title === "Movies"
        );
        if (moviesShow) {
          this.moviesPath = `/${this.$l1.code}/${this.$l2.code}/show/tv-show/${moviesShow.id}`;
        }
      }
      if (talksCount > 0) {
        let newsShow = this.$store.state.shows.talks[this.l2.code].find(
          (s) => s.title === "News"
        );
        if (newsShow) {
          this.newsPath = `/${this.$l1.code}/${this.$l2.code}/show/talk/${newsShow.id}`;
        }
        let audiobooks = this.$store.state.shows.talks[this.l2.code].filter(
          (s) => s.audiobook
        );
        this.audioBooksCount = audiobooks.length;
      }
    },
    to(item) {
      if (item.to) return item.to;
      let selfOrFirstChild = this.selfOrFirstChild(item, true);
      if (this.currentParent === item) return selfOrFirstChild; // Clicking on the same navigation item as the currently active one should return to the "root' of that navigation item
      if (item.exact) return selfOrFirstChild;
      else return this.last(item) || selfOrFirstChild;
    },
    hasFeature(feature) {
      return this.$hasFeature(feature);
    },
    nameOfSelfOrFirstChild(item, visibleOnly) {
      let result = this.selfOrFirstChild(item, visibleOnly);
      if (result) {
        return result.name;
      }
    },
    selfOrFirstChild(item, visibleOnly) {
      if (item) {
        if (item.children && item.children.length > 0) {
          let children = item.children;
          if (visibleOnly) children = children.filter((c) => c.show);
          return children[0];
        } else {
          return item;
        }
      }
    },
    childrenAndGrandchildren(parent) {
      let items = [];
      let children = parent.children.filter((child) => child.show);
      for (let child of children) {
        if (child.children) {
          items = items.concat(child.children);
        } else items.push(child);
      }
      return items;
    },
    /**
     * Returns the last path in the fullHistory that matches the item's name or the item's children's name
     */
    last(item) {
      if (item) {
        if (item.to) return item.to;
        let historyMatches = this.fullHistoryPathsByL1L2 || [];
        let namesToMatch = [item.name];
        if (item.children)
          namesToMatch = item.children.map((child) => child.name);
        historyMatches = historyMatches
          .filter((path) => path)
          .filter((path) => {
            let resolvedPath = this.$router.resolve(path);
            if (resolvedPath && resolvedPath.route) {
              if (resolvedPath.route.params && resolvedPath.route.params.l2) {
                if (resolvedPath.route.params.l2 !== this.$l2.code)
                  return false; // Never go back to a different language!
              }
              if (namesToMatch.includes(resolvedPath.route.name)) {
                if (item.params) {
                  for (let key in item.params) {
                    if (resolvedPath.route.params?.[key] !== item.params[key])
                      return false;
                  }
                }
                return true;
              }
            }
          });
        let path = historyMatches.pop();
        return path;
      } else {
        return false;
      }
    },
    bindKeys() {
      window.addEventListener("keydown", this.keydown);
      for (let item of this.menu) {
        if (item.shortcut) this.shortcuts.push(item);
        if (item.children) {
          for (let child of item.children) {
            if (child.shortcut) this.shortcuts.push(child);
          }
        }
      }
    },
    unbindKeys() {
      window.removeEventListener("keydown", this.keydown);
    },

    keydown(e) {
      if (!["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase())) {
        for (let shortcutItem of this.shortcuts) {
          if (shortcutItem.shortcut(e)) {
            let last = this.last(shortcutItem);
            this.$router.push(
              last
                ? {
                    path: last,
                  }
                : { name: this.nameOfSelfOrFirstChild(shortcutItem) }
            );
            e.preventDefault();
            return false;
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.zth-nav-wrapper.zth-nav-side-bar {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.zerotohero-wide {
  .zth-nav-wrapper {
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    width: 13rem;
    height: 100vh;
    z-index: 2;
    &.has-secondary-nav {
      width: 26rem;
    }
    &.zth-nav-collapsed {
      width: 4.5rem;
      &.has-secondary-nav {
        width: 9rem;
      }
    }
  }
}

.main-nav {
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
  display: block;
}

.zth-nav-light {
  .nav-menu-bar,
  .nav-side-bar {
    z-index: 3;
  }

  .nav-side-bar {
    .secondary-nav {
      background: rgba(255, 255, 255, 0.75);
    }
  }
  .nav-menu-bar {
    .secondary-nav {
      background: linear-gradient(white 0%, white 66%, transparent 100%);
    }
  }
}

.zth-nav-dark {
  .nav-side-bar {
    .secondary-nav {
      background: linear-gradient(90deg, rgb(50 50 50) 0%, black 100%);
    }
  }
  .nav-menu-bar {
    .secondary-nav {
      background: linear-gradient(black 0%, black 66%, transparent 100%);
    }
  }
}

.zth-nav-menu-bar {
  .zth-header {
    background: rgb(0, 0, 0);
  }
  .secondary-nav {
    padding: 1rem;
    padding-bottom: 2rem;
    position: fixed;
    top: env(safe-area-inset-top) + 3rem;
    z-index: 99;
  }
}

.nav-menu-bar {
  .main-nav {
    text-align: center;

    .zth-header {
      text-align: center;
      padding-bottom: 1rem;
    }
  }

  .secondary-nav {
    width: 100vw;
    white-space: nowrap;
    overflow: scroll;
    overflow-y: hidden;
    text-align: center;
    min-height: 61px;
    ::v-deep .nav-item-count {
      display: none;
    }
  }
}

.zth-nav-bottom {
  position: fixed;
  bottom: 0;
  z-index: 99;
  width: 100%;
  box-shadow: 0 0px 20px rgba(0, 0, 0, 0.15);
  padding-bottom: calc(env(safe-area-inset-bottom) + 0.25rem);
  transition: 0.2s all ease-in-out;
  &.zth-nav-bottom-hidden {
    bottom: -5rem;
    padding-bottom: 0;
  }
  &.zth-nav-dark {
    background: black;
    border-top: 1px solid #666;
  }
  &.zth-nav-light {
    background: white;
    border-top: 1px solid #ccc;
  }
  .main-nav-items {
    padding: 0.5rem 0.5rem 0 0.5rem;
    white-space: nowrap;
    width: 100%;
    overflow: scroll;
  }
}

.nav-side-bar {
  display: flex;
  flex-wrap: nowrap;
  top: 0;
  left: 0;
  height: calc(100% - 2.95rem);

  .main-nav {
    width: 100%;

    .has-secondary-nav & {
      width: 50%;
    }

    margin: 0;
    position: relative;

    .zth-header {
      .logo,
      .logo-constructed {
        transform: scale(0.9);
      }
      text-align: center;
    }

    .zth-header-glass {
      position: fixed;
      top: 0;
      left: 1rem;
      text-align: center;
      background-image: linear-gradient(
        45deg,
        rgba(35, 86, 48, 0.47) 0%,
        rgba(0, 0, 0, 0.78039) 74%
      );
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      width: 23rem;
      z-index: 9;
      box-shadow: 0 5px 20px rgb(0 0 0 / 20%);
      border-radius: 0.25rem;
    }

    .main-nav-items {
      padding-left: 1rem;
      padding-top: 0.75rem;
    }

    .end-nav {
      position: absolute;
      width: calc(100% - 1rem);
      bottom: 1rem;
      left: 1rem;

      .icon-description {
        color: white;
        font-size: 0.7rem;
        padding: 0 1rem 1rem 1rem;
        z-index: -9;
        margin-left: -1rem;
        margin-bottom: -1rem;
        text-shadow: 2px 2px 15px black;

        .logo-circle {
          width: 44px;
          height: 44px;
          -o-object-fit: cover;
          object-fit: cover;
          border-radius: 0.3rem;
          margin-top: 0.2rem;
          margin-bottom: -2px;
          margin-right: 8px;
          display: block;
          box-shadow: 2px 2px 15px rgb(0 0 0 / 50%);
          float: left;
        }
      }
    }

    .end-nav-item {
      border-radius: 0.25rem;
      background-color: rgba(29, 29, 29, 0.5);
      padding: 0.5rem 1rem;
      margin-top: 0.5rem;
      margin-right: 1rem;
      text-align: left;
      display: block;
      color: white;
      cursor: pointer;
      font-size: 0.85em;
    }
  }

  .secondary-nav {
    width: 50%;
    padding: 0.5rem 0 0.5rem 0.5rem;
  }
}

.tab-saved-words-count[v-cloak] {
  display: none;
}

.feature-card-column:hover {
  z-index: 1;
}

.logo {
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
}
</style>
