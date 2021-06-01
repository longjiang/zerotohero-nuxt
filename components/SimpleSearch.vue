<template>
  <b-input-group>
    <b-form-input
      v-model="text"
      @keyup.enter="action(text)"
      :placeholder="placeholder"
    />
    <router-link
      v-if="random"
      class="btn btn-secondary btn-random mr-1"
      :to="random"
    >
      <i class="fas fa-random mr-1"></i>
      <span>{{ $t("Random") }}</span>
    </router-link>
    <b-input-group-append>
      <b-button variant="primary" @click="action(text)">
        {{ $t(buttonText) }}
      </b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
export default {
  props: {
    placeholder: {
      default: "",
    },
    action: {
      type: Function,
    },
    buttonText: {
      default: "Go",
    },
    random: {
      default: ""
    }
  },
  data() {
    return {
      text: undefined,
    };
  },
};
</script>

<style></style>
