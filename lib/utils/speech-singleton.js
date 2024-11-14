class SpeechSingleton {
  constructor() {
    this.utterance = null;
    this.speaking = false;
    this.paused = false;
    this.voice = null;
  }

  init(langCode) {
    // No need to initialize anything with the native Web Speech API.
  }

  getVoices(langCode = undefined) {
    const speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis) return [];
    return speechSynthesis.getVoices().filter(voice => 
      (!langCode || voice.lang.startsWith(langCode)) 
    );
  }

  setVoice(voice) {
    if (typeof voice === "string") {
      voice = this.getVoices().find(v => v.name === voice);
    }
    this.voice = voice || null; // If voice is not found, it will be set to null
  }

  cleanup() {
    this.paused = false;
    this.speaking = false;
    this.utterance = null;
  }

  speak({ l2, text, voice, rate = 1 }) {
    return new Promise((resolve, reject) => {
      const speechSynthesis = window.speechSynthesis;
      // If voice is passed as a string, try to find the voice object
      if (voice && typeof voice === "string") {
        voice = this.getVoices(l2.code).find(v => v.name === voice);
      }
      if (!voice) {
        voice = this.voice;
        if (!voice) {
          const voices = this.getVoices(l2.code);
          if (!voices.length) {
            reject(new Error("SpeechSingleton: No suitable voice found"));
            return;
          }
          voice = voices[0];
        }
      }

      // Check if it's currently speaking and cancel the ongoing speech
      if (this.speaking || speechSynthesis.speaking || speechSynthesis.pending || speechSynthesis.paused) {
        this.stop(); // Make sure we clear any ongoing utterances
      }

      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.lang = l2.code;
      this.utterance.voice = voice;
      this.utterance.rate = rate;

      this.utterance.onstart = () => {
        this.speaking = true;
        this.paused = false;
      };

      this.utterance.onend = () => {
        this.cleanup();
        resolve();
      };

      this.utterance.onerror = (event) => {
        console.error("SpeechSingleton: SpeechSynthesisUtterance.onerror", event.error);
        this.cleanup();
        resolve();
      };

      try {
        speechSynthesis.speak(this.utterance);
      } catch (e) {
        console.error("SpeechSingleton: error speaking", e);
        this.cleanup();
        resolve();
      }

    });
  }

  pause() {
    if (this.speaking && !this.paused) {
      window.speechSynthesis.pause();
      this.speaking = false;
      this.paused = true;
    }
  }

  resume() {
    if (this.paused) {
      try {
        window.speechSynthesis.resume();
        this.speaking = true;
        this.paused = false;
      } catch (e) {
        console.error("SpeechSingleton: error resuming", e);
      }
    }
  }

  stop() {
    try {
      window.speechSynthesis.cancel();
      this.cleanup();
    } catch (e) {
      console.error("SpeechSingleton: error stopping", e);
    }
  }
}

let instance;

export default {
  get instance() {
    if (!instance) {
      instance = new SpeechSingleton();
    }
    return instance;
  },
};
