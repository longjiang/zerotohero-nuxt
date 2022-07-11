<template>
  <div class="purchase-ios">
    <b-button size="sm" variant="success" @click="executeiOSInAppPurchase">
      <b-spinner small v-if="iOSPurchaseProcessing"></b-spinner>
      <span v-else>
        <i class="fab fa-apple mr-1"></i>
        Pay with In-App Purchase
      </span>
    </b-button>
    <!-- <div class="mt-3">
                      <u
                        class="text-secondary"
                        @click="restoreiOSInAppPurchase"
                      >
                        Restore Purchase
                      </u>
                    </div> -->
  </div>
</template>

<script>
import { logError } from "@/lib/utils/error";
import axios from "axios";

const IOS_IAP_PRODUCT_ID = "pro";

export default {
  data() {
    return {
      iOSPurchaseProcessing: false,
    };
  },
  mounted() {
    if (this.native) {
      this.registeriOSInAppPurchaseProducts();
      this.setupiOSInAppPurchaseListeners();
    }
  },
  beforeDestroy() {
    this.$inAppPurchase2.off(this.oniOSProductApproved);
    this.$inAppPurchase2.off(this.oniOSProductVerified);
    this.$inAppPurchase2.off(this.oniOSProductOrder);
    this.$inAppPurchase2.off(this.oniOSProductOrderErr);
    this.$inAppPurchase2.off(this.oniOSProductChancelled);
  },
  methods: {
    registeriOSInAppPurchaseProducts() {
      this.$inAppPurchase2.register([
        { id: IOS_IAP_PRODUCT_ID, type: this.$inAppPurchase2.NON_CONSUMABLE },
      ]);
      this.$inAppPurchase2.refresh();
    },
    oniOSProductApproved(product) {
      // synchronous
      console.log("approved");
      return product.verify();
    },
    async elevateiOSUserToPro(receipt) {
      console.log({ receipt });
      let url = `https://python.zerotohero.ca/in_app_purchase_success`;
      let body = { user_id: this.$auth.user.id, receipt };
      try {
        let res = await axios.post(url, body);
        if (res?.data?.type === "success") {
          console.log(res.data);
          this.$router.push("/go-pro-success");
        }
      } catch (err) {
        logError(err);
      }
    },
    async oniOSProductVerified(product) {
      console.log("verified");
      let receipt = product?.transaction?.appStoreReceipt;
      if (receipt && !this.iOSPurchaseVerified) {
        this.iOSPurchaseVerified = true;
        this.elevateiOSUserToPro(receipt);
      }
      product.finish();
    },
    oniOSProductOrder(product) {
      // Purchase in progress!
      console.log("order");
      this.iOSPurchaseProcessing = true;
    },
    oniOSProductOrderErr(err) {
      this.iOSPurchaseProcessing = false;
      this.$toast.error(`Failed to purchase: ${err}`, { duration: 5000 });
    },
    oniOSProductChancelled(product) {
      this.iOSPurchaseProcessing = false;
    },
    setupiOSInAppPurchaseListeners() {
      this.$inAppPurchase2.when(IOS_IAP_PRODUCT_ID)
        .approved(this.oniOSProductApproved)
        .verified(this.oniOSProductVerified)
        .cancelled(this.oniOSProductChancelled);
    },
    restoreiOSInAppPurchase() {
      this.$inAppPurchase2.refresh();
    },
    executeiOSInAppPurchase() {
      this.$inAppPurchase2.order(IOS_IAP_PRODUCT_ID).then(
        this.oniOSProductOrder,
        this.oniOSProductOrderError
      );
    },
  },
};
</script>

<style>
</style>