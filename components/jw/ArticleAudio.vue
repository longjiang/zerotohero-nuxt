<template>
  <audio preload="auto" controls ref="player">
    <source :src="audio_url" type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>
</template>

<script>
import Helper from '@/lib/Helper';
import $ from "jquery";

export default {
  props: ["audio_data", "options"],
  data() {
    return {
      isBible: false,
      currentVerse: null,
      currentParagraphId: null,
      stopAfterVerseNum: undefined,
      firstVerse: this.options.firstVerse,
      lastVerse: this.options.lastVerse,
      firstParagraph: this.options.firstParagraph,
      lastParagraph: this.options.lastParagraph,
      onMarker: this.options.onMarker,
      onParagraphMarker: this.options.onParagraphMarker,
      onMarkerContext: this.options.onMarkerContext,
    };
  },
  computed: {
    markers() {
      if (this.audio_data.markers) {
        return this.audio_data.markers.markers === undefined
          ? this.audio_data.markers
          : this.audio_data.markers.markers;
      }
    },
    audio_url() {
      return this.audio_data.audio_url;
    },
    player() {
      return this.$refs.player;
    },
  },
  mounted() {
    $(this.player).one("canplay", () => {
      if (this.firstVerse > 1) {
        this.advanceToVerse(this.firstVerse);
      }
      if (this.currentVerse > 1) {
        this.advanceToVerse(this.currentVerse);
      }
      if (this.lastVerse !== undefined) {
        this.stopPlaybackAfterVerse(this.lastVerse);
      }
      if (this.firstParagraph > 1) {
        this.advanceToVerse(this.firstParagraph);
      }
      if (this.lastParagraph !== undefined) {
        this.stopPlaybackAfterVerse(this.lastParagraph);
      }
      if (this.markers !== undefined) {
        if (this.markers[0].verseNumber !== undefined) {
          this.isBible = true;
        }
        this.player.ontimeupdate = () => {
          this.playerOnTimeUpdate();
        };
      }
    });
    $(this.player).on("play", () => {
      if (this.atVerseStopTime()) {
        this.player.currentTime = this.player.currentTime + 0.1;
      }
    });
  },
  methods: {
    pause() {
      this.player.pause();
    },

    play() {
      this.player.play();
    },

    atVerseStopTime() {
      let audio = this;
      // When playhead moves
      // Get the current playhead and the audio wrapper
      var currentTime = audio.player.currentTime;
      var delta = currentTime - audio.verseStopTime;
      // If current time is just beyond stop time
      return Math.abs(delta) < 0.2;
    },

    stopAtStopTime() {
      let audio = this;
      if (audio.atVerseStopTime()) {
        audio.pause();
        return true;
      }
    },

    playerOnTimeUpdate() {
      var audio = this;
      // The current time of the player
      var playhead = audio.player.currentTime;
      var reverseMarkers = audio.markers.slice(0).reverse();

      if (audio.stopAtStopTime()) {
        return;
      }

      $.each(reverseMarkers, function (key, marker) {
        var markerStartTimeSeconds = Helper.parseTime(marker.startTime);
        if (playhead > markerStartTimeSeconds) {
          // We announce the marker when we hit it
          if (audio.isBible) {
            if (audio.currentVerse !== marker.verseNumber) {
              audio.currentVerse = marker.verseNumber;
              if (audio.onMarker !== undefined) {
                audio.onMarker(audio.currentVerse, audio.onMarkerContext);
              }
            }
          } else {
            if (audio.currentParagraphId !== marker.mepsParagraphId) {
              audio.currentParagraphId = marker.mepsParagraphId;
              if (audio.onParagraphMarker !== undefined) {
                audio.onParagraphMarker(
                  audio.currentParagraphId,
                  audio.onMarkerContext
                );
              }
            }
          }
          return false;
        }
      });
    },

    advanceToVerse(verseNum) {
      this.stopAfterVerseNum = undefined;
      this.currentVerse = verseNum;
      // Advance the audio player to this time
      let verseStartTimeSeconds = this.getVerseStartTime(verseNum);
      if (verseStartTimeSeconds) {
        this.player.currentTime = this.getVerseStartTime(verseNum) + 0.1;
      }
      this.onMarker(this.currentVerse, this.onMarkerContext);
    },

    stopPlaybackAfterVerse(verseNum) {
      var audio = this;
      // Get the verse's stopTime
      $.each(this.markers, function (key, marker) {
        if (Number(verseNum) === Number(marker.verseNumber)) {
          audio.verseStopTime =
            Helper.parseTime(marker.startTime) +
            Helper.parseTime(marker.duration);
        }
      });
    },

    getVerseStartTime(verseNum) {
      // Go through each marker
      let verseStartTimeSeconds;
      $.each(this.markers, function (key, verse) {
        // Get the start time for the verse
        if (Number(verse.verseNumber) === Number(verseNum)) {
          verseStartTimeSeconds = Helper.parseTime(verse.startTime);
          return true;
        }
      });
      return verseStartTimeSeconds;
    },

    advanceToParagraph(paragraphNum) {
      var audio = this;
      this.stopAfterVerseNum = undefined;
      $.each(this.markers, function (key, paragraph) {
        if (Number(paragraph.mepsParagraphId) === Number(paragraphNum)) {
          $(audio.player).attr(
            "data-current-paragraph",
            paragraph.mepsParagraphId
          );
          var paragraphStartTimeSeconds = Helper.parseTime(paragraph.startTime);
          // When the audio is loaded, advance to the first paragraph
          audio.player.currentTime = paragraphStartTimeSeconds + 0.1;
        }
      });
    },

    hasMarkers() {
      return this.audio_data.markers !== undefined;
    },

    togglePlayback(callback = function () {}) {
      this.stopAfterVerseNum = undefined;
      if (this.player.paused) {
        this.play();
        callback();
      } else {
        this.pause();
      }
    },
  },
};
</script>

<style>
</style>