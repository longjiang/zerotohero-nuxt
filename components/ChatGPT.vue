<template>
  <div>
    <div v-for="(message, index) in messages" :key="index" class="mb-2">
      <div v-if="message.sender === 'user'" class="d-flex">
        <b style="flex: 0 0 1.5rem">{{ $t("Q:") }}</b>
        <b style="flex: 1">{{ message.text }}</b>
      </div>
      <div v-if="message.sender === 'bot'" class="d-flex">
        <span style="flex: 0 0 1.5rem">{{ $t("A:") }}</span>
        <div style="flex: 1">
          <div
            v-for="(line, index) in message.text.split('\n')"
            :key="`gpt-respnose-${index}`"
            class="mb-2"
          >
            <Annotate :buttons="true"><span>{{ line }}</span></Annotate>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-3 text-center" v-if="thinking">
      <Loader :sticky="true" message="Getting response from ChatGPT..." />
    </div>
    <h6 v-if="!initialMessage">{{ $t('Ask ChatGPT:') }}</h6>
    <input
      type="text"
      v-model="newMessage"
      @keydown.enter="sendMessage(newMessage)"
      v-if="!initialMessage"
    />
  </div>
</template>

<script>
import OpenAI from "openai-api";

export default {
  props: {
    initialMessage: String,
  },
  data() {
    return {
      messages: [],
      newMessage: "",
      openai: new OpenAI("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"),
      prompt: this.initialMessage,
      thinking: false,
    };
  },
  mounted() {
    if (this.initialMessage) this.sendMessage(this.initialMessage);
  },
  methods: {
    async sendMessage(text) {
      this.thinking = true;
      const message = {
        text: text || this.newMessage,
        sender: "user",
      };
      this.messages.push(message);
      this.newMessage = "";

      try {
        const prompt = typeof message.text === "string" ? message.text : "";
        const response = await this.openai.complete({
          engine: "text-davinci-003",
          prompt,
          max_tokens: 500,
          n: 1,
          stop: undefined,
          temperature: 0.7,
        });
        const botMessage = {
          text: response.data.choices[0].text.trim(),
          sender: "bot",
        };
        this.messages.push(botMessage);
      } catch (error) {
        console.error(error);
      }
      this.thinking = false;
    },
  },
};
</script>