<template>
  <div
    :class="{
      'zth-nav-light': skin === 'light',
      'zth-nav-dark': skin === 'dark',
      'zth-nav-menu-bar': variant === 'menu-bar',
      'zth-nav-side-bar': variant === 'side-bar',
      'zth-nav-page': variant === 'page',
      'zth-nav-collapsed': collapsed,
      'has-secondary-nav': currentParent && currentParent.children,
    }"
  >
    <SiteTopBar v-if="variant === 'side-bar'" :variant="variant" @toggleCollapsed="toggleCollapsed" />
    <div
      :class="{
        'nav-menu-bar': variant === 'menu-bar',
        'nav-side-bar': variant === 'side-bar',
        'nav-page': variant === 'page',
      }"
    >
      <template v-if="variant === 'menu-bar' || variant === 'side-bar'">
        <nav :class="{ 'main-nav': true, tabs: variant === 'menu-bar' }">
          <div
            class="zth-header"
            v-if="variant === 'menu-bar' || variant === 'side-bar'"
          >
            <LanguageLogo
              v-if="l1 && l2"
              :l1="l1"
              :l2="l2"
              branded="true"
              :icon="collapsed && variant === 'side-bar'"
              style="margin: 1.25rem 0 0.25rem 0"
            />
          </div>
          <div
            :class="{ 'main-nav-items': true, tabs: variant === 'menu-bar' }"
          >
            <NavItem
              v-for="(item, index) in menu.filter(
                (item) => item.show && to(item)
              )"
              :to="to(item)"
              :item="item"
              :level="1"
              :variant="variant"
              :key="`nav-${index}`"
              :active="currentParent && currentParent.name === nameOfSelfOrFirstChild(item)"
              :badge="item.icon === 'fas fa-star' ? savedWordsCount + savedPhrasesCount : undefined"
            />
          </div>
          <div v-if="variant === 'side-bar' && !collapsed" class="end-nav">
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
        <nav class="secondary-nav" v-if="currentParent && currentParent.children">
          <NavItem
            v-for="(child, index) in currentParent.children.filter(
              (child) => child.show && !child.href
            )"
            :key="`subnav-item-${child.name || child.href}-${index}`"
            :variant="variant"
            :to="last(child) || child"
            :item="child"
            :level="2"
            :badge="child.name === 'saved-words' && savedWordsCount > 0 ? savedWordsCount : child.name === 'saved-phrases' && savedPhrasesCount > 0 ? savedPhrasesCount : undefined"
            :href="child.href"
          />

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
                  <NavItem
                    :to="last(child) || child"
                    :item="child"
                    variant="page"
                    :badge="child.name === 'saved-words' && savedWordsCount > 0 ? savedWordsCount : child.name === 'saved-phrases' && savedPhrasesCount > 0 ? savedPhrasesCount : undefined"
                  >
                  </NavItem>
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
      hasAudiobooks: false,
      musicPath: false,
      moviePath: false,
      newsPath: false,
      hasPhrasebooks: false,
      collapsed: false
    };
  },
  mounted() {
    this.bindKeys();
    if (this.$route.meta.collapseNav) this.collapsed = this.$route.meta.collapseNav
    this.$emit('collapsed', this.collapsed)
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
      if (this.$route.meta.collapseNav) this.collapsed = this.$route.meta.collapseNav
      else this.collapsed = false
    },
    collapsed() {
      this.$emit('collapsed', this.collapsed)
    }
  },
  computed: {
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
      let parent = this.menu.find((item) => {
        let nameOfItemOrFirstChild = this.nameOfSelfOrFirstChild(item, true);
        if (
          nameOfItemOrFirstChild &&
          this.$route.name === nameOfItemOrFirstChild
        )
          return true;
        let href = this.$router.resolve({
          name: nameOfItemOrFirstChild,
        }).href;
        if (nameOfItemOrFirstChild && this.$route.path.includes(href))
          return true;
        if (item.children) {
          let childrenNames = item.children.map((child) => child.name);
          if (childrenNames.includes(this.$route.name)) return true;
        }
      });
      return parent;
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
    menu() {
      let items = [
        {
          icon: "fas fa-star",
          title: "Saved Items",
          show: this.savedWordsCount + this.savedPhrasesCount > 0,
          children: [
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
          ],
        },
        {
          icon: "fas fa-photo-video",
          title: "Media",
          show: this.hasFeature("youtube"),
          children: [
            {
              name: "all-media",
              icon: "fa fa-photo-video",
              title: `All Media`,
              show: true,
            },
            {
              path: this.moviesPath,
              icon: "fa fa-film",
              title: `Movies`,
              show: this.moviesPath,
            },
            {
              name: "tv-shows",
              icon: "fa fa-tv",
              title: "TV Shows",
              show: this.hasTVShows,
            },
            {
              name: "talks",
              icon: "fab fa-youtube",
              title: `YouTube Channels`,
              show: this.hasTalks,
            },
            {
              name: "audiobooks",
              icon: "fa fa-book-open",
              title: `Audiobooks`,
              show: this.hasAudiobooks,
            },
            {
              path: this.musicPath,
              icon: "fa fa-music",
              title: `Music`,
              show: this.musicPath,
            },
            {
              path: this.newsPath,
              icon: "fa fa-newspaper",
              title: `News`,
              show: this.newsPath,
            },
            {
              name: "youtube-browse",
              title: "New Videos",
              icon: "fa fa-play",
              show: true,
            },
            {
              name: "show",
              show: false,
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
              title: `Search`,
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
            {
              name: "affiliate-program",
              icon: "fas fa-money-check-alt",
              show: this.l2.code === "zh",
              title: "Affiliate Program",
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
            {
              name: "pinyin-squared",
              title: "Pinyin Squared",
              icon: "fa fa-superscript",
              show: this.l2.code === "zh",
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
              name: "tutoring",
              title: "Tutoring Kit",
              icon: "fas fa-folder",
              show: true,
            },
          ],
        },
        {
          icon: "fas fa-bell",
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
              name: "faq",
              icon: "fas fa-question-circle",
              show: true,
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
  },
  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
    checkPhrasebooks() {
      this.hasPhrasebooks =
        this.$store.state.phrasebooks.phrasebooks &&
        this.$store.state.phrasebooks.phrasebooks[this.l2.code] &&
        this.$store.state.phrasebooks.phrasebooks[this.l2.code].length > 0;
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
        let audiobooks = this.$store.state.shows.talks[this.l2.code].filter(
          (s) => s.audiobook
        );
        this.hasAudiobooks = audiobooks.length > 0;
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
      background: linear-gradient(90deg, rgb(50 50 50) 0%, black 100%);
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

#zerotohero:not(.zerotohero-wide) {
  .nav-menu-bar {
    background: rgb(1, 4, 22);
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
