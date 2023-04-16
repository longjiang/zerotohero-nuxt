<template>
  <div
    class="identical-languages"
    v-if="$l2.identicalLangs && $l2.code !== 'zh'"
  >
    <client-only>
      <i18n path="For more content, also try: {0}.">
        <span>
          <span
            v-for="(identicalLangCode, index) of $l2.identicalLangs"
            :key="`identical-lang-${index}`"
            class="identical-language-item"
          >
            &nbsp;
            <router-link
              class="link-unstyled identical-language-item-name"
              :to="{
                name: routeName,
                params: { l1: $l1.code, l2: identicalLangCode },
              }"
            >
              <b style="text-decoration: underline">{{
                $t(langName(identicalLangCode))
              }}</b>
              ({{ identicalLangCode }})
            </router-link>
          </span>
        </span>
      </i18n>
    </client-only>
  </div>
</template>

<script>
export default {
  props: {
    routeName: {
      type: String,
    },
  },
  methods: {
    langName(code) {
      let language = this.$languages.getSmart(code);
      return language?.name;
    },
  },
};
</script>

<style lang="scss" scoped>
.zerotohero-light {
  .identical-languages {
    color: rgba(255, 255, 255, 1);
  }
}
.identical-languages {
  text-align: center;
  padding: 2rem;
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
