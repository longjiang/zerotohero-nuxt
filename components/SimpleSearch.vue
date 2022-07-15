<template>
  <b-input-group :class="{ 'input-group-ghost-dark': skin === 'dark' }">
    <b-form-input
      v-model="text"
      @compositionend.prevent.stop="() => false"
      @keyup.enter="action(text.trim())"
      :placeholder="placeholder"
      :class="{ 'input-ghost-dark': skin === 'dark' }"
    />
    <router-link
      v-if="random"
      :class="{
        'btn  btn-random mr-1': true,
        'btn-secondary bg-secondary': skin === 'light',
        'btn-ghost-dark': skin === 'dark',
      }"
      :to="random"
    >
      <i class="fas fa-random mr-1"></i>
      <span>Random</span>
    </router-link>
    <b-input-group-append v-if="button">
      <b-button
        
        :variant="skin === 'dark' ? 'ghost-dark' : 'primary'"
        @click="action(text.trim())"
      >
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
      default: "",
    },
    button: {
      default: true,
    },
    skin: {
      default: "light",
    },
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
