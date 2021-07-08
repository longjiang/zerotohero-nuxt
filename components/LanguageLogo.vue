<template>
  <router-link
    :to="`/${l1.code}/${l2.code}/`"
    class="link-unstyled d-inline-block"
  >
    <div class="logo-constructed">
      <div class="logo-circle-wrapper">
        <div class="logo-circle">
          <img :src="`/img/logo-square/${l2.code}.jpeg`" alt />
        </div>
        <div
          class="logo-speech-bubble shadowed"
          :style="`background-image: url(/img/speech-light.png)`"
        >
          <b>{{ l2.code }}</b>
        </div>
      </div>
      <div class="logo-text text-white">
        <template>
          <div class="logo-text-language">
            {{ l1.translations && l1.translations[l2Name] ? l1.translations[l2Name] : l2Name}}
          </div>
          <div class="logo-text-zth">
            <span v-if="!compact">
              {{
                l1.translations && l1.translations["Zero to Hero"]
                  ? l1.translations["Zero to Hero"]
                  : "Zero to Hero"
              }}
            </span>
            <span v-else>&nbsp;</span>
          </div>
        </template>
      </div>
    </div>
  </router-link>
</template>

<script>
import Config from "@/lib/config";

export default {
  props: ["l1", "l2", "compact"],
  data() {
    return {
      Config,
    };
  },
  computed: {
    l2Name() {
      return this.l2.name
        .replace("Yue Chinese", "Cantonese")
        .replace("Modern Greek", "Greek")
        .replace(/ \(.*\)/gi, "");
    },
  },
  methods: {},
};
</script>

<style>
.logo-image {
  height: 4rem;
}
.logo-constructed {
  display: flex;
  align-items: flex-end;
  padding-top: 0.8rem;
}
.logo-circle-wrapper {
  position: relative;
  margin-right: 0.7rem;
}
.logo-circle {
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 100%;
  overflow: hidden;
  position: relative;
}
.logo-circle img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center;
}
.logo-text {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  text-align: left;
  margin-bottom: -0.4rem;
}
.logo-speech-bubble {
  height: 2rem;
  width: 2rem;
  background-size: cover;
  line-height: 2rem;
  text-align: center;
  font-size: 0.7rem;
  color: #555;
  position: absolute;
  top: -0.9rem;
  right: -0.4rem;
}
.logo-speech-bubble b {
  display: block;
  position: relative;
  bottom: 0.1em;
}
.logo-text-language {
  font-weight: 100;
  margin-bottom: -0.2em;
  text-transform: uppercase;
  line-height: 1.15;
}
.logo-text-zth {
  font-weight: bold;
  text-transform: uppercase;
}
</style>