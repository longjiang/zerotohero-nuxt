<template>
  <Widget>
    <template #title>
      <div class="widget-title-mistakes">
        Student Mistakes with “{{ text }}”
      </div>
    </template>
    <template #body>
      <div class="text-center p-5" v-if="updating">
        <Loader :sticky="true" message="Loading student mistakes..." />
      </div>
      <div v-if="mistakes && mistakes.length > 0">
        <ul class="collapsed pl-0" data-collapse-target>
          <li
            class="list-unstyled mistake-item mt-4 mb-4"
            v-for="(mistake, index) in mistakes"
            :key="`mistake-${index}`"
          >
            <i class="fas fa-times mistake-item-icon"></i>
            <span class="mistake-context collapsed" data-collapse-target>
              <Annotate :showTranslate="true" :checkSaved="false">
                <span>{{ mistake.leftContext }}</span>
              </Annotate>
            </span>
            <Annotate
              class="mistake-sentence"
              :showTranslate="true"
              :checkSaved="false"
              :buttons="true"
            >
              <span>
                {{ mistake.left }}
                <span class="mistake-word">{{ text }}</span>
                {{ mistake.right }}
              </span>
            </Annotate>
            <span class="mistake-context collapsed" data-collapse-target>
              <Annotate
                :speak="true"
                :copy="true"
                :checkSaved="false"
                :fullscreen="true"
                :showTranslate="true"
              >
                <span>{{ mistake.rightContext }}</span>
              </Annotate>
            </span>
            <ShowMoreButton :length="1" class="mb-2 btn-small ml-2">
              Context
            </ShowMoreButton>
            <div>
              <div class="mistake-description">
                <span v-if="mistake.country">
                  Student from
                  <b>{{ mistake.country.name }}</b>
                </span>
                <span v-if="mistake.l1">
                  and speaks
                  <Annotate class="mistake-l1">
                    <b>{{ mistake.l1 }}</b>
                  </Annotate>
                </span>
              </div>
              <div class="mistake-description">
                <span v-if="mistake.errorLevel && mistake.errorType">
                  Mistake with
                  <b>
                    {{ mistake.errorLevel }}
                    <span v-if="mistake.errorType !== 'anomaly'">
                      ({{ mistake.errorType }})
                    </span>
                  </b>
                </span>
              </div>
              <div class="mistake-description">
                <span v-if="mistake.proficiency">
                  <b>{{ ucFirst(mistake.proficiency) }}</b>
                  Chinese proficiency
                </span>
              </div>
            </div>
          </li>
        </ul>
        <ShowMoreButton
          :length="mistakes.length"
          min="4"
          style="background-color: red; color: white"
        ></ShowMoreButton>
      </div>
      <div v-if="mistakes && mistakes.length === 0">
        Sorry, we could not find any mistakes with “{{ text }}”
      </div>
      <div class="mt-2">
        Mistake corpus provided by
        <a
          target="_blank"
          :href="`https://app.sketchengine.eu/#concordance?corpname=preloaded%2Fguangwai&tab=basic&keyword=${text}&structs=s%2Cg&refs=%3Ddoc.website&showresults=1&operations=%5B%7B%22name%22%3A%22iquery%22%2C%22arg%22%3A%22${text}%22%2C%22active%22%3Atrue%2C%22query%22%3A%7B%22queryselector%22%3A%22iqueryrow%22%2C%22iquery%22%3A%22${text}%22%7D%2C%22id%22%3A3859%7D%5D`"
        >
          <img
            src="/img/logo-sketch-engine.png"
            alt="Sketch Engine"
            class="ml-2 logo-small"
          />
        </a>
        <a
          target="_blank"
          href="https://www.sketchengine.eu/guangwai-lancaster-chinese-learner-corpus/"
        >
          <img
            src="/img/logo-guangwai.png"
            alt="Guangwai"
            class="ml-4 mb-2 logo-small"
          />
        </a>
        <br />
        <small>
          Corpus name: Guangwai - Lancaster Chinese Learner Corpus. Corpus code:
          <code>guangwai</code>
        </small>
      </div>
    </template>
  </Widget>
</template>

<script>
import SketchEngine from "@/lib/sketch-engine";
import { ucFirst } from "@/lib/utils";

export default {
  props: ["text"],
  data() {
    return {
      show: false,
      mistakes: undefined,
      updating: true,
    };
  },
  methods: {
    showClick() {
      this.show = true;
    },
    ucFirst(...args) {
      return ucFirst(...args);
    },
  },
  async created() {
    let results = await SketchEngine.mistakes({
      term: this.text,
    });
    this.updating = false;
    this.mistakes = results;
    if (this.mistakes && this.mistakes.length > 0) {
      this.$emit("mistakesReady");
    }
  },
};
</script>
<style>
.mistake-word {
  color: red;
  font-weight: bold;
}

.mistake-icon {
  color: red;
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.widget-title.widget-title-mistakes {
  background-image: linear-gradient(180deg, #f8a7a7 0%, #dcdcdc00 100%);
  color: #442b2bb0;
}

.mistake-flag {
  font-size: 1.5rem;
}

.mistake-description {
  color: #dababa;
}

.mistake-item {
  padding-left: 2rem;
  position: relative;
}

.mistake-item-icon {
  position: absolute;
  left: 0;
  top: 0.2rem;
  font-size: 1.3rem;
  color: red;
}

.mistake-context {
  color: #c1c1c1;
}

.mistake-context.collapsed {
  display: none;
}
</style>
