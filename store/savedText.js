import Config from '@/lib/config'

const LOCAL_KEY = 'zthSavedText'


export const state = () => {
  return {
    itemsByL2: {}, // One key per language
    loadedByL2: {} // One key per language
  }
}

export const mutations = {
  SAVE_LOCAL(state) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state.itemsByL2))
  },
  LOAD(state, { l2, itemsByL2 }) {
    state.itemsByL2 = itemsByL2
    state.loadedByL2[l2.code] = true
  },
  LOAD_ITEM(state, { l2, id, data }) {
    let item = (state.itemsByL2[l2.code] || []).find(i => i.id === id)
    item = Object.assign(item, data)
  },
  ADD(state, { l2, item }) {
    if (!state.itemsByL2[l2.code]) state.itemsByL2[l2.code] = []
    state.itemsByL2[l2.code].push(item);
  },
  REMOVE(state, { l2, itemId }) {
    state.itemsByL2[l2.code] = state.itemsByL2[l2.code].filter((i) => i.id !== itemId);
  },
  UPDATE(state, { l2, item }) {
    console.log(state.itemsByL2[l2.code][0].id, item.id)
    let existing = state.itemsByL2[l2.code].find(i => i.id === item.id)
    if (!existing) {
      existing = {}
      state.itemsByL2[l2.code].push(existing)
    }
    for (let key in item) {
      existing[key] = item[key]
      console.log(existing)
    }

  },
}


export const getters = {
  getItems: (state) => {
    return (l2) => state.itemsByL2[l2]
  }
}

export const loadFromServer = async ({ l2, adminMode }) => {
  let items = []
  if ($nuxt.$auth.loggedIn) {
    try {
      let url = `${Config.wiki}items/text?sort=title&filter[l2][eq]=${l2.id
        }&filter[owner][eq]=${$nuxt.$auth.user.id}&fields=id,title&timestamp=${Date.now()}`
      console.log(`savedTexts store: getting saved texts from ${url}`)
      let res = await $nuxt.$authios.get(url);
      items = res?.data?.data || []
      console.log('savedTexts store: got items:', { items })
    } catch (e) {
    }
  }
  return items
}

export const actions = {
  saveLocal({ commit }) {
    commit('SAVE_LOCAL')
  },
  async load({ commit }, { l2, adminMode }) {
    let itemsByL2 = {}
    // Server only for now...
    // if (typeof localStorage !== 'undefined') {
    //   itemsByL2 = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
    // }
    let items = await loadFromServer({ l2, adminMode })
    if (items.length !== 0) {
      items = items.sort((x, y) =>
        (x.title || "").localeCompare(y.title, l2.locales[0])
      ) || [];
      itemsByL2[l2.code] = items
    }
    commit('LOAD', { l2, itemsByL2 })
  },
  async loadItem({ commit }, { l2, id, adminMode }) {
    if ($nuxt.$auth.loggedIn) {
      let url = `${Config.wiki}items/text/${id}?timestamp=${Date.now()}`;
      let res = await $nuxt.$authios.get(url);
      if (res.data && res.data.data) {
        let data = res.data.data;
        commit('LOAD_ITEM', { l2, id, data })
      }
    }
  },
  async add({ commit }, { l2, item }) {
    item = item || { text: '', translation: '', title: 'Untitled', l2: l2.id }
    if ($nuxt.$auth.loggedIn) {
      let response = await $nuxt.$authios.post(
        `${Config.wiki}items/text`,
        item
      );
      if (response?.data) {
        item = response.data.data
      }
    }
    commit('ADD', { l2, item })
    // commit('SAVE_LOCAL')
    return item
  },
  async remove({ commit }, { l2, itemId }) {
    if ($nuxt.$auth.loggedIn) {
      let response = await $nuxt.$authios.delete(
        `${Config.wiki}items/text/${itemId}`
      );
      if (response?.data) {
        return response.data
      }
    }
    commit('REMOVE', { l2, itemId })
    // commit('SAVE_LOCAL')
  },
  async update({ commit }, { l2, item }) {
    if ($nuxt.$auth.loggedIn) {
      let response = await $nuxt.$authios.patch(
        `${Config.wiki}items/text/${item.id}`,
        item
      );
    }
    commit('UPDATE', { l2, item })
  }
}


