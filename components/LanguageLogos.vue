<template>
  <div>
    <h5 class="mb-4 text-white">Learn varous languages through English:</h5>
    <div class="zerotohero">
      <LanguageLogo
        v-for="language in languages.filter(language => language.url && language.published === true).sort((a,b) => b.name > a.name ? -1 : 0)"
        :language="language"
      />
    </div>
    <hr class="border-light" style="opacity: 0.5" />
    <h5 class="mt-4 mb-4 text-white">Learn English through various languages:</h5>
    <div class="zerotohero">
      <EnglishLogo
        v-for="language in languages.filter(language => language.enURL && language.enPublished === true).sort((a,b) => b.name > a.name ? -1 : 0)"
        class="zerotohero-item"
        :language="language"
      />
    </div>
  </div>
</template>

<script>
import LanguageLogo from '@/components/LanguageLogo'
import EnglishLogo from '@/components/EnglishLogo'
import Config from '@/lib/config'

export default {
  components: {
    LanguageLogo,
    EnglishLogo
  },
  data() {
    return {
      languages: []
    }
  },
  async created() {
    this.languages = await $.getJSON(`${Config.server}data/languages.json`)
  }
}
</script>

<style>
.zerotohero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}
.zerotohero-item {
  width: 15rem;
}
</style>