<template>
  <div class="language-progress">
    <div>
      <h5 class="hours-display">
        {{ Math.floor(hours) }} hours {{ Math.ceil((hours % 1) * 60) }} min
        <span v-if="dot" class="dot"></span>
        <span
          v-if="edit"
          @click="showManuallySetHours = !showManuallySetHours"
          class="btn-edit text-secondary ml-2"
        >
          <i class="fas fa-pencil-alt mr-1"></i>
          Edit hours
        </span>
      </h5>
    </div>
    <div v-if="showManuallySetHours" class="mt-2 mb-3">
      Mannually set your total time on {{ $l2.name }} to
      <b-form-input
        v-model="mannuallySetHours"
        type="number"
        :lazy="true"
        placeholder="hours"
        aria-autocomplete="both"
        aria-haspopup="false"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        autofocus=""
        role="combobox"
        spellcheck="false"
      />
    </div>
    <b-progress
      class="mt-2"
      :max="hoursNeeded"
      :show-value="progressBarShowValue"
      :height="progressBarHeight"
    >
      <b-progress-bar
        :value="hours"
        :animated="animated"
        variant="success"
      ></b-progress-bar>
    </b-progress>
    <div class="bottom-labels">
      <div class="bottom-label-left">
        <b class="text-success">
          {{ Math.round((hours / hoursNeeded) * 100) }}%
        </b>
        way to {{ goalText }}
      </div>
      <span class="bottom-label-right">
        remaining
        <b class="text-warning">{{ Math.round(hoursNeeded - hours) }} hours</b>
      </span>
    </div>
    <div v-if="description" class="description">
      <div v-if="$store.state.progress.progressLoaded">
        You've spent
        <b>
          {{ Math.floor(hours) }} hours {{ Math.ceil((hours % 1) * 60) }} min
        </b>
        on the
        <b>{{ $l2.name }}</b>
        section of Zero to Hero.
      </div>
      <div class="mt-3" v-if="hours < hoursNeeded">
        If you're typical L1 {{ $l1.name }} speaker at the
        {{ levelText }} level, it is estimated that you need
        <b>{{ Math.round(hoursNeeded) }} hours</b>
        to get to
        <span v-if="level < 7">
          {{ goalText }}
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
        {{ levelText }} from to
        {{ goalText }}.
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  props: {
    $l1: Object,
    $l2: Object,
    dot: {
      default: false,
    },
    description: {
      default: false,
    },
    edit: {
      default: false,
    },
    animated: {
      default: false,
    },
    progressBarHeight: {
      default: "0.75rem",
    },
    progressBarShowValue: {
      default: false
    }
  },
  computed: {
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
    levelText() {
      let goal = this.levelObj(this.level)
      return goal.exam.name + ' ' + goal.level
    },
    goalText() {
      let goal = this.levelObj(this.level + 1)
      return goal.exam.name + ' ' + goal.level
    }
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
.description {
  margin-top: 3rem;
  clear: both;
}

.bottom-labels {
  margin-top: 0.5rem;
  .bottom-label-left {
    float: left;
  }
  .bottom-label-right {
    float: right;
  }
}

.btn-edit {
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
  float: right;
  margin-top: 0.2rem;
}
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

.hours-display {
  color: #28a745;
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