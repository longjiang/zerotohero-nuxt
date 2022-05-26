
import { getClient, AvailableLanguages } from "iframe-translator";


export default async ({ app, store, route }, inject) => {
  const iframeTranslationClient = await getClient();
  inject('iframeTranslationClient', iframeTranslationClient)
  inject('iframeTranslationClientAvailableLanguages', AvailableLanguages)
}
