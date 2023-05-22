<template>
  <div :class="`hide-defs-toggle skin-${$skin}`">
    <b-button
      variant="unstyled"
      size="sm"
      @click="hideWord = !hideWord"
      class="mr-2"
    >
      <i class="far fa-eye-slash" v-if="hideWord"></i>
      <i class="fas fa-eye" v-else></i>
      <span class="ml-1">{{ $t(!hideWord ? 'Show Word' : 'Hide Word') }}</span>
    </b-button>
    <b-button
      variant="unstyled"
      size="sm"
      @click="hidePhonetics = !hidePhonetics"
      class="mr-2"
    >
      <i class="far fa-eye-slash" v-if="hidePhonetics"></i>
      <i class="fas fa-eye" v-else></i>
      <span class="ml-1" v-if="$l2.code === 'ko'">{{ $t(!hidePhonetics ? 'Show Hanja' : 'Hide Hanja') }}</span>
      <span class="ml-1" v-else>{{ $t(!hidePhonetics ? 'Show Phonetics' : 'Hide Phonetics') }}</span>
    </b-button>
    <b-button
      variant="unstyled"
      size="sm"
      @click="hideDefinitions = !hideDefinitions"
    >
      <i class="far fa-eye-slash" v-if="hideDefinitions"></i>
      <i class="fas fa-eye" v-else></i>
      <span class="ml-1">{{ $t(!hideDefinitions ? 'Show Defs' : 'Hide Defs') }}</span>
    </b-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      hideDefinitions: false,
      hidePhonetics: false,
      hideWord: false,
    };
  },
  watch: {
    hideDefinitions() {
      this.$store.dispatch("settings/setGeneralSettings", { hideDefinitions: this.hideDefinitions });
      this.$emit("hideDefinitions", this.hideDefinitions);
    },
    hidePhonetics() {
      this.$store.dispatch("settings/setGeneralSettings", { hidePhonetics: this.hidePhonetics });
      this.$emit("hidePhonetics", this.hidePhonetics);
    },
    hideWord() {
      this.$store.dispatch("settings/setGeneralSettings", { hideWord: this.hideWord });
      this.$emit("hideWord", this.hideWord);
    },
  },
  mounted() {
    if (typeof this.$store.state.settings !== "undefined") {
      this.hideWord = this.$store.state.settings.hideWord;
      this.hideDefinitions = this.$store.state.settings.hideDefinitions;
      this.hidePhonetics = this.$store.state.settings.hidePhonetics;
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
        this.hideWord = this.$store.state.settings.hideWord;
        this.hideDefinitions = this.$store.state.settings.hideDefinitions;
        this.hidePhonetics = this.$store.state.settings.hidePhonetics;
      }
    });
  },
};
</script>

<style lang="scss" scoped>
.skin-light {
  .hide-defs-toggle {
    button {
      color: #666;
    }
  }
}
.skin-dark {
  .hide-defs-toggle {
    button {
      color: #ccc;
    }
  }
}
.hide-defs-toggle {
  button {
    font-size: 0.8em;
    padding: 0;
  }
}
</style>