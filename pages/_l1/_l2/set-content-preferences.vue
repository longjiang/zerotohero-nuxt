<template>
  <div class="container pb-5">
    <div class="row">
      <div class="col-12">
        <p class="text-center mb-4">
          {{ $t('Which categories of content interest you?')}}
        </p>
        <ContentPreferences />
        <div class="text-center" v-if="preferredCategories.length > 0">
          <router-link
            class="btn btn-success pl-5 pr-5 mt-4"
            :to="{ name: DEFAULT_PAGE }"
          >
            {{ $t('Continue') }}
            <i class="fa fa-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { DEFAULT_PAGE } from "@/lib/utils";

export default {
  data() {
    return {
      DEFAULT_PAGE,
    };
  },
  computed: {
    ...mapState("settings", ["preferredCategories"]),
  },
};
</script>

<style>
</style>