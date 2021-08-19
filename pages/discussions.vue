<router>
  {
    path: '/:l1/:l2/discussions',
    props: true
  }
</router>
<template>
  <div class="main pt-5 pb-5">
    <div class="container">
      <div class="row">
        <div class="col">
          <div class="text-center">
            <h3 class="mb-5">Discussions</h3>
            <p class="mt-3" style="font-size: 1.1em">Feedback? Questions? General language-learning discussions?</p>
            <p class="mb-5" style="font-size: 1.1em">Leave all your comments here.</p>
          </div>
          <client-only>
            <section class="comments" aria-labelledby="comment">
              <Disqus shortname="zero-to-hero" />
            </section>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Disqus } from "vue-disqus";
export default {
  components: {
    Disqus,
  },
};
</script>

<style>
</style>