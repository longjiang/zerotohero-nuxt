<template>
  <div
    class="nav"
    style="z-index: 3"
    :set="
      (parent = menu.find(
        (item) =>
          $route.name === nameOfSelfOrFirstChild(item) ||
          $route.path.includes(
            $router.resolve({ name: nameOfSelfOrFirstChild(item) }).href
          ) ||
          (item.children &&
            item.children.map((child) => child.name).includes($route.name))
      ))
    "
  >
    <nav class="site-nav tabs">
      <NuxtLink
        v-for="(item, index) in menu.filter((item) => item.show)"
        :class="{
          tab: true,
          'router-link-active':
            parent && parent.name === nameOfSelfOrFirstChild(item),
        }"
        :to="last(item) || selfOrFirstChild(item, true)"
        :title="item.title"
        :key="`nav-${index}`"
      >
        <i :class="item.icon"></i>
        {{ $t(item.title) }}
      </NuxtLink>
    </nav>
    <nav
      class="secondary-menu text-center bg-white pt-3"
      v-if="parent && parent.children"
    >
      <NuxtLink
        class="secondary-menu-item"
        v-for="(child, index) in parent.children.filter((child) => child.show)"
        :key="`subnav-${child.name}-${index}`"
        :to="last(child) || child"
      >
        <i :class="child.icon"></i>
        {{ $t(child.title) }}
        <span
          class="saved-words-count"
          v-cloak
          v-if="child.name === 'saved-words'"
        >
          {{ savedWordsCount() }}
        </span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script>
import Config from "@/lib/config";

export default {
  data() {
    return {
      shortcuts: [],
      menu: [
        {
          icon: "fas fa-wrench",
          title: "Admin",
          show: this.adminMode(),
          children: [
            {
              icon: "fas fa-wrench",
              title: "Test",
              name: "test",
              show: this.adminMode(),
            },
            {
              icon: "fas fa-wrench",
              title: "Wiktionary CSV",
              name: "wiktionary-csv",
              show: this.adminMode(),
            },
            {
              icon: "fas fa-wrench",
              title: "DB Upgrade",
              name: "db-upgrade",
              show: this.adminMode(),
            },
            {
              icon: "fas fa-wrench",
              title: "Recover Subs",
              name: "recover-subs",
              show: this.adminMode(),
            },
            {
              icon: "fas fa-wrench",
              title: "Assign Lesson Videos",
              name: "assign-lesson-videos",
              show: this.adminMode(),
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
              title: "Language Courses",
              icon: "fas fa-chalkboard-teacher",
              show: this.l2.code === "zh",
            },
            {
              name: "textbooks-workbooks",
              title: "Textbooks",
              icon: "fas fa-book",
              show: this.l2.code === "zh",
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
              name: "tv-shows",
              icon: "fa fa-tv",
              title: "TV Shows",
              show: false,
            },
            {
              name: "show",
              show: false,
            },
            {
              name: "talks",
              icon: "fas fa-graduation-cap",
              title: "Talks",
              show: false,
            },
            {
              name: "youtube-browse",
              title: "Videos",
              icon: "fa fa-play",
              show: true,
            },
            {
              name: "youtube-search",
              title: "Search YouTube",
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
          show: this.hasFeature("dictionary"),
          children: [
            {
              name: "dictionary",
              icon: "fas fa-font",
              title: "Look Up",
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
              title: "Saved",
              show: true,
            },
            {
              name: "phrase",
              icon: "fas fa-quote-left",
              title: "Phrase",
              show: true,
              shortcut: (e) => e.code === "KeyP" && e.metaKey && e.shiftKey,
            },
            {
              name: "phrasebooks",
              icon: "fa fa-book-open",
              title: "Phrasebooks",
              show: false,
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
              icon: "fa fa-chalkboard",
              title: "Learn",
              show: this.hasFeature("learn"),
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
              title: "Study Sheet Creator",
              icon: "fas fa-print",
              show: true,
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
              show: this.hasFeature("grammar"),
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
              name: "resources",
              title: "Resources",
              icon: "fas fa-gem",
              show: true,
            },
            {
              name: "learning-path",
              title: "Learning Path",
              icon: "fas fa-road",
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
      ],
      history: []
    };
  },
  props: {
    l1: {
      type: Object,
    },
    l2: {
      type: Object,
    },
  },
  mounted() {
    this.enableTVShows();
    this.enablePhrasebooks();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.enableTVShows();
      }
    });
    this.bindKeys();
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
    async enablePhrasebooks() {
      let response = await axios.get(
        `${Config.wiki}items/phrasebook?filter[l2][eq]=${
          this.l2.id
        }&fields=id,title,l2&limit=500&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      if (response && response.data) {
        let phrasebooks = response.data.data;
        if (phrasebooks && phrasebooks.length> 0) {
          let d = this.menu.find((i) => i.title === "Dictionary");
          let p = d.children.find((i) => i.name === "phrasebooks");
          p.show = true;
        }
      }
    },
    enableTVShows() {
      if (
        this.$store.state.shows.tvShows &&
        this.$store.state.shows.tvShows[this.l2.code] &&
        this.$store.state.shows.tvShows[this.l2.code].length > 0
      ) {
        let av = this.menu.find((i) => i.title === "Audio-Visual");
        let tvShows = av.children.find((i) => i.title === "TV Shows");
        tvShows.show = true;
      }
      if (
        this.$store.state.shows.talks &&
        this.$store.state.shows.talks[this.l2.code] &&
        this.$store.state.shows.talks[this.l2.code].length > 0
      ) {
        let av = this.menu.find((i) => i.title === "Audio-Visual");
        let talks = av.children.find((i) => i.title === "Talks");
        talks.show = true;
      }
    },
    adminMode() {
      return this.$store.state.settings.adminMode;
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
          let children = item.children
          if (visibleOnly) children = children.filter(c => c.show)
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
.nav {
  margin-top: -40px;
  width: 100%;
}

.site-nav {
  margin: 0 auto;
  width: 100%;
  display: block;
  text-align: center;
}

.tabs {
  a svg,
  a i {
    margin-right: 0.5rem;
  }
}

.tabs {
  white-space: nowrap;
  overflow: scroll;
  overflow-y: hidden;
}

.tab {
  padding: 0.5rem 1rem;
  border-radius: 0.3rem 0.3rem 0 0;
  color: white;
  display: inline-block;
  margin-right: 0.2rem;
  border: none;
}

.tab.nuxt-link-active,
.tab:hover {
  color: #fd4f1c;
  background: white;
  text-decoration: none;
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

.secondary-menu {
  white-space: nowrap;
  overflow: scroll;
  overflow-y: hidden;
  padding-left: 1rem;
  padding-right: 1rem;
  width: 100vw;
  a svg,
  a i {
    margin-right: 0.5rem;
  }
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

.secondary-menu-item {
  padding: 0.5rem 1rem;
  margin: 0.2rem;
  border-radius: 0.3rem;
  color: #666;
  display: inline-block;
}

.secondary-menu-item:hover {
  text-decoration: none;
  color: inherit;
  background-color: #f7f7f7;
}

.secondary-menu-item.nuxt-link-active {
  background: #fd4f1c;
  color: white;
}
</style>
