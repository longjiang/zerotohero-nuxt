<template>
  <v-popover offset="6" placement="top" :open="hover" style="display: inline-block">
    <div class="block" @mouseover="hover = true" @mouseleave="hover = false">
      <div class="pinyin" v-if="pinyinParsed">{{ pinyinParsed }}</div>
      <div class="character" v-if="initial">
        <simple-svg
          v-if="initial"
          :filepath="`/img/pinyin-squared/${initial}.svg`"
          fill="#717171"
          class="initial"
        />
        <simple-svg
          v-if="final"
          :filepath="`/img/pinyin-squared/${final}.svg`"
          fill="#717171"
          class="final"
        />
        <simple-svg
          v-if="tone"
          :filepath="`/img/pinyin-squared/tone-${tone}.svg`"
          fill="#28a745"
          class="tone"
        />
      </div>
      <div class="string" v-if="string">{{ string }}</div>
    </div>
    <template slot="popover">
      <div>
        <simple-svg
          v-if="initial"
          :filepath="`/img/pinyin-squared/${initial}.svg`"
          fill="#717171"
          class="legend-initial"
        />
        = {{ initial }}
      </div>
      <div>
        <simple-svg
          v-if="final"
          :filepath="`/img/pinyin-squared/${final}.svg`"
          fill="#717171"
          class="legend-final"
        />
        = {{ final }}
      </div>
      <div>
        <simple-svg
          v-if="tone"
          :filepath="`/img/pinyin-squared/tone-${tone}.svg`"
          fill="#28a745"
          class="legend-tone"
        />
        = tone {{ tone }}
      </div>
    </template>
  </v-popover>
</template>

<script>
import Vue from 'vue'
import VTooltip from 'v-tooltip'
Vue.use(VTooltip)

export default {
  props: {
    blockOrString: {
      default: undefined
    }
  },
  data() {
    return {
      hover: false
    }
  },
  computed: {
    pinyinParsed() {
      return this.block ? pinyinify(this.block.pinyin) : false
    },
    initial() {
      if (typeof this.blockOrString === 'object') {
        return this.blockOrString.initial
      } else {
        return undefined
      }
    },
    final() {
      if (typeof this.blockOrString === 'object') {
        return this.blockOrString.final
      } else {
        return undefined
      }
    },
    tone() {
      if (typeof this.blockOrString === 'object') {
        return this.blockOrString.tone
      } else {
        return undefined
      }
    },
    string() {
      if (typeof this.blockOrString === 'string') {
        return this.blockOrString
      } else {
        return undefined
      }
    }
  },
  methods: {
    construct() {
      if (typeof this.blockOrString === 'string') {
        this.string = this.blockOrString
      } else if (typeof this.blockOrString === 'object') {
        this.block = this.blockOrString
      }
    }
  }
}
</script>

<style lang="scss">
.legend-initial,
.legend-final,
.legend-tone {
  display: inline-block;
  width: 2rem;
}

.legend-tone {
  position: relative;
  bottom: -0.8em;
  left: -0.33em;
}

.tooltip {
  display: block !important;
  z-index: 10000;

  .tooltip-inner {
    background: black;
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
    text-align: left;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
  }

  &[x-placement^='top'] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^='bottom'] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^='right'] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^='left'] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0.15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }

  &.popover {
    $color: #ebebeb;
    border: none;

    .popover-inner {
      background: $color;
      color: black;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 20px rgba(black, 0.2);
    }

    .popover-arrow {
      border-color: $color;
    }
  }
}
</style>
