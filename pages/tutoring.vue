<router>
  {
    path: '/:l1/:l2/tutoring/:level?',
    props: true,
    meta: {
      title: 'Tutoring Kit | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Tools to help you get the most out of your online tutoring lessons.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-5 pb-5">
    <SocialHead
      :title="`Tutoring Kit | ${$l2.name} Zero to Hero`"
      :description="`A resource kit to help you get most out of your ${$l2.name} tutoring lessons, including topics for descussion and activities!`"
    />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="mb-5">Online Tutoring Lesson Kit</h3>
          <div>
            <p>
              <b>About this kit:</b>
              When you are having a lesson with either a free language exchange
              partner or a paid tutor through services such as
              <a href="https://www.tandem.net/">Tandem</a>
              ,
              <a href="https://amikumu.com/">Amikumu</a>
              ,
              <a href="https://www.italki.com/">iTalki</a>
              ,
              <a href="https://www.hellotalk.com/">HelloTalk</a>
              or
              <a href="https://preply.com/">Preply</a>
              , you can make use of this lesson kit to give structure and
              content to your lesson.
            </p>
            <p>
              The kit is based around the Cambridge
              <em>Touchstone</em>
              and
              <em>Viewpoint</em>
              series of American English textbooks.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="tabs text-center">
            <router-link
              :to="`/${$l1.code}/${$l2.code}/tutoring/`"
              class="link-unstyled tab bg-dark"
            >
              All
            </router-link>
            <template v-if="$l2.code === 'zh'">
              <router-link
                v-for="n in 7"
                :key="`level-tab-${n}`"
                :to="`/${$l1.code}/${$l2.code}/tutoring/${n}`"
                class="tab link-unstyled"
                :data-bg-level="n < 7 ? n : 'outside'"
              >
                {{ Helper.level(n, $l2).name }}
              </router-link>
            </template>
            <template v-else>
              <router-link
                v-for="n in 7"
                :key="`level-tab-${n}`"
                :to="`/${$l1.code}/${$l2.code}/tutoring/${n}`"
                class="tab link-unstyled"
                :data-bg-level="Helper.level(n).name.replace('-', '')"
              >
                {{ Helper.level(n, $l2).name }}
              </router-link>
            </template>
            <div
              v-if="$l2.code === 'zh'"
              style="height: 0.5rem"
              :class="level ? `bg-level${level}` : `bg-dark`"
            ></div>
            <div
              v-else
              style="height: 0.5rem"
              :class="
                level
                  ? `bg-level${Helper.level(level).name.replace('-', '')}`
                  : `bg-dark`
              "
            ></div>
          </div>
          <table
            v-if="lessons && lessons.length > 0"
            class="table table-responsive lessons-table"
          >
            <thead>
              <tr>
                <th class="text-center">ID</th>
                <th>Topic</th>
                <th>Read Together</th>
                <th>Free Talk</th>
                <th>Writing</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in lessons"
                :class="{
                  'lessons-table-row': true,
                  hidden: !(level === undefined || row.level === level),
                }"
                @click="goto(row.id)"
              >
                <td class="text-center">{{ row.id }}</td>
                <td>{{ row.name }}</td>
                <td v-html="row.reading || ''"></td>
                <td
                  v-html="row.free_talk || '' + '<p>• Describe a picture</p>'"
                ></td>
                <td v-html="row.writing || ''"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import axios from 'axios'

export default {
  props: ["level"],
  data() {
    return {
      Helper,
      lessons: undefined,
    };
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  async created() {
    let response = await this.$authios.get(
      `${Config.wiki}items/tutoring_kit?fields=id,name,reading,free_talk,writing,level`
    );
    this.lessons = response.data.data || [];
  },
  methods: {
    goto(id) {
      this.$router.push({
        path: `/${this.$l1.code}/${this.$l2.code}/tutoring/lesson/${id}`,
      });
    },
  },
};
</script>

<style>
.lessons-table-row {
  cursor: pointer;
}
.lessons-table-row:hover {
  background-color: #eee;
}
</style>