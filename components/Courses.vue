<template>
  <div class="courses">
    <div class="container mb-3">
      <h3 class="text-center">Course Bundles</h3>
      <hr class="mb-5" />
      <div class="row">
        <div class="col-sm-6 col-md-4 mb-5">
          <a
            :href="`https://chinesezerotohero.teachable.com/p/ultimate-bundle/`"
          >
            <img
              :src="`/img/courses/bundle-ultimate.jpg`"
              alt="Ultimate Bundle"
              class="img-fluid shadow rounded"
            />
            <h5 class="mt-4">Ultimate Bundle: All Courses</h5>
          </a>
        </div>
        <div class="col-sm-6 col-md-4 mb-5">
          <a
            :href="`https://chinesezerotohero.teachable.com/p/hsk-1-4-bundle/`"
          >
            <img
              :src="`/img/courses/bundle-hsk-1-4.jpg`"
              alt="HSK 1 - 4 Bundle"
              class="img-fluid shadow rounded"
            />
            <h5 class="mt-4">HSK 1 - 4 Bundle</h5>
          </a>
        </div>
        <div class="col-sm-6 col-md-4 mb-5">
          <a
            :href="`https://chinesezerotohero.teachable.com/p/hsk-5-6-bundle/`"
          >
            <img
              :src="`https://www.chinesezerotohero.com/wp-content/uploads/2021/01/Course-Covers.027.jpg`"
              alt="HSK 5 - 6 Bundle"
              class="img-fluid shadow rounded"
            />
            <h5 class="mt-4">HSK 5 - 6 Bundle</h5>
          </a>
        </div>
      </div>
      <h3 class="text-center">Individual Courses</h3>
      <hr class="mb-5" />
      <div class="row">
        <div class="col-sm-6 col-md-4 mb-3" v-for="hsk in [1, 2, 3, 4, 5, 6]">
          <a
            :href="`https://chinesezerotohero.teachable.com/p/hsk-${hsk}-course/`"
          >
            <img
              :src="`/img/courses/hsk${hsk}.jpg`"
              :alt="`HSK ${hsk} Course`"
              class="img-fluid shadow rounded"
            />
            <h5 class="mt-4">HSK {{ hsk }} Course</h5>
          </a>
        </div>
        <div class="col-sm-6 col-md-4 mb-5">
          <a :href="`https://chinesezerotohero.teachable.com/p/hsk-7-9-words`">
            <img
              :src="`/img/courses/hsk7-9.jpg`"
              :alt="`HSK 7-9 Words`"
              class="img-fluid shadow rounded"
            />
            <h5 class="mt-4">HSK 7-9 Course</h5>
          </a>
        </div>
        <div class="col-sm-6 col-md-4 mb-5">
          <a
            :href="`https://chinesezerotohero.teachable.com/p/path-to-fluency/`"
          >
            <img
              :src="`/img/courses/fluency.jpg`"
              alt="Path to Fluency Course"
              class="img-fluid shadow rounded"
            />
            <h5 class="mt-4">Path to Fluency</h5>
          </a>
        </div>
      </div>

      <h3 class="text-center">Free Courses</h3>
      <hr class="mb-5" />
      <div class="row">
        <div class="col-sm-6 col-md-4 mb-5">
          <a
            :href="`https://chinesezerotohero.teachable.com/p/phonetics-with-chinese-characteristics`"
          >
            <img
              :src="`/img/courses/phonetics.jpg`"
              alt="Phonetics with Chinese Characteristics"
              class="img-fluid shadow rounded"
            />
            <h5 class="mt-4">Phonetics with Chinese Characteristics</h5>
          </a>
        </div>
        <div class="col-sm-6 col-md-4 mb-5">
          <a
            :href="`https://chinesezerotohero.teachable.com/p/learn-chinese-with-songs`"
          >
            <img
              :src="`https://process.fs.teachablecdn.com/ADNupMnWyR7kCWRvm76Laz/resize=width:705/https://www.filepicker.io/api/file/8h047RSQS2KbHEV58Tk6`"
              alt="Learn Chinese with Songs"
              class="img-fluid shadow rounded"
            />
            <h5 class="mt-4">Learn Chinese with Songs</h5>
          </a>
        </div>
        <div class="col-sm-6 col-md-4 mb-5">
          <a
            :href="`https://chinesezerotohero.teachable.com/p/chinese-short-poems`"
          >
            <img
              :src="`https://process.fs.teachablecdn.com/ADNupMnWyR7kCWRvm76Laz/resize=width:705/https://www.filepicker.io/api/file/CCmgMURQNW4CYXRxjbfL`"
              alt="Learn Chinese with Poems"
              class="img-fluid shadow rounded"
            />
            <h5 class="mt-4">Learn Chinese with Poems</h5>
          </a>
        </div>
      </div>
    </div>
    <div class="text-center">
      <a
        href="https://chinesezerotohero.teachable.com/"
        class="btn btn-success view-courses pb-1 bigger"
      >
        View all of our courses and bundles on
        <img
          src="/img/teachable_light.png"
          alt="Teachable"
          class="logo-small mb-1"
        />
      </a>
      <p class="mt-3">
        <b>Teachable</b>
        is an online platform that hosts video courses.
      </p>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.courses a:not(.btn) {
  color: inherit;
}

.courses a:hover {
  text-decoration: none;
}
</style>