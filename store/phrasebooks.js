import Config from '@/lib/config'

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
}

export const actions = {
  async load(context, { l2, adminMode }) {
    let response = await axios.get(
      `${Config.wiki}items/phrasebook?sort=title&filter[l2][eq]=${l2.id
      }&limit=500&timestamp=${adminMode ? Date.now() : 0}`
    );
    let phrasebooks =
      response.data.data.sort((x, y) =>
        x.title.localeCompare(y.title, l2.code)
      ) || [];

    context.commit('LOAD_PHRASEBOOKS', { l2, phrasebooks })
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
