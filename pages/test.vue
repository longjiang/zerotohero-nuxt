<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div>
    <div class="main container mt-5 mb-5">
      <div class="row">
        <Annotate>
          <div>
            Le français est une langue indo-européenne de la famille des langues
            romanes dont les locuteurs sont appelés francophones. Le français
            est parlé, en 2018, sur tous les continents par environ 300 millions
            de personnes5,2 : 235 millions l'emploient quotidiennement, et 90
            millions3 en sont des locuteurs natifs. En 2018, 80 millions
            d'élèves et étudiants s'instruisent en français dans le monde6.
            Selon l'Organisation internationale de la francophonie, il pourrait
            y avoir 700 millions de francophones sur Terre en 20507. Dans le
            monde, 29 États ont le français comme langue officielle.
          </div>
        </Annotate>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // layout: "test-layout",
  computed: {
    l1() {
      return this.$store.state.settings.l1;
    },
    l2() {
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
    this.testFrenchTokenization();
  },
  methods: {
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