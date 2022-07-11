import { InAppPurchase2 } from "@ionic-native/in-app-purchase-2";

export default async ({ app, store, route }, inject) => {
  inject('inAppPurchase2', InAppPurchase2)
}