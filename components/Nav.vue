<template>
  <div
    :class="{
      'zth-nav': true,
      'zth-nav-light': skin === 'light',
      'zth-nav-dark': skin === 'dark',
      'zth-nav-menu-bar': variant === 'menu-bar',
      'zth-nav-side-bar': variant === 'side-bar',
      'zth-nav-page': variant === 'page',
      'has-secondary-nav': parent && parent.children,
    }"
  >
    <div class="site-top-bar" v-if="variant === 'menu-bar'">
      <div class="text-center">
        <router-link to="/" class="link-unstyled">
          <i class="fa fa-chevron-left mr-2"></i>
          All Languages
        </router-link>
      </div>
      <div>
        <router-link
          :to="languageMapPath"
          class="btn top-bar-button btn-unstyled link-unstyled"
        >
          <i class="fas fa-globe-asia"></i>
        </router-link>
        <button
          :class="[
            'btn top-bar-button btn-unstyled',
            { 'd-none': !canShare() },
          ]"
          @click="share"
          style="color: #ccc"
        >
          <i class="fa fa-share"></i>
        </button>
        <button
          :class="['btn top-bar-button btn-unstyled', { 'd-none': !isPWA }]"
          @click="reload"
          style="color: #ccc"
        >
          <i class="fas fa-sync-alt"></i>
        </button>
        <LoginButton class="d-inline-block" :icon="false" />
      </div>
    </div>
    <div
      :class="{
        'nav-menu-bar': variant === 'menu-bar',
        'nav-side-bar': variant === 'side-bar',
        'nav-page': variant === 'page',
      }"
      style="z-index: 3"
    >
      <template v-if="variant === 'menu-bar' || variant === 'side-bar'">
        <nav :class="{ 'main-nav': true, tabs: variant === 'menu-bar' }">
          <div
            class="zth-header"
            v-if="variant === 'menu-bar' || variant === 'side-bar'"
          >
            <div class="site-top-bar" v-if="variant === 'side-bar'">
              <router-link to="/" class="link-unstyled">
                <i class="fas fa-chevron-left mr-2"></i>
                All languages
              </router-link>
              <router-link :to="languageMapPath" class="link-unstyled">
                <i class="fas fa-globe-asia"></i>
              </router-link>
            </div>

            <router-link
              v-if="l1.code === 'en' && l2.code === 'zh'"
              to="/en/zh/"
            >
              <img
                src="/img/czh-logo-light.png"
                alt="Chinese Zero to Hero"
                style="max-width: 11rem; margin: 2rem 0 1rem 0"
                class="logo"
                data-not-lazy
              />
            </router-link>
            <router-link
              v-else-if="l1.code === 'zh' && l2.code === 'en'"
              to="/zh/en/"
            >
              <img
                src="/img/ezh-logo-light.png"
                alt="Chinese Zero to Hero"
                style="max-width: 11rem; margin: 1.5rem 0"
                class="logo"
                data-not-lazy
              />
            </router-link>
            <LanguageLogo
              v-else-if="l1 && l2"
              :l1="l1"
              :l2="l2"
              style="margin: 1.5rem 0"
            />
          </div>
          <div
            :class="{ 'main-nav-items': true, tabs: variant === 'menu-bar' }"
          >
            <NuxtLink
              v-for="(item, index) in menu.filter(
                (item) => item.show && to(item)
              )"
              :key="`nav-${index}`"
              :class="{
                'main-nav-item': true,
                tab: variant === 'menu-bar',
                'd-block': variant === 'side-bar',
                'router-link-active':
                  parent && parent.name === nameOfSelfOrFirstChild(item),
              }"
              :to="to(item)"
              :title="item.title"
            >
              <i :class="`${item.icon}`"></i>
              {{ $t(item.title, { l2: $t($l2.name) }) }}
            </NuxtLink>
          </div>
          <div v-if="variant === 'side-bar'" class="end-nav">
            <div
              v-if="$l2 && !['en', 'zh'].includes($l2.code) && $l2.logo"
              class="icon-description"
            >
              <b>ICON IMAGE:</b>
              <span v-if="$l2.logoDesc">
                {{ $l2.logoDesc.replace(/\s/g, " ") }},
              </span>
              a user of {{ $l2.name }} ({{ $l2.code }}).
            </div>
            <LoginButton
              class="end-nav-item"
              v-if="
                ($l1.code === 'zh' && $l2.code === 'en') ||
                ($l1.code === 'en' && $l2.code === 'zh')
              "
            />
          </div>
        </nav>
        <nav class="secondary-nav" v-if="parent && parent.children">
          <template
            v-for="(child, index) in parent.children.filter(
              (child) => child.show
            )"
          >
            <NuxtLink
              :class="{
                'secondary-nav-item': true,
                'd-block': variant === 'side-bar',
              }"
              v-if="!child.href"
              :key="`subnav-${child.name || child.href}-${index}`"
              :to="last(child) || child"
            >
              <i :class="`${child.icon}`"></i>
              {{ $t(child.title, { l2: $t($l2.name) }) }}
              <span
                class="saved-words-count"
                v-cloak
                v-if="child.name === 'saved-words' && savedWordsCount > 0"
              >
                {{ savedWordsCount }}
              </span>
              <span
                class="saved-words-count"
                v-cloak
                v-if="child.name === 'saved-phrases' && savedPhrasesCount > 0"
              >
                {{ savedPhrasesCount }}
              </span>
            </NuxtLink>
            <a
              v-else
              :href="child.href"
              :key="`subnav-${child.name || child.href}-${index}`"
              target="_blank"
              :class="{
                'secondary-nav-item': true,
                'd-block': variant === 'side-bar',
              }"
            >
              <i :class="`${child.icon}`"></i>
              {{ $t(child.title, { l2: $t($l2.name) }) }}
            </a>
          </template>
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
                  v-for="(child, index) in item.children.filter(
                    (child) => child.show
                  )"
                  :key="`subnav-${child.name || child.href}-${index}`"
                  :class="`col-6 col-sm-4 col-lg-3 col-xl-2
                    mb-1
                    p-1
                    feature-card-column
                    feature-card-name-${child.name}`"
                >
                  <NuxtLink
                    v-if="!child.href"
                    :to="last(child) || child"
                    style="height: 100%"
                    :class="`feature-card feature-card-${
                      item.title === 'Media' ? 'dark' : 'dark'
                    } link-unstyled`"
                  >
                    <div class="feature-card-icon">
                      <i
                        :class="`${child.icon} bg-gradient-${item.title.length
                          .toString()
                          .split('')
                          .pop()} gradient-text`"
                      ></i>
                    </div>
                    <div class="feature-card-title">
                      {{ $t(child.title, { l2: $t($l2.name) }) }}
                      <span
                        class="saved-words-count"
                        v-cloak
                        v-if="
                          child.name === 'saved-words' && savedWordsCount > 0
                        "
                      >
                        {{ savedWordsCount }}
                      </span>
                      <span
                        class="saved-words-count"
                        v-cloak
                        v-if="
                          child.name === 'saved-phrases' &&
                          savedPhrasesCount > 0
                        "
                      >
                        {{ savedPhrasesCount }}
                      </span>
                    </div>
                  </NuxtLink>
                  <a
                    v-else
                    :href="child.href"
                    :class="`feature-card feature-card-${
                      item.title === 'Media' ? 'dark' : 'dark'
                    } link-unstyled`"
                    target="_blank"
                  >
                    <div class="feature-card-icon">
                      <i
                        :class="`${child.icon} bg-gradient-${item.title.length
                          .toString()
                          .split('')
                          .pop()} gradient-text`"
                      ></i>
                    </div>
                    <div class="feature-card-title">
                      {{ $t(child.title, { l2: $t($l2.name) }) }}
                    </div>
                  </a>
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
    skin: {
      default: "light", // or 'dark'
    },
    fullHistory: {
      type: Array,
    },
    showOnly: {
      type: Array,
    },
  },
  data() {
    return {
      shortcuts: [],
      history: [],
      hasTVShows: false,
      hasLiveTV: false,
      hasTalks: false,
      musicPath: false,
      moviePath: false,
      newsPath: false,
      hasPhrasebooks: false,
    };
  },
  computed: {
    languageMapPath() {
      if (this.fullHistory) {
        let historyMatches = this.fullHistory.filter((path) => {
          if (path) {
            let r = this.$router.resolve(path);
            return (
              r &&
              r.route &&
              ["language-map"].includes(r.route.name)
            );
          }
        });
        let path = historyMatches.pop();
        if (path) return path;
      }
      return "/language-map";
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
    parent() {
      let parent = this.menu.find((item) => {
        if (this.$route.name === this.nameOfSelfOrFirstChild(item)) return true;
        let href = this.$router.resolve({
          name: this.nameOfSelfOrFirstChild(item),
        }).href;
        if (this.$route.path.includes(href)) return true;
        if (item.children) {
          let childrenNames = item.children.map((child) => child.name);
          if (childrenNames.includes(this.$route.name)) return true;
        }
      });
      return parent;
    },
    menu() {
      let items = [
        {
          icon: "fas fa-graduation-cap",
          title: "Courses",
          show: this.hasFeature("courses"),
          children: [
            {
              name: "courses",
              title: "Courses",
              icon: "fas fa-graduation-cap",
              show: ["zh", "en"].includes(this.l2.code),
            },
            {
              href: "https://chinesezerotohero.teachable.com/",
              title: "Course Directory",
              icon: "fa fa-folder-open",
              show: ["zh"].includes(this.l2.code),
            },
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
              title: "Pricing",
              icon: "fas fa-tag",
              show: this.l2.code === "zh",
            },
            {
              name: "course-release-schedule",
              title: "Schedule",
              icon: "fas fa-clock",
              show: this.l2.code === "zh",
            },
          ],
        },
        {
          icon: "fas fa-air-freshener",
          title: "What’s New",
          show: true,
          children: [
            {
              name: "updates",
              title: "Updates",
              icon: "fab fa-twitter",
              show: true,
            },
            {
              name: "articles-wiki",
              title: "Blog",
              icon: "fas fa-copy",
              show: true,
            },
          ],
        },
        {
          icon: "fa fa-book",
          title: "Dictionary",
          name: "dictionary",
          show: this.hasFeature("dictionary") || this.hasPhrasebooks,
          children: [
            {
              name: "phrasebooks",
              icon: "fa fa-comment-alt",
              title: "Phrasebooks",
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
              name: "dictionary",
              icon: "fa fa-search",
              title: "Look Up Words",
              show: this.hasFeature("dictionary"),
              shortcut: (e) => e.code === "KeyD" && e.metaKey && e.shiftKey,
            },
            {
              name: "phrase",
              icon: "fas fa-search",
              title: "Look Up Phrases",
              show: false,
              shortcut: (e) => e.code === "KeyP" && e.metaKey && e.shiftKey,
            },
            {
              name: "saved-phrases",
              icon: "fas fa-bookmark",
              title: "Saved Phrases",
              show: true,
            },
            {
              name: "saved-words",
              icon: "fas fa-star",
              title: "Saved Words",
              show: true,
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
          icon: "fas fa-photo-video",
          title: "Media",
          show: this.hasFeature("youtube"),
          children: [
            {
              name: "youtube-browse",
              title: "New Videos",
              icon: "fa fa-play",
              show: true,
            },
            {
              name: "tv-shows",
              icon: "fa fa-tv",
              title: "TV Shows",
              show: this.hasTVShows,
            },
            {
              name: "show",
              show: false,
            },
            {
              path: this.musicPath,
              icon: "fa fa-music",
              title: `Music`,
              show: this.musicPath,
            },
            {
              path: this.moviesPath,
              icon: "fa fa-film",
              title: `Movies`,
              show: this.moviesPath,
            },
            {
              path: this.newsPath,
              icon: "fa fa-newspaper",
              title: `News`,
              show: this.newsPath,
            },
            {
              name: "talks",
              icon: "fas fa-graduation-cap",
              title: `Talks`,
              show: this.hasTalks,
            },
            {
              name: "live-tv",
              icon: "fa fa-broadcast-tower",
              title: "Live TV",
              show: this.hasLiveTV,
            },
            {
              name: "lesson-videos",
              title: "Lesson Expansion",
              icon: "fa fa-chalkboard-teacher",
              show: this.l2.code === "zh",
            },
            {
              name: "youtube-search",
              title: `Search YouTube`,
              icon: "fas fa-search",
              show: true,
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
          icon: "fas fa-pencil-alt",
          title: "Study Aid",
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
              name: "grammar-view",
              show: false,
            },
            {
              name: "noun-cases",
              icon: "fas fa-list-ul",
              title: "Grammar Tools",
              show: this.hasFeature("noun-cases"),
            },
            {
              name: "learning-path",
              title: "Learning Path",
              icon: "fas fa-road",
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
              name: "pinyin-squared",
              title: "Pinyin Squared",
              icon: "fa fa-list",
              show: false,
            },
            {
              name: "tutoring",
              title: "Tutoring Kit",
              icon: "fas fa-folder",
              show: true,
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
              title: "Text Reader",
              icon: "fas fa-file-alt",
              show: true,
              shortcut: (e) => e.code === "KeyR" && e.metaKey && e.shiftKey,
            },
            {
              name: "studysheet",
              title: "Study Sheet",
              icon: "fas fa-print",
              show: ["ru", "en", "zh"].includes(this.$l2.code),
            },
            {
              name: "library",
              title: "Guided Readers",
              icon: "fas fa-book-reader",
              show: true,
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
              name: "pinyin-list",
              title: "Pinyin List",
              icon: "fa fa-list",
              show: this.l2.code === "zh",
            },
          ],
        },
        {
          icon: "fas fa-gem",
          title: "Resources",
          show: true,
          children: [
            {
              name: "resources",
              title: "Resources",
              icon: "fas fa-gem",
              show: true,
            },
            {
              name: "articles-reddit",
              title: "Reddit",
              icon: "fab fa-reddit",
              show: true,
            },
          ],
        },
        {
          icon: "fas fa-id-card",
          title: "Contact",
          show: true,
          children: [
            {
              name: "contact",
              icon: "fas fa-id-card",
              show: true,
              title: "Contact Us",
            },
            {
              name: "affiliate-program",
              icon: "fas fa-money-check-alt",
              show: true,
              title: "Affiliate Program",
            },
            {
              name: "faq",
              icon: "fas fa-question-circle",
              show: this.$hasFeature("courses"),
              title: "FAQ",
            },
          ],
        },
        {
          name: "settings",
          icon: "fas fa-cog",
          title: "Settings",
          shortcut: (e) => e.code === "KeyS" && e.metaKey && e.shiftKey,
          show: true,
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
              title: "Add Phrasebook",
              name: "phrasebook-creator",
              show: this.$adminMode,
            },
            {
              icon: "fas fa-wrench",
              title: "Analytics",
              name: "analytics",
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
          ],
        },
      ];
      if (this.showOnly)
        items = items.filter((i) => i.title && this.showOnly.includes(i.title));
      return items;
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
  },
  mounted() {
    this.bindKeys();
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
      this.history.push(this.$route.path);
    },
  },
  methods: {
    checkPhrasebooks() {
      this.hasPhrasebooks =
        this.$store.state.phrasebooks.phrasebooks &&
        this.$store.state.phrasebooks.phrasebooks[this.l2.code] &&
        this.$store.state.phrasebooks.phrasebooks[this.l2.code].length > 0;
    },
    canShare() {
      return typeof navigator !== "undefined" && navigator.share;
    },
    share() {
      if (navigator.share) {
        navigator.share({
          url: location.href,
        });
      }
    },
    reload() {
      location.reload();
    },
    checkShows() {
      let hasTVShows =
        this.$store.state.shows.tvShows &&
        this.$store.state.shows.tvShows[this.l2.code] &&
        this.$store.state.shows.tvShows[this.l2.code].length > 0;
      let hasTalks =
        this.$store.state.shows.talks &&
        this.$store.state.shows.talks[this.l2.code] &&
        this.$store.state.shows.talks[this.l2.code].length > 0;

      this.hasTVShows =
        hasTVShows &&
        this.$store.state.shows.tvShows[this.l2.code].filter(
          (s) => !["Music", "Movies"].includes(s.title)
        ).length > 0;
      this.hasTalks =
        hasTalks &&
        this.$store.state.shows.talks[this.l2.code].filter(
          (s) => !["News"].includes(s.title)
        ).length > 0;
      if (hasTVShows) {
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
      if (hasTalks) {
        let newsShow = this.$store.state.shows.talks[this.l2.code].find(
          (s) => s.title === "News"
        );
        if (newsShow) {
          this.newsPath = `/${this.$l1.code}/${this.$l2.code}/show/talk/${newsShow.id}`;
        }
      }
    },
    to(item) {
      if (item.to) return item.to;
      let to = this.last(item) || this.selfOrFirstChild(item, true);
      return to;
    },
    hasFeature(feature) {
      return this.$hasFeature(feature);
    },
    nameOfSelfOrFirstChild(item) {
      let result = this.selfOrFirstChild(item);
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
    last(item) {
      if (item) {
        if (item.to) return item.to;
        let historyMatches = this.history.filter((path) => {
          if (path) {
            let r = this.$router.resolve(path);
            if (r && r.route) {
              let childNames = item.children
                ? item.children.map((child) => child.name)
                : [item.name];
              return childNames.includes(r.route.name);
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

<style lang="scss">
.zth-nav.zth-nav-menu-bar,
.zth-nav.zth-nav-side-bar {
  // background: #002d4433;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.main-nav {
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
  display: block;
  .main-nav-item {
    padding: 0.5rem 1rem;
    color: white;
    display: inline-block;
    border: none;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
    border: 1px solid rgba(255, 255, 255, 0);
    border-radius: 0.3rem;
    white-space: nowrap;
    &.nuxt-link-active,
    &:hover {
      text-decoration: none;
    }
  }
}

.zth-nav-light {
  .main-nav-item {
    &.nuxt-link-active,
    &:hover {
      color: #444;
      text-shadow: none;
      background: hsla(0deg, 100%, 100%, 0.75);
      border-top: 1px solid rgba(255, 255, 255, 0.5);
      border-left: 1px solid rgba(255, 255, 255, 0.5);
      border-right: 1px solid rgba(255, 255, 255, 0.5);
    }
  }
  .seoncdary-nav-item {
    &.nuxt-link-active,
    &:hover {
      background: #014161c7;
    }
  }
  .nav-menu-bar {
    .secondary-nav {
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.75) 0%,
        rgba(255, 255, 255, 0.75) 10%,
        rgba(255, 255, 255, 1) 100%
      );
    }
  }
  .nav-side-bar {
    .secondary-nav {
      background: rgba(255, 255, 255, 0.75);
    }
  }
}

.zth-nav-dark {
  .main-nav-item {
    &.nuxt-link-active,
    &:hover {
      color: white;
      background: rgba(65, 65, 65, 0.74);
      border-top: 1px solid rgba(255, 255, 255, 0.4);
    }
  }
  .secondary-nav-item {
    color: white;
    &.nuxt-link-active,
    &:hover {
      color: white;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(148, 148, 148, 0) 5%,
        rgba(122, 122, 122, 0.4) 75%
      );
    }
  }
  .nav-menu-bar {
    .secondary-nav {
      background: linear-gradient(
        180deg,
        rgba(65, 65, 65, 0.74) 0%,
        rgba(0, 0, 0, 0.72) 100%
      );
    }
  }
  .nav-side-bar {
    .secondary-nav {
      background: linear-gradient(
        90deg,
        rgba(65, 65, 65, 0.74) 0%,
        rgba(0, 0, 0, 0.72) 100%
      );
    }
  }
}

.secondary-nav {
  padding: 1rem;
  a svg,
  a i {
    margin-right: 0.5rem;
  }
  height: 100%;
}

.site-top-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  z-index: 2;
  background-color: rgba(29, 29, 29, 0.5);
  position: absolute;
  padding: 0.25rem 1rem;
  a {
    color: #ccc;
    line-height: 2.3rem;
    &:hover {
      color: white;
    }
  }
  .btn {
    padding: 0 0.5rem 0 0;
  }
}

.nav-menu-bar {
  .main-nav {
    text-align: center;
    padding-top: 52px;
    .zth-header {
      .site-top-bar {
        width: 100vw;
      }
    }
    .main-nav-item {
      border-radius: 0.3rem 0.3rem 0 0;
      border-bottom: none;
      margin-right: 0.2rem;
    }
    .zth-header {
      text-align: center;
    }
  }
  .secondary-nav {
    width: 100vw;
    white-space: nowrap;
    overflow: scroll;
    overflow-y: hidden;
    text-align: center;
    min-height: 61px;
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
    .has-secondary-nav & {
      width: 50%;
    }
    padding-left: 1rem;
    margin: 0;
    position: relative;
    .zth-header {
      .logo,
      .logo-constructed {
        transform: scale(0.9);
      }
      .site-top-bar {
        margin-left: -1rem;
        padding-left: 1.5rem;
        margin-top: -2.6rem;
      }
      padding-top: 2.6rem;
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
    .main-nav-item {
      border-radius: 0.3rem 0 0 0.3rem;
      border-right: 0;
      padding-left: 0.5rem;
      margin: 0.3rem 0;
      i {
        width: 2rem;
        text-align: center;
      }
    }
    .end-nav {
      position: absolute;
      width: calc(100% - 1rem);
      bottom: 1rem;
      left: 1rem;

      .icon-description {
        color: #ffffffcc;
        font-size: 0.7rem;
        padding-right: 1rem;
        z-index: -9;
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
    padding: 0.5rem;
    .secondary-nav-item {
      padding: 0.5rem;
      margin: 0.5rem;
      i {
        width: 1.5rem;
        text-align: center;
      }
    }
  }
}

.tab-saved-words.nuxt-link-active,
.tab-saved-words:hover {
  color: #f8b61e;
}

.tab-saved-words-count[v-cloak] {
  display: none;
}

.tab-saved-words.nuxt-link-active .tab-saved-words-count,
.tab-saved-words:hover .tab-saved-words-count {
  background: #f8b61e;
  color: white;
}

.saved-words-count {
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: bold;
  display: inline-block;
  line-height: 1.2rem;
  text-align: center;
  position: relative;
  top: -0.1rem;
  position: relative;
  min-width: 1.3rem;
  margin-left: 0.2rem;
  opacity: 0.7;
  display: inline-block;
}

.zth-nav-light {
  .saved-words-count {
    background: #666;
    color: white;
  }
}

.zth-nav-dark {
  .saved-words-count {
    background: white;
    color: black;
  }
}

.nuxt-link-active .saved-words-count {
  color: rgba(1, 65, 97, 0.78039);
  background: white;
}

.secondary-nav-item {
  padding: 0.5rem 1rem;
  margin: 0.2rem;
  border-radius: 0.3rem;
  color: #666;
  display: inline-block;
  white-space: nowrap;
}

.secondary-nav-item:hover {
  text-decoration: none;
  color: inherit;
  background-color: #f7f7f7;
}

.secondary-nav-item.nuxt-link-active {
  background: #666;
  color: white;
}
.feature-card-column:hover {
  z-index: 1;
}

.feature-card-column {
  .feature-card {
    padding: 0.75rem;
    font-size: 1.2em;
    border-radius: 0.5rem;
    box-shadow: 0 10px 30px rgba(68, 75, 134, 0.2);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    display: block;
    text-align: center;
    &:hover {
      transform: scale(115%);
      transition: 200ms ease-in-out;
      background-color: hsla(0deg, 100%, 100%, 0.8);
    }
    &.feature-card-light {
      background-color: hsla(0deg, 100%, 100%, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.9);
      color: #333;
      &:hover {
        color: #444;
      }
    }
    &.feature-card-dark {
      background-color: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.226);
      border-top: 1px solid rgba(255, 255, 255, 0.5);
      border-bottom: 1px solid rgba(0, 0, 0, 0.5);
      color: rgba(255, 255, 255, 0.8);
      &:hover {
        color: white;
      }
    }
    .feature-card-icon {
      font-size: 2rem;
      opacity: 1;
      display: block;
    }
    .feature-card-title {
      font-size: 0.9em;
      line-height: 1;
      display: block;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.logo {
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
}
</style>
