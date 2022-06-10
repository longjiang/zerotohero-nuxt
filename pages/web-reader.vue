<router>
  {
    path: '/:l1/:l2/web-reader/',
    props: true,
    meta: {
      title: 'Reader | Zero to Hero',
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
          <h4 class="mb-3">Read a web page</h4>
          <b-form @submit="onSubmit">
            <b-input-group>
              <b-form-input v-model="url" placeholder="https://"></b-form-input>
              <b-button type="submit" size="sm" text="Button" variant="success" class="ml-1">
                Read
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