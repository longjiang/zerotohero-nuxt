<template>
  <div
    :class="{
      [`zth-nav-${$skin}`]: true,
      'zth-nav-menu-bar': variant === 'menu-bar',
      'zth-nav-side-bar': variant === 'side-bar',
      'zth-nav-bottom': variant === 'bottom-bar',
      'zth-nav-main': (variant === level) === 'main',
      'zth-nav-secondary': level === 'secondary',
      'zth-nav-page': variant === 'page',
      'zth-nav-collapsed': collapsed,
      'zth-nav-bottom-hidden': hidden,
    }"
  >
    <div
      :class="{
        'nav-menu-bar': variant === 'menu-bar',
        'nav-side-bar': variant === 'side-bar',
        'nav-page': variant === 'page',
        'nav-bottom-bar': variant === 'bottom-bar',
      }"
    >
      <template v-if="variant !== 'page'">
        <nav v-if="level === 'main'" :class="{ 'main-nav': true }">
          <Logo
            layout="horizontal"
            v-if="variant === 'side-bar'"
            class="mt-5"
            style="margin-left: 1.25rem"
            :skin="$skin"
          />
          <div :class="{ 'main-nav-items': true }">
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
                :variant="variant"
                :key="`nav-${index}`"
                :active="
                  currentParent &&
                  currentParent === item &&
                  item.name !== 'index'
                "
              />
            </template>
          </div>
          <b-button
            v-if="variant === 'side-bar'"
            variant="unstyled collapse-toggle"
            @click="toggleCollapsed"
          >
            <span v-if="!collapsed">
              <i class="fa-solid fa-caret-left mr-1"></i>
              {{ $t("Collapse Menu") }}
            </span>
            <span v-else><i class="fa-solid fa-caret-right"></i></span>
          </b-button>
        </nav>
        <nav
          v-else-if="
            level === 'secondary' && currentParent && currentParent.children
          "
        >
          <!-- secondary nav items -->
          <div class="secondary-nav-items">
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
                :href="child.href"
              />
            </router-link>
          </div>
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
                    variant="page"
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
import { languageLevels, background, LANGS_WITH_LEVELS } from "@/lib/utils";
import { LANGS_WITH_CONTENT } from "@/lib/utils/servers";

export default {
  props: {
    l1: {
      type: Object,
    },
    l2: {
      type: Object,
    },
    level: {
      default: "main", // or "secondary" - which level to show
    },
    variant: {
      default: "menu-bar", // or 'page' (flattened grid), 'side-bar' (on wide screen), or 'bottom-bar' (on small screen)
    },
    skin: {
      default: null, // this overrides user's settings
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
    ...mapState("shows", ["categories"]),
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
    background() {
      return background(this.l2);
    },
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
    levels() {
      // Levels feature works for Chinese, German, English, Spanish, French and Arabic only
      if (this.$l2 && LANGS_WITH_LEVELS.includes(this.$l2.code)) {
        return languageLevels(this.$l2);
      } else return {};
    },
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
              name: "levels",
              icon: "fa fa-signal",
              title: "HSK Words",
              show: this.hasFeature("levels"),
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
                  shortcut: (e) => e.code === "KeyP" && e.metaKey && e.shiftKey,
                },
                {
                  name: "minimal-pairs",
                  icon: "fa fa-adjust",
                  title: "Minimal Pairs",
                  show: this.hasFeature("dictionary"),
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
                  name: "language-map",
                  title: `Map of Languages`,
                  icon: "fas fa-globe-asia",
                  show: true,
                },
                {
                  name: "language-icons",
                  title: "Face of the Language",
                  icon: "fas fa-user",
                  badge: this.savedWordsCount + this.savedPhrasesCount,
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
              ],
            },
          ],
        },
        {
          icon: "fas fa-briefcase",
          title: "JW",
          show: this.userIsAdmin && this.$adminMode,
          children: [
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
          icon: "fas fa-circle-info",
          title: "About",
          show: true,
          children: [
            {
              name: "contact",
              icon: "fas fa-id-card",
              show: true,
              title: "Contact Us",
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
              name: "faq",
              icon: "fas fa-question-circle",
              show: true,
              title: "FAQ",
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
                  shortcut: (e) => e.code === "KeyS" && e.metaKey && e.shiftKey,
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
      if (this.variant === "bottom-bar" && this.autoHide) {
        var prevScrollpos = window.pageYOffset;
        window.onscroll = () => {
          if (this.variant === "bottom-bar") {
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
@import "~@/assets/scss/variables.scss";

.zth-nav-dark {
  &.zth-nav-side-bar {
    background-color: $bg-color-dark-2;
  }
  .collapse-toggle {
    color: white;
    background: rgb(255 255 255 / 20%);
    text-shadow: rgba(0, 0, 0, 0.465) 0 1px 3px;
  }
  &.zth-nav-bottom {
    background: $bg-color-dark-2;
    border-top: 1px solid #666;
  }
}
.zth-nav-light {
  &.zth-nav-side-bar {
    background-color: $bg-color-light-2;
  }
  .collapse-toggle {
    background: white;
  }
  &.zth-nav-bottom {
    background: $bg-color-light-2;
    border-top: rgb(222, 222, 222);
  }
}

.zerotohero-wide {
  .zth-main-nav-wrapper.zth-nav-collapsed {
    width: 5rem;
    :deep(.word-mark) {
      display: none;
    }
  }
}

.zerotohero-wide {
  .zth-main-nav-wrapper {
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    width: 13rem;
    height: 100vh;
    z-index: 2;
  }
}

.main-nav {
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
  display: block;
}

.nav-side-bar {
  background-size: cover;
  .main-nav {
    backdrop-filter: blur(20px);
  }
}

.nav-menu-bar,
.nav-side-bar {
  z-index: 3;
}

.zth-nav-secondary.zth-nav-light {
  background: linear-gradient($bg-color-light-1 0%, $bg-color-light-1 66%, transparent 100%);
}

.zth-nav-secondary.zth-nav-dark {
  background: linear-gradient($bg-color-dark-1 0%, $bg-color-dark-1 66%, transparent 100%);
}

.zth-nav-menu-bar {
  .zth-header {
    background: rgb(0, 0, 0);
  }
}

.zth-nav-secondary {
  width: 100vw;
  white-space: nowrap;
  text-align: center;
  min-height: 61px;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 2rem;
  position: sticky;
  top: calc(env(safe-area-inset-top) + 2.9rem);
  z-index: 19;
  :deep(.nav-item-count) {
    display: none;
  }
}

.zerotohero-wide {
  .zth-nav-secondary {
    width: 100%;
    left: 13rem;
  }

  &.zerotohero-wide-collapsed {
    .zth-nav-secondary {
      width: calc(100vw - 5rem);
      left: 5rem;
    }
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
}

.zth-nav-bottom {
  position: fixed;
  bottom: 0;
  z-index: 99;
  width: 100%;
  padding-bottom: calc(env(safe-area-inset-bottom) + 0.25rem);
  transition: 0.2s all ease-in-out;
  &.zth-nav-bottom-hidden {
    bottom: -5rem;
    padding-bottom: 0;
  }
  .main-nav-items {
    padding: 0.5rem 0.5rem 0 0.5rem;
    white-space: nowrap;
    width: 100%;
    overflow: auto;
    display: flex;
    justify-content: space-around;
  }
}

.nav-side-bar {
  display: flex;
  flex-wrap: nowrap;
  top: 0;
  left: 0;
  height: 100%;

  .main-nav {
    width: 100%;

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
      padding: 1rem;
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

.nav-bottom-bar {
  text-align: center;
  .nav-item-bottom-bar {
    padding: 0.5rem;
  }
}

.top-bar-user-button {
  background: #5a5a5a;
  width: 2.3rem;
  height: 2.3rem;
  display: inline-block;
  vertical-align: middle;
  border-radius: 100%;
  font-size: 1.2rem;
  line-height: 3rem;
  position: relative;
  bottom: 0.07rem;
  .saved-words-count {
    position: absolute;
    font-size: 0.5em;
    bottom: 18px;
    top: inherit;
    right: -5px;
  }
}

.collapse-toggle {
  margin-left: 1rem;
  width: calc(100% - 2rem);
  text-align: center;
  position: absolute;
  bottom: 1rem;
}
</style>
