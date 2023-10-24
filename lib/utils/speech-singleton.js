import Speech from "speak-tts";

class SpeechSingleton {
  constructor() {
    this.speech = new Speech();
    this.utterance = null;
    this.speaking = false;
    this.paused = false;
  }

  async init(langCode) {
    await this.speech.init({ lang: langCode });
  }

  getVoices(langCode) {
    let speechSynthesis = window?.speechSynthesis;
    if (!speechSynthesis) return;
    let voices = speechSynthesis
      .getVoices()
      .filter(
        (voice) =>
          voice.lang.startsWith(langCode) &&
          !voice.name.includes("Siri")
      );
    return voices;
  }

  cleanup() {
      this.paused = false;
      this.speaking = false;
      this.utterance = null;
  }


  speak({l2, text, voice, rate = 1}) {
    return new Promise((resolve, reject) => {
      if (window && window.speechSynthesis) {
        let speechSynthesis = window.speechSynthesis;
  
        if (speechSynthesis.paused) {
          if (this.utterance) {
            this.utterance.onend = undefined;
          }
          speechSynthesis.cancel();
        }
  
        if (!voice) {
          const voices = this.getVoices(l2.code);
          voice = voices[0];
        }
  
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.rate = rate;
        this.utterance.voice = voice;
  
        // Handle the end of speech
        this.utterance.onend = () => {
          this.cleanup();
          resolve();  // Resolve the promise when speaking is done
        };
  
        // Handle any errors that occur during speech
        this.utterance.onerror = (event) => {
          this.cleanup();
          reject(event.error);  // Reject the promise with the error
        };
        
        this.speaking = true;
        this.paused = false;
        speechSynthesis.speak(this.utterance);
      } else {
        reject(new Error("Speech synthesis not supported"));
      }
    });
  }

  pause() {
    if (window && window.speechSynthesis && this.speaking) {
      window.speechSynthesis.pause();
      this.speaking = false;  // Update the speaking flag
      this.paused = true;
    }
  }

  resume() {
    if (window && window.speechSynthesis && !this.speaking) {
      window.speechSynthesis.resume();
      this.paused = false;
      this.speaking = true;  // Update the speaking flag
    }
  }

  stop() {
    if (this.utterance) {
      window.speechSynthesis.cancel(); // This will stop and clear all utterances
      this.cleanup();
    }
  }


}

let instance;

// Export a getter function to get the singleton instance.
export default {
  get instance() {
    if (!instance) {
      instance = new SpeechSingleton();
    }
    return instance;
  }
};
