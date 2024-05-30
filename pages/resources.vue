<router>
  {
    path: '/:l1/:l2/resource/list/:topic?/:type?',
    props: true,
    meta: {
      title: 'Resources | Language Player',
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
  <div class="main pt-5 pb-5">
    <SocialHead
      v-if="resources[0]"
      :title="$t('{resources} Resources to Help You Learn {l2}', { resources: resources.length, l2: $t($l2.name) }) + ' | Language Player'"
      :description="`${resources.map((r) => r.title).join(', ')}`"
      :image="resources[0].thumbnail"
    />
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h3 class="mb-5 text-center">
            {{ $t("Resources for learning {l2}", { l2: $t($l2.name) }) }}
          </h3>
        </div>
      </div>
      <div class="w-100 text-center py-5" v-if="loading">
        <Loader
            key="rec-loader"
            :sticky="true"
            :message="
              $t('Loading...')
            "
          />
      </div>
      <div class="row" v-else>
        <div :class="{'col-sm-12  pr-4 mb-5': true, 'col-md-8': resources.length }">
          <ResourceList :resources="filteredResources" />
        </div>
        <div :class="{'col-sm-12': true, 'col-md-4': resources.length }" v-if="resources.length">
          <h6 class="text-center mb-4">{{ $t("Filter by Topic") }}</h6>
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
              {{ $t("All") }}
            </router-link>
            <router-link
              v-for="(topicName, topicValue) in filteredTopics"
              :key="`topic-${topicValue}`"
              :class="{
                'link-unstyled': true,
                'list-group-item': true,
                'list-group-item-action': topicValue === topic,
                active: topicValue === topic,
              }"
              :to="`/${$l1.code}/${$l2.code}/resource/list/${topicValue}/all`"
            >
              {{ $t(topicName) }} ({{ countTopic(topicValue) }})
            </router-link>
          </div>
          <h6 class="mt-4 mb-4 text-center">{{ $t("Filter by Type") }}</h6>
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
              {{ $t("All") }}
            </router-link>
            <router-link
              v-for="(typeName, typeValue) in filteredTypes"
              :key="`type-${typeValue}`"
              :class="{
                'link-unstyled': true,
                'list-group-item': true,
                'list-group-item-action': typeValue === type,
                active: typeValue === type,
              }"
              :to="`/${$l1.code}/${$l2.code}/resource/list/all/${typeValue}`"
            >
              {{ $t(typeName) }} ({{ countType(typeValue) }})
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ResourceList from "@/components/ResourceList";

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
      resources: [],
      loading: true,
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
  computed: {
    filteredResources() {
      return this.resources.filter((r) => {
        return (
          (this.topic === "all" || r.topic === this.topic) &&
          (this.type === "all" || r.type === this.type)
        );
      });
    },
    filteredTopics() {
      return Object.keys(this.topics)
        .filter(topic => this.countTopic(topic) > 0)
        .reduce((filteredTopics, topic) => {
          filteredTopics[topic] = this.topics[topic];
          return filteredTopics;
        }, {});
    },
    filteredTypes() {
      return Object.keys(this.types)
        .filter(type => this.countType(type) > 0)
        .reduce((filteredTypes, type) => {
          filteredTypes[type] = this.types[type];
          return filteredTypes;
        }, {});
    },
  },
  mounted() {
    this.fetchResources(); 
  },
  methods: {
    countTopic(topic) {
      return this.resources.filter((r) => r.topic === topic).length;
    },
    countType(type) {
      return this.resources.filter((r) => r.type === type).length;
    },
    async fetchResources() {
      this.loading = true;
      let filters = "";  // Build your filter string based on `topic` and `type`
      try {
        let response = await this.$directus.get(
          `items/resources?filter[l2][eq]=${this.$l2.id}${filters}&fields=*,thumbnail.*`
        );
        this.resources = response.data.data.map((resource) => {
          resource.thumbnail = resource.thumbnail.data.full_url;
          return resource;
        }) || [];
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        this.loading = false;
      }
    },
  }
};
</script>

<style></style>
