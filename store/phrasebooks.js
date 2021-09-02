import Config from '@/lib/config'
import Papa from 'papaparse'
import axios from 'axios'

export const state = () => {
  return {
    phrasebooks: {},
    phrasebooksLoaded: {}
  }
}

export const mutations = {
  LOAD_PHRASEBOOKS(state, { l2, phrasebooks }) {
    state.phrasebooks[l2.code] = phrasebooks;
    state.phrasebooksLoaded[l2.code] = true
  },
  ADD_PHRASEBOOK(state, { l2, phrasebook }) {
    state.phrasebooks[l2.code].push(phrasebook);
  },
  REMOVE_PHRASEBOOK(state, { l2, phrasebook }) {
    state.phrasebooks[l2.code] = state.phrasebooks[l2.code].filter((p) => p !== phrasebook);
  },
  LOAD_PHRASES(state, { l2, bookId, phrases }) {
    let phrasebook = state.phrasebooks[l2.code].find(pb => {
      return pb.id === bookId
    })
    if (phrasebook) {
      phrasebook.phrases = phrases
    }
  }
}

export const actions = {
  async load(context, { l2, adminMode }) {
    let response = await axios.get(
      `${Config.wiki}items/phrasebook?sort=title&filter[l2][eq]=${l2.id
      }&fields=id,description,exact,title,l2,tv_show.*&limit=500&timestamp=${adminMode ? Date.now() : 0}`
    );
    let phrasebooks =
      response.data.data
    phrasebooks = phrasebooks.sort((x, y) =>
      (x.title || "").localeCompare(y.title, l2.code)
    ) || [];
    context.commit('LOAD_PHRASEBOOKS', { l2, phrasebooks })
  },
  async loadPhrases(context, { l2, bookId, adminMode }) {
    let url = `${Config.wiki}items/phrasebook/${bookId}?fields=*,tv_show.*&timestamp=${adminMode ? Date.now() : 0}`;
    let response = await axios.get(url);
    if (response.data && response.data.data) {
      let phrasebook = response.data.data;
      let phrases = Papa.parse(phrasebook.phrases, {
        header: true,
      }).data.map((p, id) => {
        p.id = id;
        return p;
      });
      context.commit('LOAD_PHRASES', { l2, bookId, phrases })
    }
  },
  async add(context, { l2, phrasebook }) {
    let response = await axios.post(
      `${Config.wiki}items/phrasebooks`,
      phrasebook
    );
    if (response && response.data) {
      context.commit('ADD_PHRASEBOOK', { l2, phrasebook: response.data.data })
      return response.data.data
    } else {
      return false
    }
  },
  async remove(context, { l2, phrasebook }) {
    let response = await axios.delete(
      `${Config.wiki}items/phrasebook/${phrasebook.id}`
    );
    if (response && response.data) {
      context.commit('REMOVE_PHRASEBOOK', { l2, phrasebook })
    }
    return true
  },
}
