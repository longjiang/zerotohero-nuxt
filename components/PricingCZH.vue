<template>
  <div class="row">
    <div class="col-sm-12">
      <SocialHead
        :title="`Course Pricing | Chinese Zero To Hero`"
        description="No subscription required. Pay once, own the courses forever. Wallet Friendly Pricing."
        :image="`/img/courses/bundle-ultimate.jpg`"
      />
      <h3 class="mb-5 text-center">Pricing Chart</h3>
      <!-- <Sale class="mb-5 rounded" /> -->
      <div class="bg-success text-light p-3 text-center mb-5 rounded">
        <h4 class="mb-0">No subscriptions! 😊 Pay once, enjoy forever!</h4>
      </div>
      <p class="mb-3">
        <b>
          These are
          <em>not</em>
          subscriptions.
        </b>
        You pay once and you will own it for life. No recurring fees.
      </p>
      <p>
        Currency:
        <select v-if="rates" name id v-model="selectedCurrency" class="mb-3">
          <option
            v-for="(rate, symbol) in rates"
            :key="`currency-select-${symbol}`"
            :value="symbol"
            :selected="currency === symbol"
          >
            {{ symbol.replace("CNY", "RMB") }}
          </option>
        </select>
      </p>

      <table class="table table-bordered pricing-table" :key="key">
        <tbody class="table-hover">
          <tr>
            <td class="text-left text-light" data-bg-level="1">
              <a href="https://courses.chinesezerotohero.com/p/hsk-1-course">
                HSK 1
              </a>
            </td>
            <td class="text-center">
              <Price :price="price(29, { sale: false })"></Price>
            </td>
            <td class="text-center align-middle" rowspan="4">
              <a
                href="https://chinesezerotohero.teachable.com/p/hsk-1-4-bundle/"
                class="link-unstyled font-weight-bold"
              >
                HSK 1-4 Bundle
              </a>
              <Price :price="price(134, { sale: false })" :save="money(24)"></Price>
            </td>
            <td
              class="text-center align-middle"
              rowspan="11"
              style="max-width: 10rem"
            >
              <a
                href="https://chinesezerotohero.teachable.com/p/ultimate-bundle/"
                class="link-unstyled font-weight-bold"
              >
                Ultimate Bundle
              </a>
              <Price :price="price(219, { sale: false })" :save="money(67)"></Price>
              <p style="font-size: 0.8em">
                This bundles includes all of our paid courses with a total of
                <router-link :to="{ name: 'video-count' }">
                  2,146 videos
                </router-link>
                , on average each video costs about
                <Price
                  :price="
                    price(0.102, { sale: false, precision: 2, compact: true })
                  "
                  :compact="true"
                />.
              </p>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="2">
              <a href="https://courses.chinesezerotohero.com/p/hsk-2-course">
                HSK 2
              </a>
            </td>
            <td class="text-center">
              <Price :price="price(29, { sale: false })"></Price>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="3">
              <a href="https://courses.chinesezerotohero.com/p/hsk-3-course">
                HSK 3
              </a>
            </td>
            <td class="text-center">
              <Price :price="price(36, { sale: false })"></Price>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="4">
              <a href="https://courses.chinesezerotohero.com/p/hsk-4-course">
                HSK 4
              </a>
            </td>
            <td class="text-center">
              <Price :price="price(64, { sale: false })"></Price>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="5">
              <a href="https://courses.chinesezerotohero.com/p/hsk-5-course">
                HSK 5
              </a>
            </td>
            <td class="text-center">
              <Price :price="price(64, { sale: false })"></Price>
            </td>
            <td class="text-center align-middle" rowspan="5">
              <a
                href="https://chinesezerotohero.teachable.com/p/hsk-5-6-bundle/"
                class="link-unstyled font-weight-bold"
              >
                HSK 5-6 Bundle
              </a>
              <Price :price="price(109, { sale: false })" :save="money(48)"></Price>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="5">
              <a
                href="https://chinesezerotohero.teachable.com/p/expansion-courses"
              >
                HSK 5 Expansion Courses
              </a>
              <div style="font-weight: normal; margin-left: 1rem">
                6 comprehensible input courses for HSK 5
              </div>
            </td>
            <td class="text-center align-middle">
              <Price :price="price(9, { sale: false })"></Price>
              ea.
              <span>
                <b>FREE</b>
                with HSK 5
              </span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="6">
              <a href="https://courses.chinesezerotohero.com/p/hsk-6-course">
                HSK 6
              </a>
            </td>
            <td class="text-center">
              <Price :price="price(64, { sale: false })"></Price>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="6">
              <a
                href="https://chinesezerotohero.teachable.com/p/expansion-courses"
              >
                HSK 6 Expansion Courses
              </a>
              <div style="font-weight: normal; margin-left: 1rem">
                8 comprehensible input courses for HSK 6
              </div>
            </td>
            <td class="text-center align-middle">
              <Price :price="price(9, { sale: false })"></Price>
              ea.
              <span>
                <b>FREE</b>
                with HSK 6
              </span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" style="background-color: #0076ba">
              <a
                href="https://chinesezerotohero.teachable.com/p/path-to-fluency"
              >
                Path To Fluency
              </a>
              <div style="font-weight: normal; margin-left: 1rem">
                learning strategy course
              </div>
            </td>
            <td class="text-center">
              <Price :price="price(29, { sale: false })"></Price>
              <span>
                <b>FREE</b>
                with HSK 5 or HSK 6
              </span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="7-9">
              <a href="https://courses.chinesezerotohero.com/p/hsk-7-9-words">
                New HSK 7-9
              </a>
            </td>
            <td class="text-center" colspan="2">
              <Price :price="price(22, { sale: false })"></Price>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" style="background-color: #666">
              <a href="https://courses.chinesezerotohero.com/p/ci-shifu">
                Word Builder: Ci Shifu
              </a>
            </td>
            <td class="text-center" colspan="2">
              <Price :price="price(9, { sale: false })"></Price>
            </td>
          </tr>
          <tr>
            <td class="text-left text-light" style="background-color: #666">
              <a
                href="https://chinesezerotohero.teachable.com/p/phonetics-with-chinese-characteristics"
              >
                Phonetics with Chinese Characteristics
              </a>
            </td>
            <td class="text-center" colspan="3">
              <b>FREE</b>
            </td>
          </tr>
          <tr>
            <td class="text-left text-light" style="background-color: #666">
              <a
                href="https://chinesezerotohero.teachable.com/p/chinese-short-poems"
              >
                Learn Chinese with Poems
              </a>
            </td>
            <td class="text-center" colspan="3">
              <b>FREE</b>
            </td>
          </tr>
          <tr>
            <td class="text-left text-light" style="background-color: #666">
              <a
                href="https://chinesezerotohero.teachable.com/p/learn-chinese-with-songs"
              >
                Learn Chinese with Songs
              </a>
            </td>
            <td class="text-center" colspan="3">
              <b>FREE</b>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="mt-5">
        <b>VAT</b>
        applies to any merchant selling a product or service (including digital
        products like an online course) to a customer based in Europe. So if
        you're based in Europe, we are required to charge VAT on top of these
        prices.
      </p>
    </div>
  </div>
</template>

<script>
import fx from "money";
import accounting from "accounting";
import Sale from "@/components/Sale";
import axios from "axios";
import { CHINESE_ZERO_TO_HERO, logError } from '@/lib/utils'

export default {
  components: {
    Sale,
  },
  props: {
    currency: {
      default: "USD",
    },
  },
  data() {
    return {
      accounting,
      key: "USD",
      rates: undefined,
      selectedCurrency: this.currency,
    };
  },
  async created() {
    let response;
    try {
      // Load exchange rates data via AJAX:
      response = await axios.get(
        // NB: using Open Exchange Rates here, but you can use any source!
        "https://api.exchangerate.host/latest"
      );
    } catch (err) {
      logError(err);
    }
    if (response && response.data) {
      let data = response.data;
      // Check money.js has finished loading:
      this.rates = data.rates;
      this.key = this.currency;
      if (typeof fx !== "undefined" && fx.rates) {
        fx.rates = data.rates;
        fx.base = data.base;
      }
    }
  },
  mounted() {
    if (window) window.location = CHINESE_ZERO_TO_HERO + 'pricing/'
  },
  watch: {
    selectedCurrency() {
      this.$router.push({
        name: "pricing",
        params: { currency: this.selectedCurrency },
      });
    },
  },
  methods: {
    money(n, { precision = 0 } = {}) {
      let formatted;
      if (typeof this.rates !== "undefined") {
        try {
          let amount =
            Math.round(
              fx.convert(n, { from: "USD", to: this.currency }) *
                Math.pow(10, precision)
            ) / Math.pow(10, precision);
          formatted = accounting
            .formatMoney(amount, {
              symbol: this.currency,
              format: "%v %s",
              precision,
            })
            .replace("CNY", "RMB");
        } catch (err) {}
      }
      if (typeof formatted === "undefined") formatted = n + " USD";
      return formatted;
    },
    price(n, { sale, compact = false, precision = 0 } = {}) {
      let price;
      if (sale === true) {
        price = {
          price: this.money(n, {
            precision,
          }),
          salePrice: this.money(n * 0.7, { precision }),
        };
      } else {
        price = {
          price: this.money(n, {
            precision,
          }),
        };
      }
      return price;
    },
  },
};
</script>

<style lang="scss" scoped>
.pricing-table td:first-child,
.pricing-table th:first-child {
  font-weight: bold;
  max-width: 10rem;
}

.pricing-table td:first-child a,
.pricing-table td:first-child a:hover {
  color: white;
}
</style>