<router>
  {
    path: '/:l1/:l2/daytext/:y?/:m?/:d?',
    props: true
  }
</router>

<template>
  <div class="main container mx-auto mt-10 mb-10">
    <div class="day-text">
      <JWArticle
        v-if="$l2.wol"
        :url="`https://wol.jw.org/${$l2.code}/wol/h/${$l2.wol.libs[0].researchConfigurationID}/${$l2.wol.libs[0].symbol}/${y}/${m}/${d}`"  
        selector=".tabContent:nth-child(2)"
        :snippet="false"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: ["y", "m", "d"],
  data() {
    return {};
  },
  mounted() {
    if (!(this.y && this.m && this.d)) {
      const today = new Date();
      let params = {
        d: today.getDate(),
        m: today.getMonth() + 1,
        y: today.getFullYear(),
      };
      this.$router.push({ name: "jw-daytext", params });
    }
  },
  methods: {

  }
};
</script>

<style>
.day-text h1 + h3 {
  padding-top: 0;
}

.day-text figure > div {
  background: #f6f6f6;
  padding: 1rem;
  margin-top: -0.5rem;
  margin-bottom: 0;
}

.day-text figure > div + div {
  padding-top: 0;
  padding-bottom: 1px;
}
</style>