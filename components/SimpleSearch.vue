<template>
  <b-input-group>
    <b-form-input
      v-model="text"
      @keyup.enter="action(text)"
      :placeholder="placeholder"
    />
    <b-input-group-append>
      <b-button variant="primary" @click="action(text)">{{$t(buttonText)}}</b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
export default {
  props: {
    placeholder: {
      default: ''
    },
    action: {
      type: Function
    },
    buttonText: {
      default: 'Go'
    }
  },
  data() {
    return {
      text: undefined
    }
  }
}
</script>

<style></style>
