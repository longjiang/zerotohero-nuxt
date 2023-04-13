<template>
  <div>
    <h6 class="mt-4">METHOD 1: Use our YouTube search tool</h6>
    <ol>
      <li>
        Open our
        <router-link
          :to="{
            name: 'youtube-search',
            params: { term: `${$l2.name} language` },
          }"
        >
          YouTube Search Tool
        </router-link>
        and search for {{ $l2.name }} videos. (In the search results, videos
        without {{ $l2.name }} captions are automatically grayed out, although
        you can still open them.)
      </li>
      <li>
        If you don't see any results, try using the option "No captions, more
        results."
      </li>
      <li>Open any video (preferably those that are not grayed out).</li>
      <li>Click the "+ Add to Videos" button to add it to our library.</li>
      <li>
        If the "+ Add to Videos" button is missing, you need to add closed
        captions first by dragging and dropping a subtitles file (SRT or ASS).
      </li>
    </ol>
    <h6 class="mt-4">METHOD 2: Search on YouTube directly</h6>
    <ol>
      <li>
        Install the "Open in Language Player" this bookmarklet. Drag this link to
        your browser's bookmarks bar:
        <a :href="bookmarkletHref" class="btn btn-small btn-ghost-dark">
          Open in Language Player
        </a>
      </li>
      <li>
        Open
        <a
          :href="`https://www.youtube.com/results?search_query=${$l2.name}+language&sp=EgIoAQ%253D%253D`"
        >
          YouTube
        </a>
        , and search for {{ $l2.name }} videos, preferrably those that have
        {{ $l2.name }} closed captions (CC).
      </li>
      <li>
        From YouTube (either a video page or a playlist page), click on the
        bookmarklet you just added in Step 1.
        <b>
          When prompted to enter the language code for {{ $l2.name }}, enter “{{
            $l2.code
          }}”.
        </b>
        This will open that video on our website.
      </li>
      <li>Click the "+ Add to Videos" button to add it to our library.</li>
      <li>
        If the "+ Add to Videos" button is missing, you need to add closed
        captions first by dragging and dropping a subtitles file (SRT or ASS).
      </li>
    </ol>
    <h6 class="mt-4">What if there are no videos on YouTube?</h6>
    <ul>
      <li>
        Can you
        <em>make</em>
        videos, upload them to YouTube, and add closed captions?
      </li>
      <li>
        A drama with dialog in the language is the best content for language
        learning. If you speak the language can you and your family and friends
        create a short film or a web drama series?
      </li>
      <li>
        If making a drama is too much for you, can you
        <em>dub</em>
        a movie or drama from another language?
      </li>
      <li>
        A vlog showing your life is also nice. Or you can film someone speaking
        the language and adding captions.
      </li>
      <li>
        If this is an ancient language, can you make an audible reading of a
        piece of text in the language? Or perhaps even an audiobook?
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bookmarkletHref: `javascript:(function()%7Blet l2 %3D window.prompt("Enter language code (e.g. 'ja' for Japanese)%3A")%3B%0A    let open %3D (%7Bparams%2C channelId%2C playlistTitle%2C channelTitle%2C external%3Dtrue%7D%3D%7B%7D)%3D>%7B%0A        let url%0A        let baseUrl %3D 'https%3A%2F%2Flanguageplayer.io'%0A        if (params.list) %7B%0A            url %3D %60%24%7BbaseUrl%7D%2Fen%2F%24%7Bl2%7D%2Fyoutube%2Fplaylist%2F%24%7Bparams.list%7D%2F%24%7BencodeURIComponent(playlistTitle)%7D%60%0A        %7D else if (params.v) %7B%0A            url %3D %60%24%7BbaseUrl%7D%2Fen%2F%24%7Bl2%7D%2Fyoutube%2Fview%2F%24%7Bparams.v%7D%60%0A        %7D else if (channelId) %7B%0A            url %3D %60%24%7BbaseUrl%7D%2Fen%2F%24%7Bl2%7D%2Fyoutube%2Fchannel%2F%24%7BchannelId%7D%2F%24%7BencodeURIComponent(channelTitle)%7D%60%0A        %7D%0A        if (url) %7B%0A            if (external)%0A                window.open(url)%0A            else%0A                window.location.href %3D url%0A        %7D%0A    %7D%0A    if (window.location.href.includes('results')) %7B%0A        let nodes %3D document.querySelectorAll('ytd-playlist-renderer')%0A        let playlists %3D %5B%5D%0A        for (let node of %5B...nodes%5D) %7B%0A            let playlistTitle %3D node.querySelector('%23video-title').innerText%0A            let count %3D node.querySelector('.style-scope.ytd-thumbnail-overlay-side-panel-renderer').innerText%0A            if (count.includes('K')) count %3D Number(count.replace('K'%2C '')) * 1000%0A            let url %3D node.querySelector('.yt-simple-endpoint').getAttribute('href')%0A            let search %3D url.replace(%2F%5C%2F%5B%5E%3F%5D%2B%2F%2C '')%0A            let urlSearchParams %3D new URLSearchParams(search)%3B%0A            let params %3D Object.fromEntries(urlSearchParams.entries())%3B%0A            playlists.push(%7B%0A                playlistTitle%2C%0A                count%2C%0A                params%0A            %7D)%0A        %7D%0A        playlists %3D playlists.sort((a%2Cb)%3D>b.count - a.count)%0A        console.log('Opening the longest 10 playlists on this page...')%0A        for (let playlist of playlists.slice(0%2C 10).reverse()) %7B%0A            let %7Bparams%2C playlistTitle%2C count%7D %3D playlist%0A            open(%7B%0A                params%2C%0A                playlistTitle%2C%0A                external%3A true%0A            %7D)%0A        %7D%0A    %7D else %7B%0A        let urlSearchParams %3D new URLSearchParams(window.location.search)%3B%0A        let params %3D Object.fromEntries(urlSearchParams.entries())%3B%0A        let playlistTitle%2C channelTitle%2C channelId%0A        if (params.list)%0A            playlistTitle %3D document.querySelector('.title.style-scope.ytd-playlist-panel-renderer').innerText.trim()%0A        if (window.location.href.includes('https%3A%2F%2Fwww.youtube.com%2Fchannel%2F')) %7B%0A            channelId %3D window.location.href.replace(%2F.*%5C%2Fchannel%5C%2F(%5B%5E%2F%3F%5D%2B).*%3F%2F%2C "%241")%0A            channelTitle %3D document.querySelector('.style-scope.ytd-channel-name').innerText.trim()%0A        %7D%0A        open(%7B%0A            params%2C%0A            channelId%2C%0A            playlistTitle%2C%0A            channelTitle%0A        %7D)%0A    %7D%7D)()%3B`,
    };
  },
};
</script>

<style lang="scss" scoped>
</style>