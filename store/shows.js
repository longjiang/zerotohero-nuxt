import Config from '@/lib/config'
import Helper from '@/lib/helper'

export const state = () => {
    return {
        tvShows: {},
        talks: {},
        showsLoaded: {}
    }
}

export const mutations = {
    LOAD_SHOWS(state, { l2, tvShows, talks }) {
        state.tvShows[l2.code] = tvShows;
        state.talks[l2.code] = talks;
        state.showsLoaded[l2.code] = true
    },
    ADD_SHOW(state, { l2, type, show }) {
        state[type][l2.code].push(show);
    },
    REMOVE_SHOW(state, { l2, type, show }) {
        state[type][l2.code] = state[type][l2.code].filter((s) => s !== show);
    },
}

export const actions = {
    async load(context, { l2, adminMode }) {
        let response = await axios.get(
            `${Config.wiki}items/tv_shows?sort=title&filter[l2][eq]=${l2.id
      }&limit=500&timestamp=${adminMode ? Date.now() : 0}`
        );
        let tvShows =
            response.data.data.sort((x, y) =>
                x.title.localeCompare(y.title, l2.code)
            ) || [];
        tvShows = Helper.uniqueByValue(tvShows, "youtube_id");

        response = await axios.get(
            `${Config.wiki}items/talks?sort=title&filter[l2][eq]=${l2.id
      }&limit=500&timestamp=${adminMode ? Date.now() : 0}`
        );
        let talks =
            response.data.data.sort((x, y) =>
                x.title.localeCompare(y.title, l2.code)
            ) || [];
        talks = Helper.uniqueByValue(talks, "youtube_id");
        context.commit('LOAD_SHOWS', { l2, tvShows, talks })
    },
    async add(context, { l2, type, show }) {
        let response = await axios.post(
            `${Config.wiki}items/${type === 'tvShows' ? 'tv_shows' : 'talks'}`,
            show
        );
        if (response && response.data) {
            context.commit('ADD_SHOW', { l2, type, show: response.data.data })
            let show = Object.assign(response.data.data, { l2, type: type === 'tvShows' ? 'tv_show' : 'talk' })
            return show
        } else {
            return false
        }
    },
    async remove(context, { l2, type, show }) {
        let response = await axios.delete(
            `${Config.wiki}items/${type === 'tvShows' ? 'tv_shows' : 'talks'}/${show.id}`
        );
        if (response && response.data) {
            context.commit('REMOVE_SHOW', { l2, type, show })
        }
        return true
    },
}