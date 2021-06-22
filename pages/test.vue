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
          <Annotate>
            <span>
              Lorem superposés valise pourparlers rêver chiots rendez-vous
              naissance Eiffel myrtille. Grèves Arc de Triomphe encore pourquoi
              sentiments baguette pédiluve une projet sentiments saperlipopette
              vachement le. Brume éphémère baguette Bordeaux en fait sommet
              avoir minitel. Nous avoir parole la nous moussant. Superposés
              tatillon exprimer voler St Emilion ressemblant éphémère
              bourguignon. Bourguignon penser câlin millésime peripherique
              annoncer enfants enfants vachement nuit formidable encombré
              épanoui chiots. Arc truc cacatoès lorem flâner.
            </span>
          </Annotate>
        </div>
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
    };
  },
  async mounted() {
    let dictionary = await this.$getDictionary();
    let word = await (await dictionary).lookup("suivre");
    console.log(await (await dictionary).wordForms(word));
  },
  methods: {
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