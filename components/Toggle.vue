<template>
  <div class="toggle-wrapper">
    <label :for="toggleId" :class="{ 'toggle-icon': true, 'active-label': isActive }">
      <slot></slot>
    </label>
    <label :for="toggleId" :class="{ 'toggle-label': true, 'active-label': isActive }">
      {{ $tb(label) }}
    </label>
    <div class="switch">
      <input type="checkbox" :id="toggleId" v-model="isActive" @change="toggleSwitch" />
      <label :for="toggleId"></label>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isActive: this.value,
      toggleId: `toggle-switch-${this._uid}`,
    };
  },
  watch: {
    value(value) {
      this.isActive = value;
    },
  },
  methods: {
    toggleSwitch() {
      this.$emit("input", this.isActive);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.toggle-wrapper {
  display: flex;
  align-items: center;

  .toggle-icon {
    margin-right: 10px;
    width: 1.5rem;
    cursor: pointer;
    margin-bottom: 0;
    text-align: center;
  }

  .toggle-label {
    margin-right: 10px;
    color: $bg-color-dark-4;
    flex: 1;
    cursor: pointer;
    margin-bottom: 0;
  }

  .active-label {}

  .switch {
    $switch-height: 17px;
    position: relative;
    display: inline-block;
    width: $switch-height * 1.7647;
    height: $switch-height;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    label {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: $switch-height;
      margin-bottom: 0;

      &:before {
        position: absolute;
        content: '';
        height: $switch-height * 0.75;
        width: $switch-height * 0.75;
        left: $switch-height * 0.1176;
        bottom: $switch-height * 0.1176;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }
    }

    input:checked+label {
      background-color: $primary-color;
    }

    input:checked+label:before {
      transform: translateX($switch-height * 0.764);
    }
  }
}
</style>
