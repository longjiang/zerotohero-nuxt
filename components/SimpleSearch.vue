<template>
  <b-input-group>
    <b-form-input
      v-model="text"
      @keyup.enter="action(text)"
      :placeholder="placeholder"
    />
    <router-link
      v-if="random"
      class="btn btn-secondary btn-random mr-1 bg-secondary"
      :to="random"
    >
      <i class="fas fa-random mr-1"></i>
      <span>Random</span>
    </router-link>
    <b-input-group-append>
      <b-button variant="primary" @click="action(text)">
        <span v-if="buttonText">{{ $t(buttonText) }}</span>
        <span v-else><i class="fas fa-search"></i></span>
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
      type: String,
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

<style>
.btn-random {
  position: absolute;
  right: 3rem;
  font-size: 0.8rem;
  line-height: 0.8rem;
  height: 1.7rem !important;
  top: 0.3rem;
  border: none;
}


@media (max-width: 768px) {
  .btn-random span {
    display: none;
  }
}

</style>
