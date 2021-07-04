<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div>
    <div class="main container mt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <Annotate><span>Dafür müssen Sie eine Sprachprüfung machen.</span></Annotate>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // layout: "test-layout",
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
  },
  data() {
    return {
      showTestEntry: false,
      entry: undefined,
      href: undefined,
    };
  },
  async mounted() {
    this.dictionarySize()
  },
  methods: {
    async dictionarySize() {
      let dictionary = await this.$getDictionary();
      let size = await (await dictionary).getSize();
      console.log(`The dictionary has ${size} entries.`)
    },
    async testFrenchTokenization() {
      // let dictionary = await this.$getDictionary();
      // let word = await (await dictionary).lookup("suivre");
      // console.log(await (await dictionary).wordForms(word));
    },
    async testFrench() {
      let dictionary = await this.$getDictionary();
      let word = await (await dictionary).lookup("suivre");
      console.log(await (await dictionary).wordForms(word));
    },
    async testDictionary() {
      let dictionary = await this.$getDictionary();
      this.entry = await (await dictionary).lookup("你好");
    },
    async testRandom() {
      let dictionary = await this.$getDictionary();
      console.log(await (await dictionary).random(), "dictionary.random()");
    },
    async testRandom() {
      let dictionary = await this.$getDictionary();
      console.log(await (await dictionary).random(), "dictionary.random()");
    },
  },
};
</script>

<style>
</style>