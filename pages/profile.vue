<router>
  {
    path: '/:l1/:l2/profile/',
    props: true
  }
</router>
<template>
  <div class="main pt-3">
    <div class="container" v-if="$auth.user">
      <div class="row">
        <div class="col-sm-12 text-center">
          <h3>{{ $auth.user.first_name }} {{ $auth.user.last_name }}</h3>
          <p>{{ $auth.user.email }}</p>
          <p>{{ $auth.user.avatar }}</p>
        </div>
      </div>
      <template v-if="level">
        <div class="row">
          <div class="col-sm-12 text-center">
            <LanguageFlag
              :language="$l2"
              :autocycle="true"
              style="
                transform: scale(1.5);
                margin-top: 1rem;
                margin-bottom: 2rem;
              "
            />
            <h5 class="mb-2">{{ $auth.user.first_name }}’s {{ $l2.name }}-Learning Progress</h5>
            <router-link
              to="/"
              class="text-success"
              style="
                font-size: 0.8em;
                font-weight: bold;
                margin-bottom: 2rem;
                display: block;
              "
            >
              <i class="fas fa-chevron-left"></i>
              All languages
            </router-link>
          </div>
        </div>
        <LanguageGoal :$l1="$l1" :$l2="$l2" />
        <div class="row mt-3">
          <div class="col-sm-12">
            <LanguageProgress
              class="mt-3"
              :$l1="$l1"
              :$l2="$l2"
              :description="true"
              :dot="true"
              :edit="true"
              :animated="true"
              progressBarHeight="1.5rem"
              :progressBarShowValue="false"
            />
            <router-link
              :to="{ name: 'all-media' }"
              class="text-success mt-5 d-block"
              style="font-size: 1.2rem; font-weight: bold"
            >
              Continue Learning
              <i class="fas fa-chevron-right ml-1"></i>
            </router-link>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
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
    time() {
      return this.$store.state.progress.progressLoaded
        ? this.$store.getters["progress/time"](this.$l2)
        : 0;
    },
    targetHours() {
      if (this.level)
        return Helper.levels[this.level].hoursMultiplier * this.$l2.hours;
    },
    level() {
      return this.$store.state.progress.progressLoaded
        ? Number(this.$store.getters["progress/level"](this.$l2))
        : 0;
    },
    levels() {
      let levels = Helper.languageLevels(this.$l2);
      return Object.keys(levels).map((key) => {
        return {
          value: Number(key),
          text: levels[key].exam.name + " " + levels[key].level,
        };
      });
    },
    hours() {
      return Math.round((this.time / 1000 / 60 / 60) * 100) / 100;
    },
    hoursNeeded() {
      return Math.ceil(this.targetHours / 10) * 10;
    },
  },
  data() {
    return {
      showManuallySetHours: false,
      mannuallySetLevel: this.level,
      mannuallySetHours: undefined,
    };
  },
  beforeDestroy() {
    this.unsubscribe();
  },
  mounted() {
    if (this.$store.state.progress.progressLoaded)
      this.mannuallySetLevel = Number(
        this.$store.getters["progress/level"](this.$l2)
      );
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "progress/LOAD") {
        this.mannuallySetLevel = Number(
          this.$store.getters["progress/level"](this.$l2)
        );
      }
    });
  },
  methods: {
    levelObj(level) {
      return Helper.languageLevels(this.$l2)[level];
    },
  },
  watch: {
    mannuallySetLevel() {
      this.$store.dispatch("progress/setLevel", {
        l2: this.$l2,
        level: this.mannuallySetLevel,
      });
    },
    mannuallySetHours() {
      this.$store.dispatch("progress/setTime", {
        l2: this.$l2,
        time: this.mannuallySetHours * 60 * 60 * 1000,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.goal {
  display: inline-block;
  width: 100%;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0.75rem 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  vertical-align: middle;
  border: 1px solid rgb(254, 218, 108);
  border-radius: 0.25rem;
  position: relative;
  img {
    height: 1.3rem;
    position: absolute;
    left: 0.5rem;
    z-index: 9;
  }
}

/* https://codepen.io/availchet/pen/rNMRvZB */
.dot {
  /* Vector */
  display: inline-block;
  position: relative;
  bottom: 0.1rem;
  margin-left: 0.2rem;
  margin-right: 0.5rem;
  height: 0.66rem;
  width: 0.66rem;
  border-radius: 50%;
  background: #28a745;
  opacity: 1;
}

.dot:after {
  content: "";
  position: absolute;
  height: 0.66rem;
  width: 0.66rem;
  border-radius: 50%;
  background: #28a745;
  display: block;
  animation: pulse 2s ease 0s infinite;
}

.dot:before {
  content: "";
  position: absolute;
  height: 0.66rem;
  width: 0.66rem;
  border-radius: 50%;
  background: #28a745;
  display: block;
  animation: pulse2 2s ease 0s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  80% {
    opacity: 0;
    transform: scale(2.5);
  }
  100% {
    opacity: 0;
    transform: scale(3);
  }
}

@keyframes pulse2 {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2.5);
  }
}
</style>