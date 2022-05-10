<template>
  <router-link
    :to="`/${l1.code}/${l2.code}/`"
    class="link-unstyled d-inline-block"
  >
    <template
      v-if="
        branded &&
        ((l1.code === 'zh' && l2.code === 'en') ||
          (l1.code === 'en' && l2.code === 'zh'))
      "
    >
      <template v-if="!icon">
        <img
          src="/img/czh-logo-light.png"
          alt="Chinese Zero to Hero"
          class="logo"
        
          v-if="l1.code === 'en' && l2.code === 'zh'"
        />
        <img
          src="/img/ezh-logo-light.png"
          alt="Chinese Zero to Hero"
          class="logo"
        
          v-else-if="l1.code === 'zh' && l2.code === 'en'"
        />
      </template>
      <template v-else>
        <img
          src="/img/czh-icon.png"
          alt="Chinese Zero to Hero"
          class="logo-image"
        
          v-if="l1.code === 'en' && l2.code === 'zh'"
        />
        <img
          src="/img/ezh-icon.png"
          alt="Chinese Zero to Hero"
          class="logo-image"
        
          v-else-if="l1.code === 'zh' && l2.code === 'en'"
        />
      </template>
    </template>
    <div v-else class="logo-constructed">
      <div class="logo-circle-wrapper">
        <div
          :class="`logo-circle
        bg-gradient-${(l2.name || '').length.toString().split('').pop()}`"
        >
          <span class="logo-circle-initial">{{ l2Name.charAt(0) }}</span>
          <img
            v-if="l2.logo"
            :src="`/img/logo-square/${l2.code}.jpeg`"
            :alt="logoDescription"
            :title="logoDescription"
          />
        </div>
        <div
          class="logo-speech-bubble shadowed"
          :style="`background-image: url(/img/speech-light.png)`"
        >
          <b>{{ l2.code }}</b>
        </div>
      </div>
      <div class="logo-text text-white" v-if="!icon">
        <template>
          <div class="logo-text-language">
            {{ l2Name }}
            <div class="language-id" v-if="$adminMode">#{{ l2.id }}</div>
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
  props: {
    l1: {
      type: Object,
    },
    l2: {
      type: Object,
    },
    compact: {
      default: false,
    },
    branded: {
      default: false,
    },
    icon: {
      default: false,
    },
  },
  data() {
    return {
      Config,
    };
  },
  computed: {
    l2Name() {
      let l2Name = this.l2.name.replace(/ \(.*\)/gi, "");
      l2Name =
        this.l1.translations && this.l1.translations[l2Name]
          ? this.l1.translations[l2Name]
          : l2Name;
      return l2Name;
    },
    logoDescription() {
      return this.l2.logoDesc
        ? `${this.l2.logoDesc}, a user of ${this.l2.name}.`
        : this.l2.name;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.logo {
  max-width: 11rem;
}
.logo-image {
  height: 2.9rem;
}
.logo-constructed {
  display: flex;
  align-items: flex-end;
  padding-top: 0.8rem;
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
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
    text-align: center;
    line-height: 2.75rem;
    .logo-circle-initial {
      color: white;
      font-size: 1.5rem;
      opacity: 0.7;
    }
    img {
      height: 100%;
      width: 100%;
      object-fit: cover;
      object-position: center;
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  .logo-text * {
    font-family: "Helvetica Neue", Helvetica, sans-serif !important;
    text-align: left;
    margin-bottom: -0.4rem;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
    text-align: left;
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
    font-weight: 200;
    letter-spacing: 0.1em;
    margin-bottom: -0.2em;
    text-transform: uppercase;
    line-height: 1.15;
  }
  .logo-text-zth {
    font-weight: bold;
    text-transform: uppercase;
  }
  .language-id {
    font-size: 0.7em;
    background: #000000b5;
    color: #f4f1f195;
    letter-spacing: 0;
    font-weight: normal;
    border: 1px solid rgba(186, 181, 181, 0.407);
    display: inline-block;
    text-align: center !important;
    padding: 0.05rem 0.3rem;
    border-radius: 0.2rem;
    bottom: 0.15rem !important;
    margin-left: -0.1rem;
    position: relative;
    left: 0;
    text-shadow: none;
  }
}
</style>