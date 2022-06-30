<router>
  {
    path: '/:l1/:l2/profile/',
    props: true
  }
</router>
<template>
  <div class="main pt-3 pb-5">
    <client-only>
      <div v-if="!$auth.loggedIn" class="container">
        <div class="row">
          <div class="col-sm-12">
            <div class="text-center alert-success p-3 pb-4 rounded mt-4">
              <p>To track your learning progress, please login.</p>
              <router-link :to="{ name: 'login' }" class="btn btn-success">
                Login
                <i class="fas fa-chevron-right"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="container" v-else>
        <!-- <div class="row">
          <div class="col-sm-12 text-center">
            <h3>{{ $auth.user.first_name }} {{ $auth.user.last_name }}</h3>
            <p>{{ $auth.user.email }}</p>
            <p>{{ $auth.user.avatar }}</p>
          </div>
        </div> -->
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
              <h5 class="mb-2">
                {{ $auth.user.first_name }}’s {{ $l2.name }}-Learning Progress
              </h5>
              <router-link
                to="/dashboard"
                class="text-success"
                style="
                  font-size: 0.8em;
                  font-weight: bold;
                  margin-bottom: 2rem;
                  display: block;
                "
              >
                <i class="fas fa-tachometer-alt mr-1"></i>
                Dashboard
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
              <div v-if="wordIds">
                <h5 class="mt-5 mb-3">
                  Your {{ $l2.name }} Words
                  <router-link
                    class="text-success ml-2"
                    style="font-size: 1rem; font-weight: bold"
                    :to="{ name: 'saved-words' }"
                  >
                    See All {{ wordIds.length }}
                    <i class="fas fa-angle-right ml-1"></i>
                  </router-link>
                </h5>
                <WordList
                  :ids="wordIds.slice(0, 7)"
                  skin="light"
                  class="mt-3"
                ></WordList>
              </div>
              <div>
                <h5 class="mt-5 mb-4">
                  {{ $l2.name }} Videos You Watched
                  <router-link
                    class="text-success ml-2"
                    style="font-size: 1rem; font-weight: bold"
                    :to="{ name: 'saved-words' }"
                  >
                    See Entire History
                    <i class="fas fa-angle-right ml-1"></i>
                  </router-link>
                </h5>
                <WatchHistoryComp
                  :limit="12"
                  :l2="$l2"
                  :showClear="false"
                  :showDate="false"
                  class="row"
                />
              </div>
              <div class="mt-4 pb-5">
                <h5 class="mb-4">Danger Zone</h5>
                <div class="row">
                  <div class="col-sm-12 col-md-6 mb-2">
                    <div class="text-center alert-danger rounded p-4">
                      <b-button variant="danger" @click="removeProgress">
                        <i class="fas fa-trash mr-2"></i>
                        Remove {{ $l2.name }}
                      </b-button>
                      <p class="mt-3 mb-0">
                        This will remove your logged time for {{ $l2.name }},
                        and remove {{ $l2.name }} from your home screen
                        Dashboard.
                      </p>
                    </div>
                  </div>
                  <div class="col-sm-12 col-md-6 mb-2">
                    <div class="text-center alert-danger rounded p-4" style="height: 100%">
                      <b-button variant="danger" @click="deleteAccount">
                        <i class="fas fa-times-circle mr-2"></i>
                        Delete my account
                      </b-button>
                      <p class="mt-3 mb-0">
                        This will permanently remove your account. There is no
                        undo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <FeedbackPrompt
                class="mt-5 mb-4"
                :skin="$route.meta ? $route.meta.skin : 'light'"
              />
            </div>
          </div>
        </template>
      </div>
    </client-only>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("savedWords", ["savedWords"]),
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
        return LEVELS[this.level].hoursMultiplier * this.$l2.hours;
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
    wordIds() {
      let savedWords = this.savedWords[this.$l2.code] || [];
      return savedWords.map((w) => w.id);
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
  methods: {
    levelObj(level) {
      return Helper.languageLevels(this.$l2)[level];
    },
    async removeProgress() {
      if (
        confirm(
          `Are you sure you want to remove your progress and saved items for ${this.$l2.name}?`
        )
      ) {
        // Save it!
        this.$store.dispatch("progress/removeL2Progress", { l2: this.$l2 });
        this.$toast.success(
          `${this.$l2.name} has been removed from your languages.`,
          { duration: 5000 }
        );
        this.$router.push("/");
        await Helper.timeout(3000);
        location.reload();
      } else {
        // Do nothing!
      }
    },
    async deleteAccount() {
      if (
        confirm(`Are you sure you want to permanently delete your account?`)
      ) {
        let res = await this.$directus.get(`users/me`);
        let user = res?.data?.data;
        if (user) {
          if (user.role !== 1) {
            let url = `users/${user.id}`;
            res = await this.$directus.patch(url, { status: "inactive" });
            this.$toast.success("Success: User account has been deleted.", {
              duration: 5000,
            });
            this.$router.push('/logout')
          } else {
            this.$toast.error("Error: Cannot delete admin users.", {
              duration: 5000,
            });
          }
        } else {
          this.$toast.error(
            "Error: Cannot delete user because user information canot be retrieved.",
            { duration: 5000 }
          );
        }
      } else {
      }
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