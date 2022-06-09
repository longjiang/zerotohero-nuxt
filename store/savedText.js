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
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state.itemsByL2))},
  LOAD(state,  { l2, itemsByL2 }) {
    state.itemsByL2 = itemsByL2
    state.loadedByL2[l2.code] = true
  },
  LOAD_ITEM(state, { l2, id, data }) {
    let item = (state.itemsByL2[l2.code] || []).find(i => i.id === id)
    item = Object.assign(item, data)
  },
  ADD(state, { l2, item }) {
    state.itemsByL2[l2.code].push(item);
  },
  REMOVE(state, { l2, item }) {
    state.itemsByL2[l2.code] = state.itemsByL2[l2.code].filter((i) => i !== item);
  },
  UPDATE(state, { l2, item }) {
    let existing = state.itemsByL2[l2.code].find(i => i.id === item.id)
    for (let key in item) {
      existing[key] = item[key]
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
    let res = await $nuxt.$authios.get(
      `${Config.wiki}items/text?sort=title&filter[l2][eq]=${l2.id
      }&filter[owner][eq]=${$nuxt.$auth.user.id}&fields=id,title&timestamp=${adminMode ? Date.now() : 0}`
    );

    items = res?.data?.data || []
  }
  return items
}

export const actions = {
  saveLocal({ commit }) {
    commit('SAVE_LOCAL')
  },
  async load({ commit }, { l2, adminMode }) {
    let itemsByL2 = {}
    if (typeof localStorage !== 'undefined') {
      itemsByL2 = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
    }
    let items = await loadFromServer({ l2, adminMode })
    if (items.length !== 0) {
      items = items.sort((x, y) =>
        (x.title || "").localeCompare(y.title, l2.locales[0])
      ) || [];
      itemsByL2[l2.code] = items
    }
    commit('LOAD', { l2, itemsByL2 })
    commit('SAVE_LOCAL')
  },
  async loadItem({ commit }, { l2, id, adminMode }) {
    if ($nuxt.$auth.loggedIn) {
      let url = `${Config.wiki}items/text/${id}?timestamp=${adminMode ? Date.now() : 0}`;
      let res = await $nuxt.$authios.get(url);
      if (res.data && res.data.data) {
        let data = res.data.data;
        commit('LOAD_ITEM', { l2, id, data  })
        commit('SAVE_LOCAL')
      }
    }
  },
  async add({ commit }, { l2, item }) {
    commit('ADD', { l2, item })
    commit('SAVE_LOCAL')
    if ($nuxt.$auth.loggedIn) {
      let response = await $nuxt.$authios.post(
        `${Config.wiki}items/text`,
        item
      );
      if (response?.data) {
        return response.data.data
      }
    }
  },
  async remove({ commit }, { l2, item }) {
    commit('REMOVE', { l2, item })
    commit('SAVE_LOCAL')
    if ($nuxt.$auth.loggedIn) {
      let response = await $nuxt.$authios.delete(
        `${Config.wiki}items/text/${item.id}`
      );
      if (response?.data) {
        return response.data
      }
    }
  },
  async update({ commit }, { l2, item }) {
    commit('UPDATE', { l2, item })
    commit('SAVE_LOCAL')
    if ($nuxt.$auth.loggedIn) {
      let response = await $nuxt.$authios.patch(
        `${Config.wiki}items/text/${item.id}`,
        item
      );
      return response?.data
    }
  }
}


