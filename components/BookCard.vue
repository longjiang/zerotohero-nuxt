<template>
  <div class="book-card">
    <div class="p-3">
      <div class="three-to-two-aspect-wrapper shadow">
        <img
          :src="book.formats['image/jpeg']"
          alt="Book cover"
          class="book-cover aspect"
        />
      </div>
    </div>
    <div class="info">
      <div class="title">{{ book.title }}</div>
      <div
        class="author"
        v-if="book.authors[0]"
        :set="(author = book.authors[0])"
      >
        {{ author.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    book: Object,
  },
};
</script>

<style lang="scss" scoped>
.book-card {
  height: 100%;
  .book-cover {
    width: 100%;
    border-radius: 0.25rem;
  }
  .info {
    text-align: center;
    padding-top: 1rem;
    color: black;
    .title {
      font-weight: bold;
    }
    .author {
      margin-top: 0.2rem;
      color: #999;
      font-size: 0.9em;
    }
  }
}
</style>