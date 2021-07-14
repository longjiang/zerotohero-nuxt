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
          <!-- <Annotate><p>โอเคบ่เรารักภาษาถิ่น</p></Annotate> -->
          <!-- <Annotate><p>บักโพธิ์</p></Annotate>
          <Annotate><p>ཡང་དེའི་ནང་ང་རང་ཚོས་ལེ་ཚན་གསར་པ་ཞིག་བཟོ་རོགས་ཟེར་གི་འདུག་ག</p></Annotate>
          <Annotate><p> Ich wollte unbedingt Kühe. </p></Annotate>
          <Annotate><p>Còn ai đau ai đau xe sắp chạy rồi nha bà con..... nhanh</p></Annotate>
          <Annotate><p>Dengan bantal dan rambut palsu itu?</p></Annotate> -->
          <!-- <Annotate :buttons="true"><p>ميگى چيزى نمونده</p></Annotate> -->
          <Annotate :buttons="true"><p>75%</p></Annotate>
          <!-- ทริปวัดใจ -->
          <!-- <Annotate><p>Hometown's Embrace</p></Annotate> -->
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