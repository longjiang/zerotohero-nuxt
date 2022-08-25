<template>
  <div class="pricing-cards">
    <div class="mb-3 bg-white pricing-card pricing-card-free">
      <h5 class="pb-3 pt-3">Free Account</h5>
      <hr />
      <ul class="list-unstyled">
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          Access 600,000+ videos across 207+ languages
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          See collocations, example sentences, verb inflections and Chinese
          character decomposition in the dictionary
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          Read books, web pages or your own text with a popup dictionary
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          Watch live TV in the target language
        </li>
        <li>
          <i class="fa-solid fa-lock text-warning mr-1"></i>
          See only first 10 lines of interactive transcripts with English
          translation
        </li>
        <li>
          <i class="fa-solid fa-lock text-warning mr-1"></i>
          See only 2 examples of words in videos
        </li>
      </ul>
    </div>
    <div class="mb-3 bg-white pricing-card pricing-card-pro">
      <div class="badge-money-back text-center">
        <span>
          <b style="font-size: 1.3em">14 day</b>
          <br />money-back guarantee
        </span>
      </div>
      <h4>Pro Account 🚀</h4>
      <div class="price">
        <span v-if="sale">
          <del style="opacity: 0.5">
            <span style="position: relative; bottom: 0.4rem">US$</span>
            <b style="font-size: 1.5rem">89</b>
          </del>
          <span class="text-primary ml-2">
            <span style="position: relative; bottom: 1.2rem">US$</span>
            <b style="font-size: 2.68rem">44</b>
            <b v-if="native" style="position: relative; bottom: 1.2rem">.99</b>
            <b v-else style="position: relative; bottom: 1.2rem">.50</b>
          </span>
        </span>
        <span v-else>
          <span style="position: relative; bottom: 1.2rem">US$</span>
          <b style="font-size: 2.68rem">89</b>
          <b v-if="native" style="position: relative; bottom: 1.2rem">.99</b>
        </span>
        <span
          style="
            display: inline-block;
            position: relative;
            bottom: 0.4rem;
            margin-left: 0.3rem;
          "
        >
          <span style="display: block; margin-bottom: 0; line-height: 0.2">/lifetime</span>
          <small class="text-success">never expires</small>
        </span>
      </div>
      <hr />
      <ul class="list-unstyled">
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          Access 600,000+ videos across 207+ languages
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          See collocations, example sentences, verb inflections and Chinese
          character decomposition in the dictionary
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          Read books, web pages or your own text with a popup dictionary
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          Watch live TV in the target language
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          See complete interactive transcripts with English translation
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          See hundreds of examples of words in videos, or in particular TV
          shows.
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";
export default {
  props: {
    sale: {
      default: false
    }
  },
  computed: {
    native() {
      return Capacitor.isNativePlatform();
    },
  }
};
</script>

<style lang="scss" scoped>
.pricing-card {
  text-shadow: none;
  padding: 2rem 2rem 1rem 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 0 40px #00000078;
  li {
    margin: 0.5rem 0;
    text-indent: -0.7rem;
    padding-left: 1.5rem;
  }
}

@media screen and (min-width: 720px) {
  .pricing-cards {
    position: relative;
    height: 40rem;
    margin: 0 auto;
    width: 46rem;
  }

  .pricing-card-free {
    width: 24rem;
    position: relative;
    padding-right: 4rem;
    top: 3rem;
  }
  .pricing-card-pro {
    width: 24rem;
    position: absolute;
    top: 0;
    left: 22rem;
    padding-bottom: 4rem;
    li {
      padding-right: 2rem;
    }
  }
  .badge-money-back {
    position: absolute;
    right: -3.625rem;
    top: -3.625rem;
  }
}

.badge-money-back {
  line-height: 1.1;
  background-color: #28a745;
  color: white;
  width: 7.25rem;
  height: 7.25rem;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
</style>