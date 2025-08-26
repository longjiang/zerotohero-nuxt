<!-- ChatGPT.vue -->
<!-- This is a Pro feature. If the user is not Pro, prompt them to upgrade by displaying the <YouNeedPro /> component, similar to the implementation in SyncedTranscript and SearchSubsComp components. -->
<template>
  <div>
    <YouNeedPro v-if="!pro" 
      :showLogo="false"
      :message="
        $t('To use AI features, upgrade to a Pro account.')
      "
    />
    <div v-else>
      <div>
        <div v-for="(message, index) in messages" :key="index" class="my-2">
          <div v-if="message.sender === 'user' && showPrompt">
            <div class="d-flex" v-if="showPrompt">
              <b style="flex: 0 0 1.5rem">{{ $t("Q:") }}</b>
              <b style="flex: 1">{{ message.text }}</b>
            </div>

            <div v-if="errorMessage" class="mt-3 alert alert-warning">
              {{ errorMessage }}
            </div>
          </div>
          <div v-if="message.sender === 'bot' && typeof message.text === 'string'" class="d-flex">
            <span style="flex: 0 0 1.5rem" v-if="showPrompt">{{ $t("A:") }}</span>
            <div style="flex: 1">
              <div v-for="(line, index) in message.text.split('\n')" :key="`gpt-respnose-${index}`" class="mb-2">
                <div v-html="Marked(line.trim())" />
              </div>
              <div class="text-center mb-2">
                <span @click="resendMessage(messages[index - 1])" class="btn btn-unstyled text-success px-1" v-if="showRegenerate">
                  {{ $t("Regenerate") }}
                </span>
                <router-link :to="{
                  name: 'l1-l2-reader',
                  params: {
                    method: 'md',
                    arg: message.text.replace('\n', '\n\n'),
                  },
                }" class="btn btn-unstyled text-success px-1"  v-if="showOpenInReader">
                  {{ $t("Open in Reader") }}
                </router-link>
                <a v-if="showOpenInChatGPT || showFollowUp" :href="`https://chat.openai.com/?q=${encodeURIComponent(messages[index-1].text)}`" target="_blank" class="btn btn-unstyled text-success px-1">
                  {{ $t("Open in ChatGPT") }}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="my-5 text-center" v-if="thinking">
          <Loader :sticky="true" message="Getting response from ChatGPT..." />
        </div>
        <h6 v-if="!initialMessages[0]">{{ $t("Ask ChatGPT:") }}</h6>
        <input type="text" v-model="newMessage" @keydown.enter="sendMessage(newMessage)" v-if="!initialMessages[0]" />
      </div>
    </div>
  </div>
</template>

<script>
import { timeout, PYTHON_SERVER } from "../lib/utils";
import Vue from "vue";
import Marked from "marked";
import YouNeedPro from "./YouNeedPro.vue";

export default {
  components: { YouNeedPro },
  props: {
    forcePro: {
      type: Boolean,
      default: false,
    },
    initialMessages: {
      default: [], // of Strings
    },
    showPrompt: {
      default: true, // Whether or not to show the question prompt
    },
    showRegenerate: {
      default: true, // Whether or not to show the action buttons
    },
    showOpenInReader: {
      default: true, // Whether or not to show the open in reader button
    },
    showOpenInChatGPT: {
      default: true, // Whether or not to show the open in ChatGPT button
    },
    showFollowUp: {
      default: true, // Whether or not to show the follow-up button, even if showActions is false
    },
  },
  data() {
    return {
      messages: [],
      newMessage: "",
      thinking: false,
      watcherActive: false,
      dictionary: undefined,
      errorMessage: undefined,
      maxTokens: 150,
    };
  },
  computed: {
    pro() {
      // Pro if forcePro is set, or the Vuex subscriptions are active
      return (
        this.forcePro ||
        (this.$store && this.$store.state && this.$store.state.subscriptions && this.$store.state.subscriptions.active)
      );
    },
  },
  async mounted() {
    for (let message of this.initialMessages) {
      await this.sendMessage(message);
    }
    await timeout(2000);
    this.watcherActive = true;
  },
  methods: {
    Marked,
    async getCompletion(prompt, cache = true) {
      prompt = prompt + ` (Keep the entire reponse under ${this.maxTokens} words)`;
      this.thinking = true;
      try {
        // Post to the `{PYTHON_SERVER}chatgpt` endpoint
        const response = await axios.post(`${PYTHON_SERVER}chatgpt`, {
          prompt,
          cache
        });
        
        this.thinking = false;
        return {
          text: response.data.response,
          sender: "bot",
        };
      } catch (error) {
        this.thinking = false;
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          this.errorMessage = `Error from ChatGPT API: ${error.response.data.error.message}`;
          return { text: error.response.data.error, sender: "bot" };
        } else {
          this.errorMessage = `Error from ChatGPT API: ${error.message}`;
          return { text: error.message, sender: "bot" };
        }
      }
    },
    async resendMessage(message) {

      let messageIndex = this.messages.findIndex(
        (m) => m.text === message.text
      );

      let botMessage = this.messages[messageIndex + 1];

      if (botMessage) {
        Vue.set(botMessage, "text", "");
        let newBotMessage = await this.getCompletion(message.text, false);
        Vue.set(this.messages, messageIndex + 1, newBotMessage);
      }
    },
    async sendMessage(text) {

      const message = {
        text: text || this.newMessage,
        sender: "user",
      };
      this.messages.push(message);
      this.newMessage = "";

      let botMessage = await this.getCompletion(message.text, true);
      this.messages.push(botMessage);
    },
  },
};
</script>
