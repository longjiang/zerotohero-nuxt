<template>
  <div id="compare" v-if="aHtml && bHtml">
    <TButton @click="showDiff = !showDiff">Compare</TButton>
    <div class="mt-10">
      <div class="grid grid-cols-2 gap-2" v-if="!showDiff">
        <div v-html="aHtml"></div>
        <div v-html="bHtml"></div>
      </div>
      <div v-if="showDiff" v-html="diffHtml"></div>
    </div>
  </div>
</template>

<script>
import Wol from "@/lib/jw/Wol";
import { parse } from "node-html-parser";
export default {
  props: ["aUrl", "bUrl"],
  data() {
    return {
      aHtml: undefined,
      bHtml: undefined,
      diffHtml: undefined,
      showDiff: false,
    };
  },
  async fetch() {
    let a = await Wol.getArticle(this.aUrl);
    this.aHtml = a.content;
    let b = await Wol.getArticle(this.bUrl);
    this.bHtml = b.content;
    let aText = parse(this.aHtml).innerText;
    let bText = parse(this.bHtml).innerText;
    this.diffHtml = this.compare("你好", "你不好");
  },
  methods: {
    compare(aText, bText) {
      var map = []; // map[0] = 1 means aText[0] is found at bText[1]
      var lastSeen = {};
      for (var i = 0; i < aText.length; i++) {
        const char = aText[i];
        var bIndex = bText.indexOf(char);
        if (char in lastSeen) {
          const offset = lastSeen[char] + 1;
          const index = bText.slice(offset).indexOf(char);
          if (index !== -1) {
            bIndex = index + offset;
          } else {
            bIndex = -1;
          }
        }
        if (bIndex !== -1) {
          lastSeen[char] = bIndex;
        }
        map.push({ a: i, b: bIndex, char: char });
      }
      const changeMap = this.findLongestSequence(map);
      let segs = [];

      // b insert in front
      for (var j = 0; j < changeMap[0].b; j++) {
        segs.push({
          text: bText[j],
          type: "insert",
        });
      }

      for (var i = 0; i < changeMap.length; i++) {
        let temp = [];
        // same
        temp.push({
          text: aText[changeMap[i].a],
          type: "same",
          position: i,
        });

        if (changeMap[i + 1]) {
          // a delete
          const deletesAfter = changeMap[i + 1].a - changeMap[i].a - 1;

          // b insert
          const insertsAfter = changeMap[i + 1].b - changeMap[i].b - 1;

          for (var j = 0; j < deletesAfter; j++) {
            const a = aText[changeMap[i].a + j + 1];
            const b = bText[changeMap[i].b + j + 1];
            if (a !== b) {
              temp.push({
                text: aText[changeMap[i].a + j + 1],
                type: "delete",
                position: changeMap[i].a + j + 1,
              });
            }
          }
          for (var j = 0; j < insertsAfter; j++) {
            const a = aText[changeMap[i].a + j + 1];
            const b = bText[changeMap[i].b + j + 1];
            temp.push({
              text: bText[changeMap[i].b + j + 1],
              type: a !== b ? "insert" : "same",
              position: changeMap[i].a + j + 1,
            });
          }
        }
        segs = segs.concat(
          temp.sort(function (a, b) {
            return a.position - b.position;
          })
        );
      }

      // b insert at the end
      const insertsAfter = bText.length - changeMap[changeMap.length - 1].b - 1;
      for (var j = 0; j < insertsAfter; j++) {
        segs.push({
          text: bText[changeMap[changeMap.length - 1].b + j + 1],
          type: "insert",
        });
      }

      let html = "";
      segs.forEach(function (seg) {
        html += `<span class="${seg.type}">${seg.text}</span>`;
      });
      return html;
    },

    findLongestSequence(map) {
      if (map.length === 1) {
        if (map[0].b === -1) {
          return [];
        } else {
          return [map[0]];
        }
      } else {
        if (map[0].b === -1 || map[1].b < map[0].b) {
          return this.findLongestSequence(map.slice(1));
        } else {
          var sequence = [map[0]];
          for (var i = 0; i < map.length - 1; i++) {
            // If the next one has a bigger b
            if (sequence[sequence.length - 1].b < map[i + 1].b) {
              // if next one is +1, use next
              if (
                sequence[sequence.length - 1].b + 1 === map[i + 1].b ||
                map.length === i + 2
              ) {
                if (map[i + 1].b !== -1) sequence.push(map[i + 1]);
              } else {
                // if there is a bigger jump, try options
                var a = this.findLongestSequence(map.slice(i + 1));
                var b = this.findLongestSequence(map.slice(i + 2));
                if (!a[0]) {
                  a = [];
                } else {
                  a = a[0].b > sequence[sequence.length - 1].b ? a : [];
                }
                if (!b[0]) {
                  b = [];
                } else {
                  b = b[0].b > sequence[sequence.length - 1].b ? b : [];
                }
                const rest = a.length > b.length ? a : b;
                sequence = sequence.concat(rest);
                return sequence;
              }
            }
          }
          return sequence;
        }
      }
    },
  },
};
</script>

<style>
.delete {
  position: relative;
}

.delete::before {
  content: "";
  border-top-style: double;
  border-top-color: #dc3545;
  border-top-width: 4px;
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0.62em;
  left: 0;
  text-decoration: line-through;
}

.insert {
  color: #dc3545;
  font-family: "HanziPen SC", serif;
}

:not(.insert) + .insert {
  margin-left: 0.2rem;
}

.insert + :not(.insert) {
  margin-left: 0.2rem;
}
</style>