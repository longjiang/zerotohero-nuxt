<template>
  <div class="pricing-cards">
    <div class="mb-3 bg-white pricing-card pricing-card-free">
      <h5 class="">{{ $tb("Free Account") }}</h5>
      <hr />
      <ul class="list-unstyled">
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          {{ $tb("Access 600,000+ videos across 207+ languages") }}
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          {{
            $tb(
              "See collocations, example sentences, verb inflections and Chinese character decomposition in the dictionary"
            )
          }}
        </li>
        <li>
          <i class="fa-solid fa-lock text-warning mr-1"></i>
          {{
            $tb(
              "See only first 10 lines of interactive transcripts with English translation"
            )
          }}
        </li>
        <li>
          <i class="fa-solid fa-lock text-warning mr-1"></i>
          {{ $tb("See only 2 examples of words in videos") }}
        </li>
      </ul>
    </div>
    <div class="mb-3 bg-white pricing-card pricing-card-pro">
      <div class="badge-money-back text-center" v-if="!native">
        <span>
          <b style="font-size: 1.3em">{{ $tb('14 day') }}</b>
          <br />
          {{ $tb('money-back guarantee') }}
        </span>
      </div>
      <h4 class="mt-5">{{ $tb("Pro Account") }} 🚀</h4>
      <hr class="" />
      <ul class="list-unstyled">
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          {{ $tb("Access 600,000+ videos across 207+ languages") }}
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          {{
            $tb(
              "See collocations, example sentences, verb inflections and Chinese character decomposition in the dictionary"
            )
          }}
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          {{
            $tb(
              "See complete interactive transcripts with English translation"
            )
          }}
        </li>
        <li>
          <i class="fa-solid fa-circle-check text-success mr-1"></i>
          {{
            $tb(
              "See hundreds of examples of words in videos, or in particular TV shows"
            )
          }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";

export default {
  computed: {
    native() {
      return Capacitor.isNativePlatform();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";
.pricing-card {
  text-shadow: none;
  padding: 2rem 2rem 1rem 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 0 40px #00000078;
  color: #555;
  li {
    margin: 0.5rem 0;
    text-indent: -0.7rem;
    padding-left: 1.5rem;
  }
}

@media screen and (min-width: 720px) {
  .pricing-cards {
    position: relative;
    margin: 0 auto;
    width: 46rem;
    margin-bottom: 10rem;
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
    padding-bottom: 2rem;
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
  background-color: $primary-color;
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