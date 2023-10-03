import { logError } from '@/lib/helper';

export const state = () => ({
  userLikes: []
})

export const mutations = {
  SET_USER_LIKES(state, likes) {
    state.userLikes = likes;
  },
  ADD_LIKE(state, like) {
    state.userLikes.push(like);
  },
  REMOVE_LIKE(state, likeId) {
    state.userLikes = state.userLikes.filter(like => like.id !== likeId);
  }
}

export const actions = {
  async fetchUserLikes({ commit, rootState }) {
    if (!$nuxt.$auth.loggedIn) return;

    let user = rootState.auth.user;
    let token = $nuxt.$auth.strategy.token.get();

    if (user && user.id && token) {
      let path = 'items/user_likes';
      let response = await this.$directus.get(path, { 
        'filter[owner][eq]': user.id 
      });

      if (response.status !== 200) {
        logError('Error loading likes from the server', response);
        return;
      } else {
        commit('SET_USER_LIKES', response.data?.data || []);
      }
    }
  },
  async like({ commit, rootState }, { l2Id, videoId }) {
    videoId = parseInt(videoId);
    if (!$nuxt.$auth.loggedIn) return
    const user = rootState.auth.user;
    const token = $nuxt.$auth.strategy.token.get();

    if (user && user.id && token) {
      const path = 'items/user_likes';
      const response = await this.$directus.get(path, { 
        'filter[owner][eq]': user.id, 
        'filter[l2][eq]': l2Id, 
        'filter[video_id][eq]': videoId 
      });

      if (response.status !== 200) {
        logError('Error loading likes from the server', response);
        return;
      }

      const likes = response.data?.data || [];
      if (likes.length === 0) {
        const data = {
          l2: l2Id,
          video_id: videoId
        };
        const postResponse = await this.$directus.post(path, data);
        const id = postResponse.data?.data?.id;
        
        if (postResponse.status !== 200) {
          logError('Error creating a new like', postResponse);
          return;
        }

        commit('ADD_LIKE', {id, ...data});
        console.log(`User Likes: Liked video ${videoId} and L2 ${l2Id}`);
      }
    }
  },

  async unlike({ commit, rootState }, { l2Id, videoId }) {
    videoId = parseInt(videoId);
    if (!$nuxt.$auth.loggedIn) return;
    const user = rootState.auth.user;
    const token = $nuxt.$auth.strategy.token.get();

    if (user && user.id && token) {
      const path = 'items/user_likes';
      const response = await this.$directus.get(path, { 
        'filter[owner][eq]': user.id, 
        'filter[l2][eq]': l2Id, 
        'filter[video_id][eq]': videoId 
      });

      if (response.status !== 200) {
        logError('Error loading likes from the server', response);
        return;
      }

      const likes = response.data?.data || [];
      if (likes.length > 0) {
        const deleteResponse = await this.$directus.delete(`items/user_likes/${likes[0].id}`);

        if (deleteResponse.status !== 204) {
          logError('Error deleting a like', deleteResponse);
          return;
        }

        commit('REMOVE_LIKE', likes[0].id);
        console.log(`User Likes: Unliked video ${videoId} and L2 ${l2Id}`);
      }
    }
  }
}

export const getters = {
  liked: (state) => ({ l2Id, videoId }) => {
    videoId = parseInt(videoId);
    return state.userLikes?.some(like => 
      like.l2 === l2Id && like.video_id === videoId
    );
  }
}