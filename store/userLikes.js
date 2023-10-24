import { logError } from '../lib/helper';
import Vue from 'vue';

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
  ADD_VIDEO_DETAILS(state, { userLike, video }) {
    Vue.set( userLike, 'video', video )
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
        'filter[owner][eq]': user.id,
        'sort': '-id',
        'limit': -1
      });

      if (response?.status !== 200) {
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
        
        if (postResponse?.status !== 200) {
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
  },

  async fetchVideoDetails({ commit, state }, { l2Id, videoId }) {
    // Find the userLike item for this video in the state
    let userLike = state.userLikes.find(like => like.video_id === videoId && like.l2 === l2Id)
    if (userLike && ! userLike.video) {
      let fields = "fields=id,l2,title,youtube_id,tv_show,talk,date,views,tags,category,locale,duration,made_for_kids,views,likes,comments";
      let filter = `filter[id][eq]=${videoId}`
      let query = `${fields}&${filter}`
      
      let videos = await this.$directus.getVideos({ l2Id, query })
      commit('ADD_VIDEO_DETAILS', { userLike, video: videos[0] })
    }
  }
}

export const getters = {
  liked: (state) => ({ l2Id, videoId }) => {
    videoId = parseInt(videoId);
    return state.userLikes?.some(like => 
      like.l2 === l2Id && like.video_id === videoId
    );
  },
  likedVideos: (state) => (l2Id) => {
    return state.userLikes?.filter(like => like.l2 === l2Id);
  }
}