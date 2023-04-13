<template>
  <div class="identical-languages" v-if="$l2.identicalLangs && $l2.code !== 'zh'">
    For more content, also try:
    <client-only>
      <span v-if="$l2.identicalLangs">
        <span
          v-for="(lang, index) of $l2.identicalLangs"
          :key="`identical-lang-${index}`"
          class="identical-language-item"
        >
          &nbsp;
          <router-link
            class="link-unstyled identical-language-item-name"
            :to="{ name: routeName, params: { l1: $l1.code, l2: lang.code } }"
          >
            <b style="text-decoration: underline">{{ lang.name }}</b>
            ({{ lang.code }})
          </router-link>
        </span>
      </span>
    </client-only>
    .
  </div>
</template>

<script>
export default {
  props: {
    routeName: {
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>
.identical-languages {
  color: rgba(255, 255, 255, 1);
}
.identical-languages {
  text-align: center;
  padding: 2rem;
  font-size: 1.3em;
  border-radius: 0.5rem;
  background: rgba(37, 36, 44, 0.651);
  .identical-language-item-name {
    white-space: nowrap;
    b {
      color: white;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .identical-language-item:not(:last-child) {
    &::after {
      content: ",";
    }
  }
}
</style>