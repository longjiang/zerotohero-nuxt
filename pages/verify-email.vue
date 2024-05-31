<template>
  <div :style="`min-height: 100vh; ${backgroundImage
    ? 'background-image: url(' +
    backgroundImage +
    '); background-size: cover; background-position: center;'
    : ''
    }`">
    <div class="container">
      <div class="row">
        <div class="col-sm-12 pt-5">
          <div class="login-page">
            <div class="text-center skin-light">
              <h5 class="mb-4">{{ $tb('Verify Your Email') }}</h5>
              <div v-if="sending">
                <b-spinner small />
                <p>{{ $tb('Sending verification code...') }}</p>
              </div>
              <div v-else>
                <p>{{ $tb('A verification email has been sent to this email address:') }}</p>
                <p><strong>{{ form.email }}</strong></p>
                <p>{{ $tb('Please check your email and enter the verification code below.') }}</p>
                <b-form @submit.prevent="onSubmit" v-if="show">
                  <b-form-group id="input-group-1" label-for="code">
                    <b-form-input id="code" v-model="form.code" type="text" :placeholder="$tb('Verification Code')"
                      required></b-form-input>
                  </b-form-group>
                  <div class="text-left my-2 skin-light">
                    <!-- Add a form that asks the user how they heard about us. Give them the options: Google Search, Ads, Word of Mouth, HSK Courses, YouTube, Instagram, Other (Pleae specify) -->
                    <b-form-group id="input-group-2" label-for="acquisition_source">
                      <b-form-select 
                        id="acquisition_source" 
                        v-model="form.acquisition_source" 
                        :options="translatedAcquisitionOptions"
                        required>
                      </b-form-select>
                    </b-form-group>
                    <!-- If the user selects "Other", show an input field where they can specify how they heard about us. -->
                    <b-form-group v-if="form.acquisition_source === 'other'" id="input-group-3" label-for="acquisition_other">
                      <b-form-input id="acquisition_other" v-model="form.acquisition_details" type="text" :placeholder="$tb('Please specify')"
                        required></b-form-input>
                    </b-form-group>
                  </div>
                  <div class="text-center">
                    <b-button type="submit" variant="primary" :disabled="verifying" class="w-100">
                      <b-spinner small v-if="verifying" />
                      <span v-else>{{ $tb("Verify") }}</span>
                    </b-button>

                  </div>
                  <div class="text-center">
                    <b-button variant="link" class="text-primary" @click="sendCode">
                      <b-spinner small v-if="sending" />
                      <span v-else>{{ $tb("Resend Code") }}</span>
                    </b-button>
                  </div>
                  <!-- If the user has trouble verifying their email, ask them to contact support. Precompose a message including their email address. -->
                  <div class="text-center mt-3 mb-0"><small>
                      <p class="mb-0">{{ $tb('Having trouble?') }} <a
                          :href="`mailto:jon.long@zerotohero.ca?subject=Email Verification Issue&body=Hello, I am having trouble verifying my email address. My email address is: ${form.email}`"
                          class="text-primary">{{ $tb('Contact Us') }}</a></p>
                    </small></div>
                </b-form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { background, logError, PYTHON_SERVER } from "@/lib/utils";

export default {
  data() {
    return {
      form: {
        email: "",
        code: "",
        acquisition_source: null,
        acquisition_details: null,
      },
      show: true,
      verifying: false,
      sending: false,
    };
  },
  async mounted() {
    let email = decodeURIComponent(this.$route.query.email);
    let code = this.$route.query.code;
    if (email) {
      this.form.email = email;
    }
    if (code) {
      this.form.code = code;
    } else {
      // Send a verification email
      this.sendCode();
    }
    this.show = true;
  },
  computed: {
    backgroundImage() {
      return background(this.$l2);
    },
    translatedAcquisitionOptions() {
      return [
        { value: null, text: this.$t('How did you hear about us?') },
        { value: 'word_of_mouth', text: this.$t('Word of Mouth') },
        { value: 'instagram', text: this.$t('Instagram') },
        { value: 'bilibili', text: this.$t('Bilibili') },
        { value: 'google_ads', text: this.$tb('Online Ads') },
        { value: 'hsk_courses', text: this.$t('HSK Courses') },
        { value: 'app_store', text: this.$t('App Store') },
        { value: 'google_play', text: this.$tb('Google Play') },
        { value: 'google_search', text: this.$t('Web Search') },
        { value: 'youtube', text: this.$t('YouTube') },
        { value: 'other', text: this.$t('Other (Please specify)') },
      ];
    },
  },
  methods: {
    async onSubmit(event) {
      try {
        this.verifying = true;
        let res = await this.$axios.post(`${PYTHON_SERVER}/verification_email/verify`, this.form);

        if (res.data.status = 'success') {
          this.$toast.success(this.$tb('Email verified. You can now log in.'), { duration: 5000 });
          this.$gtag.event('user_register')
          // Log out the user
          await this.$auth.logout();
          this.$router.push({ name: 'login' });
        } else {
          this.$toast.error(this.$tb(res.data.message), { duration: 5000 });
        }

      } catch (error) {
        logError(error);
        this.$toast.error(this.$tb('Failed to verify email.'), { duration: 5000 });
      } finally {
        this.verifying = false;
      }
    },
    // Send a verification email
    async sendCode() {
      this.sending = true;
      try {
        await this.$axios.post(`${PYTHON_SERVER}/verification_email`, {
          email: this.form.email,
        });
        this.$toast.success(this.$tb('Verification code sent.'), { duration: 5000 });
      } catch (error) {
        logError(error);
        this.$toast.error(this.$tb('Failed to send verification code.'), { duration: 5000 });
      } finally {
        this.sending = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.login-page {
  margin: 2rem auto 5rem auto;
  padding: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  background: #ffffffbb;
  max-width: 20rem;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.483);
  backdrop-filter: blur(20px);
}
</style>
