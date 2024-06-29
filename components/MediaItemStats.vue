<template>
  <div class="statistics">
    <span class="statistics-item" v-if="item.avg_views || item.views">
      <i class="fa-solid fa-eye"></i>
      {{ formatK(item.avg_views || item.views) }}
    </span>
    <span v-if="item.avg_likes || item.likes">
      <i class="fa-solid fa-thumbs-up"></i>
      {{ formatK(item.avg_likes || item.likes) }}
    </span>
    <span v-if="item.avg_comments || item.comments">
      <i class="fa-solid fa-comment"></i>
      {{ formatK(item.avg_comments || item.comments) }}
    </span>
    <span
      v-if="showLevel && item.difficulty"
      :data-level="levelByDifficulty(item.difficulty, $l2.code)"
      class="text-bold"
    >
      {{ level(levelByDifficulty(item.difficulty, $l2.code), $l2).name }}
    </span>
    <Locale class="statistics-item" v-if="item.locale" :locale="item.locale" />
    <span>
      <router-link class="statistics-item" v-if="item.category && CATEGORIES[item.category]" :to="{ name: 'category', params: { slug: item.category } }" style="color: inherit">
        {{ $t(CATEGORIES[item.category]) }}
      </router-link>
    </span>
    <span
      class="statistics-item"
      v-if="
        (showDate || $adminMode) &&
        item.date &&
        !isNaN(Date.parse(item.date))
      "
    >
      {{ $d(new Date(item.date), "short", $l1.code) }}
    </span>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { formatK, level, levelByDifficulty } from "../lib/utils";
import { CATEGORIES, } from "../lib/youtube";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    showDate: {
      type: Boolean,
      default: false,
    },
    showLevel: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      language: undefined,
      CATEGORIES
    }
  },
  computed: {
    ...mapState("shows", ["categories"]),
  },
  methods: {
    level,
    levelByDifficulty,
    formatK,
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";

.statistics span+span::before {
  content: " · ";
  margin: 0 0.25rem;
}

</style>