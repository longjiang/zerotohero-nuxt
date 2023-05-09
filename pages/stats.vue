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
  <div style="min-height: 100vh">
    <SocialHead
      title="Stats | Language Player"
      description="How many videos we have for each language.”"
    />
    <div class="container">
      <div class="row">
        <div class="col-sm-12 pt-5 pb-5">
          <h4 class="text-center mb-4">{{ $tb('Language Player Video Stats by Language') }}</h4>
          <StatsComp />
        </div>
      </div>
    </div>
  </div>
</template>