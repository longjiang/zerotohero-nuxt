<router>
  {
    path: '/:l1/:l2/video-count',
  }
</router>
<template>
  <div class="main">
    <SocialHead
      :title="`Video Count | Chinese Zero To Hero`"
      description="See the latest stats on how many videos are there in our courses."
      :image="`/img/courses/bundle-ultimate.jpg`"
    />
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="mb-5 text-center">Latest Video Count</h3>
          <div style="max-width: 40rem; margin: 0 auto">
            <table class="table">
              <thead>
                <tr>
                  <th class="text-left">Course</th>
                  <th class="text-left">Number of Videos</th>
                  <th class="text-left">Total Time</th>
                </tr>
              </thead>
              <tbody class="table-hover">
                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #f8b51e"
                  >
                    HSK 1
                  </td>
                  <td class="text-left">74</td>
                  <td class="text-left">6h 4m</td>
                </tr>

                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #267f94"
                  >
                    HSK 2
                  </td>
                  <td class="text-left">75</td>
                  <td class="text-left">5h 33m</td>
                </tr>

                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #fd4f1c"
                  >
                    HSK 3
                  </td>
                  <td class="text-left">192</td>
                  <td class="text-left">10h 23m</td>
                </tr>

                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #bb1718"
                  >
                    HSK 4
                  </td>
                  <td class="text-left">258</td>
                  <td class="text-left">16h 51m</td>
                </tr>

                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #1b3e76"
                  >
                    HSK 5
                  </td>
                  <td class="text-left">183</td>
                  <td class="text-left">25h 25m</td>
                </tr>

                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #6a3368"
                  >
                    HSK 6
                  </td>
                  <td class="text-left">140</td>
                  <td class="text-left">24h 59m</td>
                </tr>

                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #005f58"
                  >
                    HSK 7-9
                  </td>
                  <td class="text-left">1,235</td>
                  <td class="text-left">84h 25m</td>
                </tr>

                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #004d7f"
                  >
                    Path To Fluency
                  </td>
                  <td class="text-left">46</td>
                  <td class="text-left">3h 35m</td>
                </tr>
                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #b51700"
                  >
                    Phonetics with Chinese Characteristics
                  </td>
                  <td class="text-left">14</td>
                  <td class="text-left">1h 40m</td>
                </tr>

                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #fd4f1c"
                  >
                    Word Builder: Ci Shifu
                  </td>
                  <td class="text-left">100</td>
                  <td class="text-left">10h 28m</td>
                </tr>

                <tr>
                  <td
                    class="text-left text-white"
                    style="background-color: #635e5e"
                  >
                    <strong>Total</strong>
                  </td>
                  <td class="text-left"><strong>2,317</strong></td>
                  <td class="text-left"><strong>189h 23m</strong></td>
                </tr>
              </tbody>
            </table>
            <p class="mt-5">
              If you purchase the
              <a href="https://courses.chinesezerotohero.com/p/ultimate-bundle">
                Ultimate Bundle
              </a>
              , which includes all of our paid courses, each video would cost
              about
              <strong>10 cents.</strong>
            </p>
            <p>Updated on August 29, 2021.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style></style>
