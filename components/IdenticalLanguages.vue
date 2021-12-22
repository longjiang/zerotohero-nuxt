<template>
  <div class="identical-languages" v-if="$l2.identicalLangs">
    Additional content is available
    <client-only>
      <span v-if="$l2.identicalLangs">
        under:
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
            <b>
              {{ lang.name }}
            </b>
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
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
};
</script>

<style lang="scss" scoped>
.identical-languages {
  color: rgba(255, 255, 255, 0.8);
}
.identical-languages {
  text-align: center;
  padding: 2rem;
  font-size: 1.1em;
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