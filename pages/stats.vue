<router>
  {
    path: '/stats',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div class="bg-white" style="min-height: 100vh">
    <SocialHead
      title="Status | Zero to Hero Languages"
      description="How many videos we have for each language.”"
    />
    <SiteTopBar />
    <div class="container">
      <div class="row">
        <div class="col-sm-12 pt-5 pb-5">
          <h3 class="text-center">Video Stats</h3>
          <StatsComp />
        </div>
      </div>
    </div>
  </div>
</template>