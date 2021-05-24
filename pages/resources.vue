<router>
  {
    path: '/:l1/:l2/resource/list/:topic?/:type?',
    props: true,
    meta: {
      title: 'Resources | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'User voted Chinese-learning resources.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main mt-5 mb-5">
    <SocialHead
      v-if="resources[0]"
      :title="`${resources.length} Resources to Help You Learn ${$l2.name} | ${$l2.name} Zero to Hero`"
      :description="`${resources.map((r) => r.title).join(', ')}`"
      :image="resources[0].thumbnail"
    />
    <div class="container">
      <div class="row">
        <div class="col-sm-12 col-md-8 pr-4 mb-5">
          <h3 class="mb-5">Resources for learning {{ $l2.name }}</h3>
          <ResourceList :resources="resources" />
        </div>
        <div class="col-sm-12 col-md-4">
          <h6 class="text-center mb-4">Topic</h6>
          <div class="list-group">
            <router-link
              :class="{
                'link-unstyled': true,
                'list-group-item': true,
                'list-group-item-action': topic === 'all',
                active: topic === 'all',
              }"
              :to="`/${$l1.code}/${$l2.code}/resource/list/all/${type}`"
            >
              All
            </router-link>
            <router-link
              v-for="(topicName, topicValue) in topics"
              :class="{
                'link-unstyled': true,
                'list-group-item': true,
                'list-group-item-action': topicValue === topic,
                active: topicValue === topic,
              }"
              :to="`/${$l1.code}/${$l2.code}/resource/list/${topicValue}/all`"
            >
              {{ topicName }}
            </router-link>
          </div>
          <h6 class="mt-4 mb-4 text-center">Type</h6>
          <div class="list-group">
            <router-link
              :class="{
                'link-unstyled': true,
                'list-group-item': true,
                'list-group-item-action': type === 'all',
                active: type === 'all',
              }"
              :to="`/${$l1.code}/${$l2.code}/resource/list/${topic}/all`"
            >
              All
            </router-link>
            <router-link
              v-for="(typeName, typeValue) in types"
              :class="{
                'link-unstyled': true,
                'list-group-item': true,
                'list-group-item-action': typeValue === type,
                active: typeValue === type,
              }"
              :to="`/${$l1.code}/${$l2.code}/resource/list/all/${typeValue}`"
            >
              {{ typeName }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import ResourceList from "@/components/ResourceList";
import axios from "axios";

export default {
  components: {
    ResourceList,
  },
  props: {
    topic: {
      default: "all",
    },
    type: {
      default: "all",
    },
  },
  data() {
    return {
      Config,
      Helper,
      resources: [],
      types: {
        av: "Audio-Visual",
        community: "Community",
        courses: "Courses",
        games: "Games",
        lists: "Lists of Resources",
        music: "Music",
        reading: "Reading",
        software: "Software",
        textbooks: "Textbooks",
        multiple: "Miscellaneous",
      },
      topics: {
        strategy: "Learning Strategy",
        characters: "Characters",
        culture: "Culture",
        grammar: "Grammar",
        vocabulary: "Vocabulary",
        multiple: "Miscellaneous",
      },
    };
  },
  async fetch() {
    let canonical = `/${this.$l1.code}/${this.$l2.code}/resource/list/${this.topic}/${this.type}`;
    let filters = "";
    if (this.$router.currentRoute.path !== canonical) {
      this.$router.push({ path: canonical });
    } else {
      if (this.topic !== "all") {
        filters += "&filter[topic][eq]=" + this.topic;
      }
      if (this.type !== "all") {
        filters += "&filter[type][eq]=" + this.type;
      }
      let response = await axios.get(
        `${Config.wiki}items/resources?filter[l2][eq]=${this.$l2.id}${filters}&fields=*,thumbnail.*`
      );
      this.resources =
        response.data.data.map((resource) => {
          resource.thumbnail = resource.thumbnail.data.full_url;
          return resource;
        }) || [];
    }
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
};
</script>

<style></style>
