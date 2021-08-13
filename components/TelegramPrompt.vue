<template>
  <div :class="bodyClasses" class="container">
    <h5>{{ $t('Join our Telegram discussion group') }}</h5>
    <ul class="pl-3 mt-3">
      <li> {{ $t('Share learning resources.') }}</li>
      <li> {{ $t('Interact with fellow learners.') }}</li>
      <li> {{ $t('Help each other out with questions.') }}</li>
      <li> {{ $t('Inspire others with learning experiences.') }}</li>
    </ul>
    <p class="font-weight-bold">
      Download the <a href="#">Telegram app.</a>
      Click <a href="#">here</a> to join the group.
    </p>
  </div>
</template>

<script>
export default {
  props: {
    bodyClasses: String,
    headerType: String
  }
}
</script>