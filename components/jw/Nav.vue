<template>
  <nav class="bg-gray-800">
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button-->
          <button
            type="button"
            class="
              inline-flex
              items-center
              justify-center
              p-2
              rounded-md
              text-gray-400
              hover:text-white
              hover:bg-gray-700
              focus:outline-none
              focus:ring-2 focus:ring-inset focus:ring-white
            "
            aria-controls="mobile-menu"
            aria-expanded="false"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span class="sr-only">Open main menu</span>
            <!--
            Icon when menu is closed.

            Heroicon name: outline/menu

            Menu open: "hidden", Menu closed: "block"
          -->
            <svg
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <!--
            Icon when menu is open.

            Heroicon name: outline/x

            Menu open: "block", Menu closed: "hidden"
          -->
            <svg
              class="hidden h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div
          class="
            flex-1 flex
            items-center
            justify-center
            sm:items-stretch
            sm:justify-start
          "
        >
          <NuxtLink to="/" class="flex-shrink-0 flex items-center">
            <img class="block lg:hidden h-8 w-auto" src="/img/pencil.svg" />
            <img class="hidden lg:block h-8 w-auto" src="/img/pencil.svg" />
          </NuxtLink>
          <div class="hidden sm:block sm:ml-6">
            <div class="flex space-x-1">
              <div
                class="relative"
                v-for="(item, index) in menu.filter((item) => item.show)"
                :key="`nav-${index}`"
              >
                <button
                  @click="toggle(item)"
                  v-if="
                    item.children &&
                    item.children.filter((c) => c.show).length > 0
                  "
                  class="
                    bg-gray-900
                    text-gray-300
                    px-3
                    py-2
                    rounded-md
                    text-sm
                    font-medium
                  "
                >
                  <i :class="`${item.icon} mr-2`"></i>
                  {{ item.title }}
                </button>
                <NuxtLink
                  v-else
                  :to="{ name: item.name }"
                  class="
                    bg-gray-900
                    text-gray-300
                    px-3
                    py-2
                    rounded-md
                    text-sm
                    font-medium
                    inline-block
                  "
                >
                  <i :class="`${item.icon} mr-2`"></i>
                  {{ item.title }}
                </NuxtLink>
                <div
                  v-if="item.children && item.open"
                  :class="[
                    'origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none',
                    {
                      hidden: !item.open,
                    },
                  ]"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabindex="-1"
                >
                  <NuxtLink
                    v-for="(child, childIndex) in item.children"
                    :to="last(child) || { name: nameOfSelfOrFirstChild(child) }"
                    :key="`sub-nav-${childIndex}`"
                    class="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabindex="-1"
                  >
                    <i :class="`${child.icon} mr-2`"></i>
                    {{ child.title }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div :class="['sm:hidden', { hidden: !mobileMenuOpen }]" id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <div
          v-for="(item, index) in menu.filter((item) => item.show)"
          :key="`mobile-nav-${index}`"
        >
          <button
            @click="toggle(item)"
            v-if="
              item.children && item.children.filter((c) => c.show).length > 0
            "
            class="
              text-gray-300
              block
              px-3
              py-2
              rounded-md
              text-base
              font-medium
              text-left
              w-full
            "
          >
            <i :class="`${item.icon} mr-2`"></i>
            {{ item.title }}
          </button>
          <NuxtLink
            v-else
            :to="{ name: item.name }"
            class="
              text-gray-300
              block
              px-3
              py-2
              rounded-md
              text-base
              font-medium
              text-left
              w-full
            "
          >
            <i :class="`${item.icon} mr-2`"></i>
            {{ item.title }}
          </NuxtLink>
          <div
            v-if="item.children && item.open"
            :class="{
              hidden: !item.open,
            }"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabindex="-1"
          >
            <NuxtLink
              v-for="(child, childIndex) in item.children"
              :to="last(child) || { name: nameOfSelfOrFirstChild(child) }"
              :key="`sub-nav-${childIndex}`"
              class="
                text-gray-900
                bg-gray-200
                block
                px-3
                py-2
                text-base
                font-medium
              "
            >
              <i :class="`${child.icon} mr-2`"></i>
              {{ child.title }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import Vue from "vue";

export default {
  data() {
    return {
      history: [],
      mobileMenuOpen: false,
      menu: [
        {
          icon: "fas fa-book",
          title: "Bible",
          name: "bible",
          show: true,
          children: [
            {
              icon: "fas fa-book",
              title: "Bible",
              name: "bible",
              show: true,
            },

            {
              icon: "fas fa-random",
              title: "Random Chapter",
              name: "bible-random",
              show: true,
            },
          ],
        },
        {
          icon: "fas fa-calendar",
          title: "Day Text",
          name: "daytext",
          show: true,
        },
        {
          icon: "fas fa-handshake",
          name: "meeting",
          title: "Meeting",
          show: true,
        },
        {
          icon: "fas fa-handshake",
          name: "publications",
          title: "Publications",
          show: true,
          children: [
            {
              icon: "fas fa-file-alt",
              title: "Articles",
              name: "article-view",
              show: false,
            },
          ],
        },
        {
          icon: "fas fa-binoculars",
          title: "Explore",
          name: "explore",
          show: true,
          children: [
            {
              icon: "fas fa-binoculars",
              name: "explore",
              title: "Explore",
              show: true,
            },
            {
              icon: "fas fa-clock",
              name: "history",
              title: "History",
              show: true,
            },
            {
              icon: "fas fa-male",
              name: "jesus",
              title: "Jesus’ Life",
              show: true,
            },
            {
              icon: "fas fa-map-marked",
              name: "maps",
              title: "Bible Maps",
              show: true,
            },
            {
              icon: "fas fa-adjust",
              name: "diff-view",
              title: "Compare Bibles",
              show: true,
            },
            {
              icon: "fas fa-question-circle",
              name: "questions",
              title: "Quizzes",
              show: true,
            },
            {
              icon: "fas fa-stream",
              name: "timeline-view",
              title: "Timeline",
              show: true,
            },
          ],
        },
        {
          icon: "fas fa-video",
          title: "Videos",
          name: "video",
          show: true,
        },
        {
          icon: "fas fa-search",
          title: "Search",
          name: "search",
          show: true,
        },
      ],
    };
  },
  watch: {
    $route() {
      this.history.push(this.$route.path);
      this.mobileMenuOpen = false
      this.closeAll(this.menu)
    },
  },
  methods: {
    toggle(item) {
      if (item.open) {
        Vue.set(item, "open", false);
      } else {
        Vue.set(item, "open", true);
      }
    },
    closeAll(menu) {
      for (let item of menu) {
        Vue.set(item, "open", false)
        if (item.children && item.children.length > 0) {
          this.closeAll(item.children)
        }
      }
    },
    nameOfSelfOrFirstChild(item) {
      if (item) {
        let result =
          item.name ||
          (item.children && item.children.length > 0
            ? item.children[0].name
            : "");
        return result;
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
  },
};
</script>

<style>
</style>