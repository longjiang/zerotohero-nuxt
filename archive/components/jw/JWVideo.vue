<template>
  <div class="jw-study-aid-video">
    <div class="video-processor-player-wrapper"></div>
    <div v-if="video">
      <VideoComp
        class=""
        :thumbnail="video.posterUrl"
        :url="video.sources[video.sources.length - 1].url"
      />
    </div>
    <div class="video-processor-title"></div>
    <div class="video-processor-transcript">
      <span class="throbber-loader" v-if="loading">Loading&#8230;</span>
      <SyncedTranscript
        v-if="video"
        ref="transcript"
        :key="'transcript-' + languageAgnosticNaturalKey"
        :lines="video.subtitles"
      />
    </div>
    <div class="video-processor-link">
      <img class="video-processor-link-image" />
      <br />
      <a class="video-processor-link-title"></a>
    </div>
  </div>
</template>

<script>
import Wol from "@/lib/jw/Wol";
import { WebVTTParser } from "webvtt-parser";
import { proxy}  from "@/lib/utils";

export default {
  props: {
    languageAgnosticNaturalKey: {
      type: String,
    },
    startTime: {
      type: Number,
      default: 0,
    },
    highlight: {
      type: String,
    },
  },
  computed: {
  },
  data() {
    return {
      video: undefined,
      posterUrl: undefined,
      source: [],
      id: new Date().getTime(),
      loading: true,
    };
  },
  async mounted() {
    this.video = await this.getVideo(this.languageAgnosticNaturalKey);
    this.loading = false;
  },
  methods: {
    async getVideo(
      languageAgnosticNaturalKey,
      startTime = 0,
      highlight = undefined
    ) {
      // for each verse, create a snippet and attach
      let json = await Wol.getVideo(languageAgnosticNaturalKey);
      // load the video into the snippet
      if (json.images.wss) {
        var posterUrl = json.images.wss.lg;
      }
      let subtitles = await this.getSubtitles(json);

      let video = {
        category: json.primaryCategory,
        images: json.images,
        title: json.title,
        languageAgnosticNaturalKey,
        sources: (json.files || []).map((file) => {
          return { url: file.progressiveDownloadURL };
        }),
        posterUrl,
        startTime: Number(startTime),
        highlight: highlight,
        subtitles,
        data: json,
      };
      console.log({ video });
      return video;
    },

    async getSubtitles(video) {
      let fileWithSubs = video.files.find((f) => f.subtitles);
      if (fileWithSubs) {
        let url = fileWithSubs.subtitles?.url;
        let vtt = await proxy(url);
        if (vtt) {
          const parser = new WebVTTParser();
          const tree = parser.parse(vtt, "metadata");
          const lines = tree.cues.map(line => {
            return {
              starttime: line.startTime,
              duration: line.endTime - line.startTime,
              line: line.text
            }
          })
          return lines;
        }
      }
    },
  },
};
</script>

<style>

.video-processor-controls {
  margin-bottom: 2rem;
}

.video-processor-video-list {
  display: flex;
  flex-wrap: wrap;
}

.video-processor-video-list-item {
  list-style: none;
  width: 50%;
  padding: 0.1rem;
  margin-bottom: 1rem;
}

.video-processor-video-list-item a {
  box-shadow: none !important;
  border: none !important;
}

.video-processor-video-list-item-image {
  box-shadow: none !important;
}

.video-processor-video-list-item-title {
  padding: 0 0.5rem;
}

.back-to-videos-btn {
  margin-bottom: 1rem;
  background: #eaeaea;
  color: #3c3c3c;
  border-radius: 0.3rem;
  padding: 0.5rem 1rem;
}

.back-to-videos-btn::before {
  content: "< ";
}


.video-processor-transcript span {
  cursor: pointer;
}

.video-processor-controls-bottom p {
  width: 100%;
}

.video-processor-controls-bottom input {
  flex: 1;
}

.video-processor-controls-bottom {
  display: flex;
  flex-wrap: wrap;
  margin-top: 2rem;
  border-top: 1px solid #ccc;
  padding-top: 2rem;
}

.video-processor-title {
  margin-top: 1rem;
}

.video-processor-transcript .highlight {
  background: yellow;
}
</style>