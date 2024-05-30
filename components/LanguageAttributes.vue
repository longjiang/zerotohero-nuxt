<template>

  <div class="language-data">
    <div class="basic-data">
      <p v-if="$l2['iso639-1']">
        <b>{{ $t("ISO639-1:") }}</b>
        {{ $l2["iso639-1"] || $t("Not available") }}
      </p>
      <p>
        <b>{{ $t("ISO639-3:") }}</b>
        {{ $l2["iso639-3"] || $t("Not available") }}
      </p>
      <p v-if="$l2['glottologId']">
        <b>{{ $t("Glottolog ID:") }}</b>
        {{ $l2["glottologId"] }}
      </p>
      <p v-if="$l2['glottologFamilyId']?.length">
        <b>{{ $t("Glottolog Family ID:") }}</b>
        {{ $l2["glottologFamilyId"] }}
      </p>
      <p v-if="$l2['glottologParentId']?.length">
        <b>{{ $t("glottologParentId:") }}</b>
        {{ $l2["glottologParentId"] }}
      </p>
      <p>
        <b>{{ $t("Language Player Language ID:") }}</b>
        {{ $l2.id || $t("Not available") }}
      </p>
      <p v-if="$l2.lat && $l2.long">
        <b>{{ $t("Location (lat, long):") }}</b>
        <router-link :to="{
        name: 'ling-language-map',
        query: { c: `${$l2.lat},${$l2.long}`, z: 7 },
      }">
          {{ $l2.lat }}, {{ $l2.long }}
        </router-link>
      </p>
      <p v-if="$l2.scope">
        <b>{{ $t("Language Scope:") }}</b>
        {{ $t(scope[$l2.scope]) }}
      </p>
      <p v-if="$l2.scope">
        <b>{{ $t("Language Type:") }}</b>
        {{ $t(type[$l2.type]) }}
      </p>
      <p v-if="$l2.scripts && $l2.scripts.length > 0">
        <b>{{ $t("Orthography Code:") }}</b>
        {{
        $l2.scripts
          ? $l2.scripts.map((s) => s.script).join(", ")
          : $t("Not available")
      }}
      </p>
      <p v-if="$l2.otherNames?.length > 0">
        <b>{{ $t("Other names:") }}</b>
        {{ $l2.otherNames.join(",") }}
      </p>
      <p v-if="$l2.vernacularName">
        <b>{{ $t("Vernacular name:") }}</b>
        {{ $l2.vernacularName }}
      </p>
      <p v-if="$l2.speakers > 0">
        <b>{{ $t("Number of Speakers:") }}</b>
        {{
        $l2.speakers
          ? $l2.speakers.toLocaleString()
          : $t("Not available")
      }}
      </p>
    </div>
    <div class="native-to">

      <p>
        <b>{{ $t("Native to:") }}</b>
        <ul class="list-unstyled">
          <li v-for="c in $l2.country" :key="`lang-country-${c.alpha2Code}`" style="margin-right: 0.5rem">
            <img :src="`/vendor/flag-svgs/${c.alpha2Code}.svg`" class="flag-icon mr-1" />
            {{ $t(c.name) }}
            <span v-if="c.languages?.length > 0">
              ({{ $t("Also speaks:") }}
              <span v-for="(language, index) in c.languages" :key="`c-${c.name}-l-${language}`">
                <router-link :to="{ name: 'language-info', params: { l1: 'en', l2: language } }">
                  {{ $t(languageName(language)) }} </router-link><span v-if="index + 1 < c.languages.length">,</span>
              </span>
              )
            </span>
          </li>
        </ul>
      </p>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      scope: {
        I: "Individual Language",
        M: "Macrolanguage",
        S: "Special Scope",
      },
      type: {
        A: "Ancient Language",
        C: "Constructed Language",
        E: "Extinct Language",
        H: "Historica Languagel",
        L: "Living Language",
        S: "Special Language",
      },
    };
  },
  methods: {
    languageName(l2Code) {
      let language = this.$languages.getSmart(l2Code);
      if (language?.name) {
        let name = language.name.replace(/ \(.*\)/gi, "");
        return name;
      } else return l2Code;
    },
  },
};
</script>
<style lang="scss" scoped>
// Show .language-data as two columns on medium to large displays
@media (min-width: 640px) {
  .basic-data {
    column-count: 2;
  }
}
</style>
