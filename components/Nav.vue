<template>
  <div>
    <div
      class="container-fluid p-2 pl-3 site-top-bar"
      style="display: flex; justify-content: space-between"
      v-if="variant === 'menu-bar'"
    >
      <div>
        <router-link to="/" class="link-unstyled">
          <i class="fa fa-chevron-left mr-2"></i>
          All Languages
        </router-link>
      </div>
      <button
        :class="['btn btn-unstyled', { 'd-none': !isPWA }]"
        @click="share"
        style="color: #ccc"
      >
        <i class="fa fa-share"></i>
      </button>
      <button
        :class="['btn btn-unstyled', { 'd-none': !isPWA }]"
        @click="reload"
        style="color: #ccc"
      >
        <i class="fas fa-sync-alt"></i>
      </button>
      <LoginButton />
    </div>

    <div
      class="zth-header"
      v-if="variant === 'menu-bar' || variant === 'side-bar'"
    >
      <div class="container-fluid pl-0 pr-0">
        <div class="container">
          <div class="row">
            <div class="col-sm-12 text-center">
              <router-link
                v-if="l1.code === 'en' && l2.code === 'zh'"
                to="/en/zh/online-courses"
              >
                <img
                  src="/img/czh-logo-light.png"
                  alt="Chinese Zero to Hero"
                  style="max-width: 11rem; margin: 1.5rem 0"
                  class="logo"
                  data-not-lazy
                />
              </router-link>
              <router-link
                v-else-if="l1.code === 'zh' && l2.code === 'en'"
                to="/zh/en/online-courses"
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
                style="margin: 2rem"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      :class="{
        'nav-menu-bar': variant === 'menu-bar',
        'nav-sidebar': variant === 'side-bar',
        'nav-page': variant === 'page',
      }"
      style="z-index: 3"
      :set="(parent = getParent())"
    >
      <template v-if="variant === 'menu-bar' || variant === 'side-bar'">
        <nav :class="{ 'main-nav': true, tabs: variant === 'menu-bar' }">
          <div
            v-for="(item, index) in menu.filter(
              (item) => item.show && to(item)
            )"
            :key="`nav-${index}`"
          >
            <NuxtLink
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
              <i :class="item.icon"></i>
              {{ $t(item.title, { l2: $t($l2.name) }) }}
            </NuxtLink>
          </div>
        </nav>
        <nav class="secondary-nav">
          <template v-if="parent && parent.children">
            <NuxtLink
              :class="{
                'secondary-nav-item': true,
                'd-block': variant === 'side-bar',
              }"
              v-for="(child, index) in parent.children.filter(
                (child) => child.show
              )"
              :key="`subnav-${child.name}-${index}`"
              :to="last(child) || child"
            >
              <i :class="child.icon"></i>
              {{ $t(child.title, { l2: $t($l2.name) }) }}
              <span
                class="saved-words-count"
                v-cloak
                v-if="child.name === 'saved-words'"
              >
                {{ savedWordsCount() }}
              </span>
            </NuxtLink>
          </template>
        </nav>
      </template>
      <template v-if="variant === 'page'">
        <div class="container">
          <div class="row mt-5">
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
                  :key="`subnav-${child.name}-${index}`"
                  class="col-sm-6 col-lg-4 mb-4"
                >
                  <NuxtLink
                    class="feature-card link-unstyled"
                    :to="last(child) || child"
                    style="height: 100%"
                  >
                    <div class="feature-card-icon">
                      <i :class="child.icon"></i>
                    </div>
                    <div class="feature-card-title">
                      {{ $t(child.title, { l2: $t($l2.name) }) }}
                      <span
                        class="saved-words-count"
                        v-cloak
                        v-if="child.name === 'saved-words'"
                      >
                        {{ savedWordsCount() }}
                      </span>
                    </div>
                  </NuxtLink>
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
  computed: {
    menu() {
      return [
        {
          icon: "fas fa-wrench",
          title: "Admin",
          show: this.$adminMode,
          children: [
            {
              icon: "fas fa-wrench",
              title: "Test",
              name: "test",
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
              title: "Phrase Survey",
              name: "phrase-survey",
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
        {
          icon: "fas fa-graduation-cap",
          title: "Courses",
          show: this.hasFeature("courses"),
          children: [
            {
              name: "courses",
              title: "Courses",
              icon: "fas fa-chalkboard-teacher",
              show: ["zh", "en"].includes(this.l2.code),
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
          name: "hall-of-heroes",
          icon: "fa fa-trophy",
          title: "Heroes",
          show: this.l1.code === "en" && this.l2.code === "zh",
        },
        {
          icon: "fas fa-video",
          title: "Audio-Visual",
          show: this.hasFeature("youtube"),
          children: [
            {
              name: "live-tv",
              icon: "fa fa-broadcast-tower",
              title: "Live TV",
              show: this.hasLiveTV,
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
              name: "youtube-browse",
              title: `Videos`,
              icon: "fa fa-play",
              show: true,
            },
            {
              name: "youtube-search",
              title: `Search YouTube`,
              icon: "fas fa-search",
              show: true,
            },
            {
              name: "lesson-videos",
              title: "Lesson Expansion",
              icon: "fa fa-chalkboard-teacher",
              show: this.l2.code === "zh",
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
          icon: "fas fa-book",
          title: "Dictionary",
          name: "dictionary",
          show: this.hasFeature("dictionary"),
          children: [
            {
              name: "dictionary",
              icon: "fas fa-search",
              title: "Look Up Words",
              show: this.hasFeature("dictionary"),
              shortcut: (e) => e.code === "KeyD" && e.metaKey && e.shiftKey,
            },
            {
              name: "compare",
              show: false,
            },
            {
              name: "saved-words",
              icon: "fas fa-star",
              title: "Saved Words",
              show: true,
            },
            {
              name: "phrase",
              icon: "fas fa-quote-left",
              title: "Look Up Phrases",
              show: true,
              shortcut: (e) => e.code === "KeyP" && e.metaKey && e.shiftKey,
            },
            {
              name: "phrasebooks",
              icon: "fa fa-book-open",
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
              name: "compare-phrases",
              show: false,
            },
            {
              name: "levels",
              icon: "fa fa-signal",
              title: "HSK",
              show: this.hasFeature("levels"),
            },
            {
              name: "new-levels",
              icon: "fa fa-signal",
              title: "New HSK",
              show: this.hasFeature("levels"),
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
              name: "idioms",
              icon: "fa fa-border-all",
              title: "Idioms",
              show: this.l2.code === "zh",
            },
            {
              name: "separable",
              icon: "fa fa-angle-double-right",
              title: "Separables",
              show: this.l2.code === "zh",
            },
            {
              name: "explore-roots",
              icon: "fa fa-wrench",
              title: "Word Builder",
              show: this.hasFeature("roots"),
            },
            {
              name: "explore-topics",
              icon: "fas fa-certificate",
              title: "Topics",
              show: this.hasFeature("explore-topics"),
            },
            {
              name: "explore-related",
              icon: "fas fa-expand-arrows-alt",
              title: "Related",
              show: this.hasFeature("related"),
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
              title: "Library",
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
          icon: "fas fa-list-ul",
          title: "Grammar",
          show: this.hasFeature("grammar"),
          shortcut: (e) => e.code === "KeyG" && e.metaKey && e.shiftKey,
          children: [
            {
              name: "grammar",
              icon: "fas fa-list-ul",
              title: "Grammar Cheat Sheet",
              show: false,
            },
            {
              name: "grammar-view",
              show: false,
            },
          ],
        },
        {
          name: "noun-cases",
          icon: "fas fa-list-ul",
          title: "Grammar Tools",
          show: this.hasFeature("noun-cases"),
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
          icon: "fas fa-gem",
          title: "Resources",
          show: true,
          children: [
            {
              name: "learning-path",
              title: "Learning Path",
              icon: "fas fa-road",
              show: true,
            },
            {
              name: "resources",
              title: "Resources",
              icon: "fas fa-gem",
              show: true,
            },
            {
              name: "tutoring",
              title: "Tutoring Kit",
              icon: "fas fa-folder",
              show: true,
            },
            {
              name: "articles-reddit",
              title: "Reddit Articles",
              icon: "fab fa-reddit",
              show: true,
            },
            {
              name: "articles-wiki",
              title: "Wiki",
              icon: "fab fa-wikipedia-w",
              show: true,
            },
            {
              name: "pinyin-squared",
              title: "Pinyin Squared",
              icon: "fa fa-list",
              show: false,
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
              icon: "fas fa-id-card",
              show: true,
              title: "Affiliate Program",
            },
            {
              name: "faq",
              icon: "fas fa-id-card",
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
      ];
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
    checkShows() {
      this.hasTVShows =
        this.$store.state.shows.tvShows &&
        this.$store.state.shows.tvShows[this.l2.code] &&
        this.$store.state.shows.tvShows[this.l2.code].length > 0;
      this.hasTalks =
        this.$store.state.shows.talks &&
        this.$store.state.shows.talks[this.l2.code] &&
        this.$store.state.shows.talks[this.l2.code].length > 0;
      if (this.hasTVShows) {
        let musicShow = this.$store.state.shows.tvShows[this.l2.code].find(
          (s) => s.title === "Music"
        );
        if (musicShow) {
          this.musicPath = `/${this.$l1.code}/${this.$l2.code}/show/tv-show/${musicShow.id}`;
        }
      }
      if (this.hasTVShows) {
        let moviesShow = this.$store.state.shows.tvShows[this.l2.code].find(
          (s) => s.title === "Movies"
        );
        if (moviesShow) {
          this.moviesPath = `/${this.$l1.code}/${this.$l2.code}/show/tv-show/${moviesShow.id}`;
        }
      }
      if (this.hasTalks) {
        let newsShow = this.$store.state.shows.talks[this.l2.code].find(
          (s) => s.title === "News"
        );
        if (newsShow) {
          this.newsPath = `/${this.$l1.code}/${this.$l2.code}/show/talk/${newsShow.id}`;
        }
      }
    },
    getParent() {
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
    to(item) {
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
    savedWordsCount() {
      let count = this.$store.getters["savedWords/count"]({ l2: this.l2.code });
      // eslint-disable-next-line vue/no-parsing-error
      return count;
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
.site-top-bar {
  background-color: rgba(29, 29, 29, 0.5);
  position: absolute;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  a {
    color: #ccc;
    line-height: 2.3rem;
  }
}

.logo,
.logo-constructed {
  -webkit-filter: drop-shadow(0 0 10px rgba(0, 0, 0, 1));
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 1));
  text-shadow: 0 0 10px rgba(0, 0, 0, 1);
}

.main-nav {
  margin: 0 auto;
  width: 100%;
  display: block;
  .main-nav-item {
    padding: 0.5rem 1rem;
    color: white;
    display: inline-block;
    border: none;
    text-shadow: 0 0 10px rgba(0, 0, 0, 1);
    border: 1px solid rgba(255, 255, 255, 0);
    border-radius: 0.3rem;
    white-space: nowrap;
    &.nuxt-link-active,
    &:hover {
      color: #444;
      background: hsla(0deg, 100%, 100%, 0.75);
      border-top: 1px solid rgba(255, 255, 255, 0.5);
      border-left: 1px solid rgba(255, 255, 255, 0.5);
      border-right: 1px solid rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      text-decoration: none;
      text-shadow: none;
    }
  }
}

.secondary-nav {
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 1rem;
  a svg,
  a i {
    margin-right: 0.5rem;
  }
  height: 100%;
}

.nav-menu-bar {
  .main-nav {
    text-align: center;
    .main-nav-item {
      border-radius: 0.3rem 0.3rem 0 0;
      border-bottom: none;
      margin-right: 0.2rem;
    }
  }
  .secondary-nav {
    width: 100vw;
    white-space: nowrap;
    overflow: scroll;
    overflow-y: hidden;
    text-align: center;
    min-height: 61px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.75) 0%,
      rgba(255, 255, 255, 0.75) 10%,
      rgba(255, 255, 255, 1) 100%
    );
  }
}

.nav-sidebar {
  display: flex;
  flex-wrap: nowrap;
  top: 0;
  left: 0;
  height: 100%;
  .main-nav {
    width: 11rem;
    padding-left: 1rem;
    .main-nav-item {
      border-radius: 0.3rem 0 0 0.3rem;
      border-right: 0;
      i {
        width: 2rem;
      }
    }
  }
  .secondary-nav {
    width: 14rem;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.75) 0%,
      rgba(255, 255, 255, 0.75) 10%,
      rgba(255, 255, 255, 1) 100%
    );
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
  background: #666;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  color: white;
  font-weight: bold;
  display: inline-block;
  line-height: 1.4rem;
  text-align: center;
  position: relative;
  top: -0.1rem;
  padding: 0 0.35rem;
}

.nuxt-link-active .saved-words-count {
  color: #fd4f1c;
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
.feature-card {
  padding: 2rem;
  display: flex;
  flex-direction: row;
  box-shadow: 0 5px 20px #5517041c !important;
  border-radius: 0.5rem;
  .feature-card-icon {
    padding-right: 1rem;
    font-size: 1.5em;
    color: #fd4f1c;
  }
  .feature-card-title {
    font-size: 1em;
    line-height: 1.5em;
    padding: 0.25em 0;
    flex: 1;
  }
}
</style>
