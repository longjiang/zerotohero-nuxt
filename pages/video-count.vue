<router>
  {
    path: '/:l1/:l2/video-count',
  }
</router>
<template>
  <div class="container main pt-5 mb-5">
    <SocialHead
      :title="`Video Count | Chinese Zero To Hero`"
      description="See the latest stats on how many videos are there in our courses."
      :image="`/img/courses/bundle-ultimate.jpg`"
    />
    <div class="row"> 
      <div class="col-sm-12">
        <h1 class="mb-4">Latest Video Count</h1>
        <p class="mb-5"></p>
        <table class="table">
          <div>
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
                  style="background-color:#F8B51E;"
                >
                  HSK 1
                </td>
                <td class="text-left">74</td>
                <td class="text-left">6h 4m</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#267F94;"
                >
                  HSK 2
                </td>
                <td class="text-left">75</td>
                <td class="text-left">5h 33m</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#FD4F1C;"
                >
                  HSK 3
                </td>
                <td class="text-left">192</td>
                <td class="text-left">10h 23m</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#BB1718;"
                >
                  HSK 4
                </td>
                <td class="text-left">258</td>
                <td class="text-left">16h 51m</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#1B3E76;"
                >
                  HSK 5
                </td>
                <td class="text-left">183</td>
                <td class="text-left">25h 25m</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#091B3B;"
                >
                  HSK 5 Expansions*
                </td>
                <td class="text-left">(259)</td>
                <td class="text-left">(70h)</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#6A3368;"
                >
                  HSK 6
                </td>
                <td class="text-left">140</td>
                <td class="text-left">24h 59m</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#451943;"
                >
                  HSK 6 Expansions*
                </td>
                <td class="text-left">(204)</td>
                <td class="text-left">(200h)</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#004D7F;"
                >
                  Path To Fluency
                </td>
                <td class="text-left">46</td>
                <td class="text-left">3h 35m</td>
              </tr>
              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#B51700;"
                >
                  Phonetics with Chinese Characteristics
                </td>
                <td class="text-left">14</td>
                <td class="text-left">1h 40m</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#FD4F1C;"
                >
                  Word Builder: Ci Shifu
                </td>
                <td class="text-left">100</td>
                <td class="text-left">10h 28m</td>
              </tr>

              <tr>
                <td
                  class="text-left text-white"
                  style="background-color:#635e5e;"
                >
                  <strong>Total</strong>
                </td>
                <td class="text-left"><strong>1058+</strong></td>
                <td class="text-left"><strong>104h 58m</strong></td>
              </tr>
            </tbody>
            <p class="mt-5">
              * Videos from the expansion courses are from external resources,
              we provide PDF study sheets.
            </p>
            <p class="mt-5">
              If you purchase the
              <a href="https://courses.chinesezerotohero.com/p/ultimate-bundle"
                >Ultimate Bundle</a
              >, which contain all videos from HSK 1 to 6, each video would cost
              about <strong>20 cents. </strong>
            </p>
          </div>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style></style>
