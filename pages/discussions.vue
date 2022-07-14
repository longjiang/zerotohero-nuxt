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
            <h6 style="font-size: 1.1em">Please leave your questions and comments here.</h6>
            <p>This is a <a href="https://disqus.com/profile/login/?next=/admin/create/" target="_blank">Disqus</a> discussion board. To post a comment, you ened to first <a href="https://disqus.com/profile/login/?next=/admin/create/" target="_blank">login to Disqus</a>.</p>
            <div class="alert alert-danger"><b>Note:</b> Discussions in iOS app is currently not supported.</div>
            <p class="mb-5"></p>
          </div>
          <client-only>
            <section class="comments" aria-labelledby="comment">
              <Disqus shortname="zero-to-hero" :pageConfig="{
                  identifier: 'comments-feedback',
                  title: 'Language Player Comments & Feedback'
                }" />
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
  data: () => ({
    pageConfig: {
      title: 'All discussions',
      identifier: '/'
    }
  })
};
</script>

<style>
</style>