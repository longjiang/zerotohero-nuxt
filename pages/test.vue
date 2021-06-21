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
              아버지는 자녀를 소중히 여기고 있다는 것을 어떻게 나타냅니까?
              아버지라면 분명히 적절한 의식주를 마련해 주려고 희생적으로 일할 뿐
              아니라 자녀를 위해 많은 일을 하고 있을 것입니다. 자녀를 소중하게
              여기지 않는다면 그렇게 하지 않을 것입니다. 하지만 자녀와 충분한
              시간을 함께 보내지 않을 경우, 자녀는 아버지가 직업, 친구, 취미와
              같은 다른 것을 더 좋아한다고 생각하게 될지 모릅니다.
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
    await (await dictionary).conjugate("하다");
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