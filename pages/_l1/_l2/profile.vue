<template>
  <div class="main pb-5">
    <client-only>
      <div v-if="!$auth.loggedIn" class="container">
        <div class="row">
          <div class="col-sm-12">
            <div class="text-center alert-success p-3 pb-4 rounded mt-4">
              <p>{{ $t("To track your learning progress, please login.") }}</p>
              <router-link :to="{ name: 'login' }" class="btn btn-success">
                {{ $t("Login") }}
                <i class="fas fa-chevron-right"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="container" v-else>
        <div class="row">
          <div class="col-sm-12 text-center">
            <LanguageFlag :language="$l2" :autocycle="true" class="my-3" />
            <h4>
              {{ formatName($auth.user.first_name, $auth.user.last_name) }}
            </h4>
            <div>{{ $auth.user.email }}</div>
            <Sale class="my-4" />
            <div class="p-4 rounded bg-accent" style="margin: 2rem 0" >
              <h6>🚀 {{ $t('Your Pro Subscription') }}</h6>
              <hr />
              <SubscriptionStatus />
            </div>
          </div>
        </div>
        <template v-if="level">
          <div class="row">
            <div class="col-sm-12">
              <div class="p-4 rounded bg-accent">
                <h6 class="text-center">{{
                  $t("Your {l2} Language Progress", {
                    name: formatName(
                      $auth.user.first_name,
                      $auth.user.last_name,
                      true
                    ),
                    l2: $t($l2.name),
                  })
                }}</h6>
                <hr />
                <LanguageGoal />
                <LanguageProgress
                  class="mt-3"
                  :l1="$l1"
                  :l2="$l2"
                  :description="true"
                  :dot="true"
                  :edit="true"
                  :animated="true"
                  progressBarHeight="1.5rem"
                  :progressBarShowValue="false"
                />
              </div>
              <div v-if="wordIds">
                <h5 class="mt-5 mb-3">
                  {{
                    $t("Your {l2} Words", {
                      name: $auth.user.first_name,
                      l2: $t($l2.name),
                    })
                  }}
                  <router-link
                    class="text-success ml-2"
                    style="font-size: 1rem; font-weight: bold"
                    :to="{ name: 'l1-l2-saved-words' }"
                  >
                    {{
                      $t("See All {wordCount}", {
                        wordCount: wordIds.length,
                      })
                    }}
                    <i class="fas fa-angle-right ml-1"></i>
                  </router-link>
                </h5>
                <WordList
                  :ids="wordIds"
                  :skin="$skin"
                  class="mt-3"
                  :collapse="7"
                ></WordList>
              </div>
              <div>
                <h5 class="mt-5 mb-4">
                  {{
                    $t("{l2} Videos You Watched", {
                      l2: $t($l2.name),
                    })
                  }}
                  <router-link
                    class="text-success ml-2"
                    style="font-size: 1rem; font-weight: bold"
                    :to="{ name: 'l1-l2-youtube-history' }"
                  >
                    {{ $t("See All") }}
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
                <div class="row">
                  <div class="col-sm-12 mb-2">
                    <div
                      class="bg-accent rounded p-3"
                      style="height: 100%; font-size: 0.9em; color: #6c757d;"
                    >
                    <h6>{{ $t("Delete My Account") }}</h6>
                      <p class="mt-2 mb-0">
                        {{
                          $t(
                            "This will permanently remove your Language Player account. There is no undo."
                          )
                        }}
                        <router-link :to="{ name: 'delete-account' }" class="text-secondary">
                          <u>{{ $t("Delete My Account") }}</u>
                        </router-link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </client-only>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { languageLevels, timeout, formatName } from "@/lib/utils";

export default {
  computed: {
    ...mapState("savedWords", ["savedWords"]),
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
      let levels = languageLevels(this.$l2);
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
  methods: {
    formatName,
    levelObj(level) {
      return languageLevels(this.$l2)[level];
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
        await timeout(3000);
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
            this.$router.push("/logout");
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
@import "~@/assets/scss/variables.scss";
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
  background: $primary-color;
  opacity: 1;
}

.dot:after {
  content: "";
  position: absolute;
  height: 0.66rem;
  width: 0.66rem;
  border-radius: 50%;
  background: $primary-color;
  display: block;
  animation: pulse 2s ease 0s infinite;
}

.dot:before {
  content: "";
  position: absolute;
  height: 0.66rem;
  width: 0.66rem;
  border-radius: 50%;
  background: $primary-color;
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
