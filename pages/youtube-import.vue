<router>
  {
    path: '/:l1/:l2/youtube/import',
    props: true,
    meta: {
      skin: 'dark',
    },
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5 youtube-import">
      <div style="font-size: 1.5rem; color: white; text-align: center">
        <img
          src="/img/youtube.png"
          style="height: 4rem; margin-bottom: 1rem"
          data-not-lazy
        />
      </div>
      <h4 class="mt-3 mb-5 text-center">
        {{ $t("Import {l2} Videos from YouTube", { l2: $t($l2.name) }) }}
      </h4>
      <b-input-group class="flex-1">
        <b-form-input
          v-model="url"
          :lazy="true"
          @compositionend.prevent.stop="() => false"
          :placeholder="$t('URL of a YouTube video or playlist...')"
        />
      </b-input-group>
      <div class="mt-4">
        <p>
          {{
            $t(
              "In the input field above, type in any YouTube video URL to open that video in Language Player. Alternatively, type in a playlist URL to browse that playlist in Language Player."
            )
          }}
        </p>

        <i18n
          path="You can also do this with a bookmarklet: (1) drag this {0} bookmarklet to your bookmarks bar; (2) navigate to a YouTube video page, and click on the bookmarklet to directly import that video into Language Player."
          tag="p"
        >
          <a :href="bookmarklet" class="btn btn-small btn-primary ml-1 mr-1">
            {{ $t("Open in Language Player") }}
          </a>
        </i18n>
      </div>
    </div>
  </div>
</template>

<script>
import YouTube from "@/lib/youtube";

export default {
  data() {
    return {
      url: undefined,
      bookmarklet: `javascript:(function()%7Bfunction%20videoIdFromURL(url)%20%7B%0A%20%20%20%20var%20regExp%20%3D%20%2F%5E.*((youtu.be%5C%2F)%7C(v%5C%2F)%7C(%5C%2Fu%5C%2F%5Cw%5C%2F)%7C(embed%5C%2F)%7C(watch%5C%3F))%5C%3F%3Fv%3F%3D%3F(%5B%5E%23%26%3F%5D*).*%2F%3B%0A%20%20%20%20var%20match%20%3D%20url.match(regExp)%3B%0A%20%20%20%20return%20(match%20%26%26%20match%5B7%5D.length%20%3D%3D%2011)%20%3F%20match%5B7%5D%20%3A%20undefined%3B%0A%7D%0A%0Afunction%20getId()%20%7B%0A%20%20%20%20let%20url%20%3D%20window.location.href%0A%20%20%20%20let%20id%20%3D%20videoIdFromURL(url)%0A%20%20%20%20return%20id%0A%7D%0A%0Aasync%20function%20getMeta(id)%20%7B%0A%20%20%20%20const%20url%20%3D%20%60https%3A%2F%2Fserver.chinesezerotohero.com%2Fyoutube-video.php%3Fid%3D%24%7Bid%7D%26cache_life%3D-1%60%0A%20%20%20%20let%20response%20%3D%20await%20fetch(url)%3B%0A%20%20%20%20let%20json%20%3D%20response.json()%0A%20%20%20%20return%20json%0A%7D%0A%0Aasync%20function%20getLanguage(id)%20%7B%0A%20%20%20%20let%20json%20%3D%20await%20getMeta(id)%0A%20%20%20%20let%20meta%20%3D%20json.data.items%5B0%5D%0A%20%20%20%20let%20locale%20%3D%20meta.snippet.defaultAudioLanguage%0A%20%20%20%20let%20lang%20%3D%20locale.split('-')%5B0%5D%0A%20%20%20%20return%20lang%0A%7D%0A%0Afunction%20getCaptionLanguageCodes(id)%20%7B%0A%20%20%20%20eval(document.querySelector('body%20%3E%20script%3Anth-child(2)').innerHTML)%0A%20%20%20%20let%20languageCodes%20%3D%20ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks.map(t%20%3D%3E%20t.languageCode)%0A%20%20%20%20return%20languageCodes%0A%7D%0A%0Aasync%20function%20main()%20%7B%0A%20%20%20%20const%20id%20%3D%20getId()%0A%20%20%20%20let%20l2%20%3D%20await%20getLanguage(id)%20%7C%7C%20window.prompt(%22Enter%20language%20code%20(e.g.%20'ja'%20for%20Japanese)%3A%22)%3B%0A%20%20%20%20let%20open%20%3D%20(%7Bparams%2C%20channelId%2C%20playlistTitle%2C%20channelTitle%2C%20external%3Dtrue%7D%3D%7B%7D)%3D%3E%7B%0A%20%20%20%20%20%20%20%20let%20url%0A%20%20%20%20%20%20%20%20let%20baseUrl%20%3D%20'https%3A%2F%2Fwww.languageplayer.io'%0A%20%20%20%20%20%20%20%20if%20(params.list)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20url%20%3D%20%60%24%7BbaseUrl%7D%2Fen%2F%24%7Bl2%7D%2Fyoutube%2Fplaylist%2F%24%7Bparams.list%7D%2F%24%7BencodeURIComponent(playlistTitle)%7D%60%0A%20%20%20%20%20%20%20%20%7D%20else%20if%20(params.v)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20url%20%3D%20%60%24%7BbaseUrl%7D%2Fen%2F%24%7Bl2%7D%2Fyoutube%2Fview%2F%24%7Bparams.v%7D%60%0A%20%20%20%20%20%20%20%20%7D%20else%20if%20(channelId)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20url%20%3D%20%60%24%7BbaseUrl%7D%2Fen%2F%24%7Bl2%7D%2Fyoutube%2Fchannel%2F%24%7BchannelId%7D%2F%24%7BencodeURIComponent(channelTitle)%7D%60%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20if%20(url)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(external)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.open(url)%0A%20%20%20%20%20%20%20%20%20%20%20%20else%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.location.href%20%3D%20url%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20if%20(window.location.href.includes('results'))%20%7B%0A%20%20%20%20%20%20%20%20let%20nodes%20%3D%20document.querySelectorAll('ytd-playlist-renderer')%0A%20%20%20%20%20%20%20%20let%20playlists%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20for%20(let%20node%20of%20%5B...nodes%5D)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20let%20playlistTitle%20%3D%20node.querySelector('%23video-title').innerText%0A%20%20%20%20%20%20%20%20%20%20%20%20let%20count%20%3D%20node.querySelector('.style-scope.ytd-thumbnail-overlay-side-panel-renderer').innerText%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(count.includes('K'))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20count%20%3D%20Number(count.replace('K'%2C%20''))%20*%201000%0A%20%20%20%20%20%20%20%20%20%20%20%20let%20url%20%3D%20node.querySelector('.yt-simple-endpoint').getAttribute('href')%0A%20%20%20%20%20%20%20%20%20%20%20%20let%20search%20%3D%20url.replace(%2F%5C%2F%5B%5E%3F%5D%2B%2F%2C%20'')%0A%20%20%20%20%20%20%20%20%20%20%20%20let%20urlSearchParams%20%3D%20new%20URLSearchParams(search)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20let%20params%20%3D%20Object.fromEntries(urlSearchParams.entries())%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20playlists.push(%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20playlistTitle%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20count%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20params%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20playlists%20%3D%20playlists.sort((a%2Cb)%3D%3Eb.count%20-%20a.count)%0A%20%20%20%20%20%20%20%20console.log('Opening%20the%20longest%2010%20playlists%20on%20this%20page...')%0A%20%20%20%20%20%20%20%20for%20(let%20playlist%20of%20playlists.slice(0%2C%2010).reverse())%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20let%20%7Bparams%2C%20playlistTitle%2C%20count%7D%20%3D%20playlist%0A%20%20%20%20%20%20%20%20%20%20%20%20open(%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20params%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20playlistTitle%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20external%3A%20true%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D)%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20let%20urlSearchParams%20%3D%20new%20URLSearchParams(window.location.search)%3B%0A%20%20%20%20%20%20%20%20let%20params%20%3D%20Object.fromEntries(urlSearchParams.entries())%3B%0A%20%20%20%20%20%20%20%20let%20playlistTitle%2C%20channelTitle%2C%20channelId%0A%20%20%20%20%20%20%20%20if%20(params.list)%0A%20%20%20%20%20%20%20%20%20%20%20%20playlistTitle%20%3D%20document.querySelector('.title.style-scope.ytd-playlist-panel-renderer').innerText.trim()%0A%20%20%20%20%20%20%20%20if%20(window.location.href.includes('https%3A%2F%2Fwww.youtube.com%2Fchannel%2F'))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20channelId%20%3D%20window.location.href.replace(%2F.*%5C%2Fchannel%5C%2F(%5B%5E%2F%3F%5D%2B).*%3F%2F%2C%20%22%241%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20channelTitle%20%3D%20document.querySelector('.style-scope.ytd-channel-name').innerText.trim()%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20open(%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20params%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20channelId%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20playlistTitle%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20channelTitle%0A%20%20%20%20%20%20%20%20%7D)%0A%20%20%20%20%7D%0A%7D%0A%0Amain()%7D)()%3B`,
    };
  },
  computed: {
  },
  watch: {
    url() {
      if (this.url && this.url.length > 0) {
        let youtubeId, playlistId;
        youtubeId = YouTube.videoIdFromURL(this.url);
        playlistId = YouTube.playlistIdFromURL(this.url);
        if (!youtubeId && !playlistId) {
          // the user may have simply entered an id
          if (this.url.startsWith("PL")) playlistId = this.url;
          else youtubeId = this.url;
        }
        if (youtubeId) {
          this.$router.push({
            name: "video-view",
            params: { type: "youtube", youtube_id: youtubeId },
          });
        } else if (playlistId) {
          this.$router.push({
            name: "youtube-playlist",
            params: { playlist_id: playlistId },
          });
        } else {
          alert("We cannot recognize this URL.");
        }
      }
    },
  },
};
</script>

<style></style>
