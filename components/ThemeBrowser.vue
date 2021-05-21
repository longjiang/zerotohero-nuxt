<template>
  <div class="dewey" v-cloak :key="browseKey">
    <ul class="dewey-l1">
      <li v-for="(l1, i) of l1s">
        <h4>
          <i
            v-if="!showL1[i]"
            @click="toggleL1(i)"
            class="fas fa-plus expand-btn"
          ></i>
          <i
            v-if="showL1[i]"
            @click="toggleL1(i)"
            class="fas fa-minus collapse-btn"
          ></i>
          <span class="dewey-code ml-3">{{ l1.code }}</span>

          <Annotate
            tag="span"
            class="dewey-l1-title"
            :explore="true"
            :wordBlockTemplateFilter="wordBlockTemplateFilter"
            :showTranslate="true"
          >
            <span>{{ l1.title }}</span>
          </Annotate>
        </h4>
        <div :key="l1Key + i * 1000">
          <ul class="dewey-l2" v-if="showL1[i]">
            <li v-for="(l2, j) of l1.children">
              <h5>
                <i
                  @click="toggleL2(i, j)"
                  class="fas fa-plus expand-btn"
                  v-if="!showL2[i][j]"
                ></i>
                <i
                  @click="toggleL2(i, j)"
                  class="fas fa-minus collapse-btn"
                  v-if="showL2[i][j]"
                ></i>
                <span class="dewey-code ml-3">{{ l2.code }}</span>
                <Annotate
                  tag="span"
                  class="dewey-l2-title"
                  :explore="true"
                  :wordBlockTemplateFilter="wordBlockTemplateFilter"
                  :showTranslate="true"
                >
                  <span>{{ l2.title }}</span>
                </Annotate>
              </h5>
              <div :key="l2Key + i + j * 1000">
                <ul class="dewey-l3" v-if="showL2[i][j]">
                  <li v-for="l3 of l2.children">
                    <h6>
                      <span class="dewey-code ml-3">{{ l3.code }}</span>
                      <Annotate
                        tag="span"
                        class="dewey-l3-title"
                        :explore="true"
                        :wordBlockTemplateFilter="wordBlockTemplateFilter"
                        :showTranslate="true"
                      >
                        <span>{{ l3.title }}</span>
                      </Annotate>
                    </h6>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Dewey from "@/lib/dewey";

export default {
  data() {
    return {
      l1s: undefined,
      showL1: [],
      showL2: [],
      l1Key: 0,
      l2Key: 0,
      browseKey: 0,
    };
  },
  async mounted() {
    await Dewey.load();
    window.Dewey = Dewey;
    let top = Dewey.top();
    for (let i in top) {
      this.showL1[i] = false;
      this.showL2[i] = [];
      for (let j in top[i].children) {
        this.showL2[i][j] = false;
      }
    }
    this.l1s = top;
  },
  methods: {
    toggleL1(i) {
      this.showL1[i] = !this.showL1[i];
      this.l1Key++;
    },

    toggleL2(i, j) {
      this.showL2[i][j] = !this.showL2[i][j];
      this.l2Key++;
    },

    wordBlockTemplateFilter(block, textOrCandidates) {
      if (Array.isArray(textOrCandidates)) {
        const candidates = textOrCandidates;
        for (let candidate of candidates) {
          const saved = Helper.saved(candidate);
          if (saved) $(block).addClass("saved");
        }
        $(block)
          .addClass("word-block-related")
          .click(() => {
            this.$router.push({
              path: `/${this.$l1.code}/${this.$l2.code}/explore/related/${candidates[0].id}`,
            });
          })
          .prepend('<i class="fas fa-expand-arrows-alt"></i>');
      }
    },
  },
};
</script>

<style>
.dewey-l1.collapsed,
.dewey-l2.collapsed,
.dewey-l3.collapsed {
  display: none;
}

.dewey h4,
.dewey h5,
.dewey h6 {
  margin-bottom: 0;
}

.dewey-l1,
.dewey-l2,
.dewey-l3 {
  padding: 0;
  list-style: none;
}

.dewey-l2 {
  padding-left: 0.8rem;
}

.dewey-l3 {
  padding-left: 1.8rem;
}

.collapse-btn,
.expand-btn {
  color: white;
  background: #fd4f1c;
  width: 1.2em;
  height: 1.2em;
  text-align: center;
  border-radius: 0.23em;
  line-height: 1.2em !important;
}

.collapse-btn:hover,
.expand-btn:hover {
  background: #ff7f5a;
  cursor: pointer;
}

.dewey-code {
  color: #ccc;
  font-size: 0.8em;
}

.word-block-related {
  padding: 0.5rem;
  margin: 0 0.2rem;
  border-radius: 0.3rem;
  padding-top: 1.2em;
  margin-top: -0.5em;
}

.word-block-related:hover {
  background: rgba(255, 255, 255, 0.9);
  z-index: 10000000 !important;
}
.word-block-related:hover {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.word-block-related:not(:hover) i {
  opacity: 0;
}

.word-block-related i {
  font-size: 0.7em;
  color: #ccc;
  position: absolute;
  top: 0.5rem;
  width: 2rem;
  left: calc(50% - 1rem);
}

.dewey-l1 > li {
  border-bottom: 1px dashed #ccc;
}
</style>
