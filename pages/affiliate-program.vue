<router>
  {
    path: '/:l1/:l2/affiliate-program'
  }
</router>
<template>
  <div class="affiliate container pt-5 pb-5 main">
    <SocialHead
      :title="`Affiliate Program | ${$l2.name} Zero to Hero`"
      :description="`Affiliates are our partners and we want them to make money too! Do you
      have a social media following?`"
    />
    <h3 class="mb-2 text-center">Join Our Affiliate Program</h3>
    <p class="lead text-center mb-5">
      Let more people benefit from {{ $l2.name }} Zero to Hero.
    </p>
    <div class="bg-success p-4 rounded text-light text-center">
      <b>tl;dr</b> The commission rate is <b class="bigger">15-20%</b> with
      bonuses for strong performance.
    </div>
    <h3>About This Program</h3>
    <p>
      Affiliates are our partners and we want them to make money too! Do you
      have a social media following? Are you a teacher, school administrator or
      simply a person that&rsquo;s interested in partnering with us? We&rsquo;d
      love to discuss business with you! Our affiliate program is a way for you
      to receive payment for spreading the word about us. This program is
      completely free, and it takes no time to get set up and begin earning
      commission.&nbsp;
    </p>
    <div class="row mt-5">
      <div class="col-sm-4">
        <h5>High Commission</h5>
        <p>
          As an affiliate, you can earn high commission by promoting over 18
          {{ $l2.name }} Zero To Hero courses. The commission rate is 15-20%
          with bonuses for strong performance.
        </p>
      </div>
      <div class="col-sm-4">
        <h5>Easy Setup</h5>
        <p>
          After contacting us and getting approved, we&rsquo;ll get you all set
          up with a new Teachable affiliate account. We&rsquo;ll also provide
          you with the affiliate links, of course.
        </p>
      </div>
      <div class="col-sm-4">
        <h5>Graphics / Media</h5>
        <p>
          We provide clean, professionally-designed banners and text links to
          add to your site. You can also embed our promo and lecture
          <a href="https://www.youtube.com/chinesezerotohero" target="_blank"
            >YouTube videos</a
          >
          into your site.
        </p>
      </div>
    </div>
    <h3 class="mt-4">How Does It Work?</h3>
    <ul>
      <li>
        A &ldquo;cookie&rdquo; is created whenever a user clicks on your unique
        affiliate link, regardless of whether or not they purchase the course at
        that moment.
      </li>
      <li>
        If the visitor makes a purchase (the order doesn&rsquo;t need to be
        placed during the same browser session, this cookie is valid for the 3
        months, or until the user&rsquo;s browser cache is cleared), the order
        will be registered as a sale for you.
      </li>
      <li>
        Our system will show you your total earnings, and you&rsquo;ll receive a
        payment every month.
      </li>
    </ul>
    <h3>Join Our Affiliate Program</h3>
    <p>
      Tell us a bit about you or your company, and let&rsquo;s discuss our
      affiliate partnership.
    </p>
    <p>
      Got an idea for a custom affiliate program or specific program terms that
      you think would be profitable for both parties? Feel free to reach out to
      us.
    </p>
    <p>
      Email:&nbsp;
      <a href="mailto:ken@chinesezerotohero.com">ken@chinesezerotohero.com</a>
    </p>
  </div>
</template>

<script>
import Page from '@/components/Page'

export default {
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  components: {
    Page
  }
}
</script>

<style scoped>
.affiliate >>> h3 {
  margin-top: 3rem;
  margin-bottom: 1rem;
}
</style>
