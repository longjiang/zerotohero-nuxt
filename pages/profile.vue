<router>
  {
    path: '/:l1/:l2/profile/',
    props: true
  }
</router>
<template>
  <div class="main pt-3">
    <div class="container">
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
            <h5 class="mb-4">Your {{ $l2.name }} Learning Progress</h5>
          </div>
        </div>
        <div class="row">
          <div class="col-6 pr-1 text-center">
            Your current level
            <b-form-select
              v-model="mannuallySetLevel"
              :options="levels"
            ></b-form-select>
          </div>
          <div class="col-6 pl-1 text-center">
            Your next goal
            <br />
            <div class="goal">
              <template v-if="level < 7">
                {{ levelObj(level + 1).exam.name }}
                {{ levelObj(level + 1).level }}
              </template>
              <template v-if="level >= 7" class="goal">
                Mastery
              </template>
              <img src="/img/trophy.svg" />
            </div>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-sm-12">
            <b-progress
              class="mt-2"
              :max="hoursNeeded"
              show-value
              height="1.5rem"
            >
              <b-progress-bar
                :value="hours"
                :animated="true"
                variant="success"
              ></b-progress-bar>
            </b-progress>
            <div v-if="$store.state.progress.progressLoaded" class="mt-3">
              You've spent
              <b>{{ Math.floor(hours) }} hours</b>
              <b>{{ Math.ceil((hours % 1) * 60) }} min</b>
              on Zero to Hero learning {{ $l2.name }}.
              <u
                style="font-weight: bold; cursor: pointer"
                class="text-success"
                @click="showManuallySetHours = !showManuallySetHours"
              >
                Manually change hours
                <i class="fas fa-caret-down"></i>
              </u>
            </div>
            <div v-if="showManuallySetHours" class="mt-2">
              Mannually set your total time on {{ $l2.name }} to
              <b-form-input
                v-model="mannuallySetHours"
                type="number"
                :lazy="true"
                placeholder="hours"
              />
            </div>
            <div class="mt-3" v-if="hours < hoursNeeded">
              If you're typical L1 {{ $l1.name }} speaker at the
              {{ levelObj(level).exam.name }}
              {{ levelObj(level).level }} level, it is estimated that you need
              <b>{{ Math.round(hoursNeeded) }} hours</b>
              to get to
              <span v-if="level < 7">
                {{ levelObj(level + 1).exam.name }}
                {{ levelObj(level + 1).level }}
              </span>
              <span v-else>native-like mastery</span>
              . You're
              <b>{{ Math.round((hours / hoursNeeded) * 100) }}%</b>
              way there,
              <b>{{ Math.round(hoursNeeded - hours) }} more hours</b>
              to go!
            </div>
            <div class="mt-3" v-else>
              Typically, {{ $l1.name }} speakers need
              <b>{{ Math.round(hoursNeeded) }} hours</b>
              {{ levelObj(level).exam.name }}
              {{ levelObj(level).level }} from to
              {{ levelObj(level + 1).exam.name }}
              {{ levelObj(level + 1).level }}.
            </div>
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-sm-12 text-center mt-4">
            <router-link :to="{name: 'logout'}" class="btn btn-danger pl-4 pr-4"><i class="fas fa-sign-out-alt"></i> Logout</router-link>
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
</style>