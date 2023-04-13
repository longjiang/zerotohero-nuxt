<router>
  {
    path: '/:l1/:l2/web-reader/',
    props: true,
    meta: {
      title: 'Reader | Language Player',
      metaTags: [
        {
          name: 'description',
          content:
            'Read text with annotation and save new words for review.'
        }
      ]
    }
  }
</router>
<template>
  <div class="p-5">
    <div class="container bg-white rounded">
      <div class="row">
        <div class="col-sm-12 p-4">
          <h4 class="mb-3">{{ $t('Read a {l2} web page', {l2: $t($l2.name)}) }}</h4>
          <b-form @submit="onSubmit">
            <b-input-group>
              <b-form-input v-model="url" placeholder="https://"></b-form-input>
              <b-button type="submit" size="sm" text="Button" variant="success" class="ml-1">
                {{ $t('Read') }}
              </b-button>
            </b-input-group>
          </b-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: "",
    };
  },
  computed: {
  },
  methods: {
    onSubmit(event) {
      event.preventDefault()
      this.$router.push({name: 'reader', params: {method: 'html-url', arg: this.url}})
    }
  }
};
</script>

<style>
</style>