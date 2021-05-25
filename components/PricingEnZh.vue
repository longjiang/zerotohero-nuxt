<template>
  <div class="row">
    <div class="col-sm-12">
      <SocialHead
        :title="`Course Pricing | Chinese Zero To Hero`"
        description="No subscription required. Pay once, own the courses forever. Wallet Friendly Pricing."
        :image="`/img/courses/bundle-ultimate.jpg`"
      />
      <h1 class="mb-5">Pricing Chart</h1>
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
        <select v-if="rates" name id v-model="currency" class="mb-3">
          <option
            v-for="(rate, symbol) in rates"
            :value="symbol"
            :selected="currency === symbol"
          >
            {{ symbol.replace("CNY", "RMB") }}
          </option>
        </select>
      </p>

      <table class="table table-bordered pricing-table" :key="key">
        <thead>
          <tr class="table-secondary">
            <th class="text-left">Course</th>
            <th class="text-center">Single</th>
            <th class="text-center">Bundle</th>
            <th class="text-center">Course Bundle</th>
          </tr>
        </thead>
        <tbody class="table-hover">
          <tr>
            <td class="text-left text-light" data-bg-level="1">
              <a href="https://courses.chinesezerotohero.com/p/hsk-1-course">
                HSK 1
              </a>
            </td>
            <td class="text-center">
              <span v-html="price(29, { sale: false })"></span>
            </td>
            <td class="text-center align-middle" rowspan="4">
              <span v-html="price(134, { sale: false })"></span>
              <br />
              <span style="color: rgb(26, 148, 6); font-size: 12px">
                Save {{ money(24) }}
              </span>
            </td>
            <td class="text-center align-middle" rowspan="9">
              <span v-html="price(219, { sale: false })"></span>
              <br />
              <span style="color: rgb(26, 148, 6); font-size: 12px">
                Save {{ money(67) }}
              </span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="2">
              <a href="https://courses.chinesezerotohero.com/p/hsk-2-course">
                HSK 2
              </a>
            </td>
            <td class="text-center">
              <span v-html="price(29, { sale: false })"></span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="3">
              <a href="https://courses.chinesezerotohero.com/p/hsk-3-course">
                HSK 3
              </a>
            </td>
            <td class="text-center">
              <span v-html="price(36, { sale: false })"></span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="4">
              <a href="https://courses.chinesezerotohero.com/p/hsk-4-course">
                HSK 4
              </a>
            </td>
            <td class="text-center">
              <span v-html="price(64, { sale: false })"></span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="5">
              <a href="https://courses.chinesezerotohero.com/p/hsk-5-course">
                HSK 5
              </a>
              <br />
            </td>
            <td class="text-center">
              <span v-html="price(64, { sale: false })"></span>
            </td>
            <td class="text-center align-middle" rowspan="5">
              <span v-html="price(109, { sale: false })"></span>
              <br />
              <span style="color: rgb(26, 148, 6); font-size: 12px">
                Save {{ money(48) }}
              </span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="5">
              <a
                href="https://chinesezerotohero.teachable.com/p/expansion-courses"
              >
                HSK 5 Expansion Courses
              </a>
              <br />
              <div style="font-weight: normal; margin-left: 1rem">
                6 comprehensible input courses for HSK 5
              </div>
            </td>
            <td class="text-center align-middle">
              <span v-html="price(9, { sale: false })"></span>
              ea.
              <br />
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
              <span v-html="price(64, { sale: false })"></span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" data-bg-level="6">
              <a
                href="https://chinesezerotohero.teachable.com/p/expansion-courses"
              >
                HSK 6 Expansion Courses
              </a>
              <br />
              <div style="font-weight: normal; margin-left: 1rem">
                8 comprehensible input courses for HSK 6
              </div>
            </td>
            <td class="text-center align-middle">
              <span v-html="price(9, { sale: false })"></span>
              ea.
              <br />
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
              <span v-html="price(29, { sale: false })"></span>
              <br />
              <span>
                <b>FREE</b>
                with HSK 5 or HSK 6
              </span>
            </td>
          </tr>

          <tr>
            <td class="text-left text-light" style="background-color: #666">
              <a href="https://courses.chinesezerotohero.com/p/ci-shifu">
                Word Builder: Ci Shifu
              </a>
            </td>
            <td class="text-center" colspan="3">
              <span v-html="price(9, { sale: false })"></span>
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
      <p>
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
    };
  },
  methods: {
    money(n) {
      if (this.rates) {
        return accounting
          .formatMoney(
            Math.round(fx.convert(n, { from: "USD", to: this.currency })),
            { symbol: this.currency, format: "%v %s", precision: 0 }
          )
          .replace("CNY", "RMB");
      } else {
        return n + " USD";
      }
    },
    price(n, options) {
      if (options.sale === true) {
        return `<strike>${this.money(
          n
        )}</strike><br/><span class="sale-price">SALE: <b>${this.money(
          n * 0.7
        )}</b></span>`;
      } else {
        return `<b>${this.money(n)}</b>`;
      }
    },
  },
  watch: {
    currency() {
      this.$router.push({
        path: `/${this.$l1.code}/${this.$l2.code}/pricing/${this.currency}`,
      });
    },
  },
  async fetch() {
    // Load exchange rates data via AJAX:
    let response = await axios.get(
      // NB: using Open Exchange Rates here, but you can use any source!
      "https://api.exchangeratesapi.io/latest"
    );
    let data = response.data;
    // Check money.js has finished loading:
    this.rates = data.rates;
    this.key = this.currency;
    if (typeof fx !== "undefined" && fx.rates) {
      fx.rates = data.rates;
      fx.base = data.base;
    }
  },
};
</script>

<style>
</style>
