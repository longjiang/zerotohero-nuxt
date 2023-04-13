<router>
  {
    path: '/:l1/:l2/meeting/:week?',
    props: true
  }
</router>
<template>
  <div class="main container mx-auto mt-10">
    <JWArticle
      :url="`https://wol.jw.org/${$l2.wol.locale}/wol/meetings/${$l2.wol.libs[0].researchConfigurationID}/${$l2.wol.libs[0].symbol}/2021/${week}`"
    />
  </div>
</template>

<script>
export default {
  props: ["week"],
  computed: {
  },
  mounted() {
    if (!this.week) {
      let now = new Date();
      let onejan = new Date(now.getFullYear(), 0, 1);
      let week = Math.floor(
        ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) /
          7
      );

      this.$router.push({ name: "jw-meeting", params: { week } });
    }
  },
  methods: {
    show_this_weeks_meetings() {},
  },
};
</script>

<style>
</style>