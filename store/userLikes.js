import { logError } from '../lib/helper';
import { PYTHON_SERVER } from '../lib/utils';

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
  REMOVE_LIKE(state, videoId) {
    state.userLikes = state.userLikes.filter(like => like.id !== videoId);
  }
}

export const actions = {
  async fetchUserLikes({ commit, rootState }, l2) {
    if (!$nuxt.$auth.loggedIn) return;

    let user = rootState.auth.user;
    let token = $nuxt.$auth.strategy.token.get();

    if (user && user.id && token) {
      try {
        let response = await axios.post(`${PYTHON_SERVER}user-likes`, { id: user.id, l2: l2.code });
        // Handle success (e.g., update UI or state)
        if (response?.status !== 200) {
          logError('Error loading likes from the server', response);
          return;
        } else {
          let userLikes = response.data;
          userLikes.forEach(item => {
            item.created_on = new Date(item.created_on) // Date returned from the server is a Human-readable string
          })
          commit('SET_USER_LIKES', userLikes || []);
        }
      } catch (error) {
        // User likes not found for this language.
      }
    }
  },
  async like({ commit, rootState }, { l2Id, video }) {
    const videoId = parseInt(video.id);
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
        
        if (postResponse?.status !== 200) {
          logError('Error creating a new like', postResponse);
          return;
        }

        commit('ADD_LIKE', { youtube_id: video.youtube_id, id: parseInt(video.id), l2: l2Id, tags: video.tags, title: video.title, created_on: new Date()});
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

        commit('REMOVE_LIKE', videoId);
        console.log(`User Likes: Unliked video with ID ${videoId} and L2 ${l2Id}`);
      }
    }
  },

}

export const getters = {
  liked: (state) => ({ l2Id, videoId }) => {
    videoId = parseInt(videoId);
    return state.userLikes?.some(like => 
      like.l2 === l2Id && like.id === videoId
    );
  },
  likedVideos: (state) => (l2Id) => {
    return state.userLikes?.filter(like => like.l2 === l2Id);
  }
}