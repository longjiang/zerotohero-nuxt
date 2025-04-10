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
    let item = (state.itemsByL2[l2.code] || []).find(i => Number(i.id) === Number(id))
    if (item) item = Object.assign(item, data)
    else {
      item = data
      if (!state.itemsByL2[l2.code]) state.itemsByL2[l2.code] = []
      state.itemsByL2[l2.code].push(item)
    }
  },
  ADD(state, { l2, item }) {
    if (!state.itemsByL2[l2.code]) state.itemsByL2[l2.code] = []
    state.itemsByL2[l2.code].push(item);
  },
  REMOVE(state, { l2, itemId }) {
    state.itemsByL2[l2.code] = state.itemsByL2[l2.code].filter((i) => i.id !== itemId);
  },
  UPDATE(state, { l2, payload }) {
    let items = state.itemsByL2[l2.code]
    if (items) {
      let existing = state.itemsByL2[l2.code].find(i => i.id === payload.id)
      if (!existing) {
        existing = {}
        state.itemsByL2[l2.code].push(existing)
      }
      for (let key in payload) {
        existing[key] = payload[key]
      }
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
      let path = `items/text?sort=title&filter[l2][eq]=${l2.id
        }&filter[owner][eq]=${$nuxt.$auth.user.id}&fields=id,title,text,translation,owner&timestamp=${Date.now()}`
      let res = await $nuxt.$directus.get(path);
      items = res?.data?.data || []
    } catch (e) {
    }
  }
  return items
}

export const actions = {
  saveLocal({ commit }) {
    commit('SAVE_LOCAL')
  },
  async load({ commit, state }, { l2, adminMode }) {
    // Check if already loaded
    if (state.loadedByL2[l2.code]) return
    let itemsByL2 = {}
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
    let path = `items/text/${id}?timestamp=${Date.now()}`;
    let res = await $nuxt.$directus.get(path);
    if (res.data && res.data.data) {
      let data = res.data.data;
      commit('LOAD_ITEM', { l2, id, data })
    }
    return res.data.data
  },
  async add({ commit }, { l2, item }) {
    item = item || { text: '', translation: '', title: 'Untitled', l2: l2.id }
    if ($nuxt.$auth.loggedIn) {
      let response = await $nuxt.$directus.post(
        `items/text`,
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
      let response = await $nuxt.$directus.delete(
        `items/text/${itemId}`
      );
      if (response?.data) {
        return response.data
      }
    }
    commit('REMOVE', { l2, itemId })
    // commit('SAVE_LOCAL')
  },
  async update({ commit }, { l2, payload }) {
    if ($nuxt.$auth.loggedIn) {
      await $nuxt.$directus.patch(
        `items/text/${payload.id}`,
        payload
      );
    }
    commit('UPDATE', { l2, payload })
  }
}


