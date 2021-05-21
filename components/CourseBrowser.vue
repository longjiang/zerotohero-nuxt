<template>
  <div v-cloak :key="browseKey">
    <ul class="books mt-2">
      <li
        class="book"
        v-for="(book, bookIndex) in books"
        :data-book="bookIndex"
        v-bind:key="'book-' + bookIndex"
      >
        <div
          class="book-title collapsed"
          v-on:click="toggleCollapsed"
          :data-bg-level="bookIndex"
        >HSK {{ bookIndex }}</div>
        <ul class="lessons collapsed">
          <li
            class="lesson"
            v-for="(lesson, lessonIndex) in book"
            :data-lesson="lessonIndex"
            v-bind:key="'lesson-' + lessonIndex"
          >
            <div class="lesson-title collapsed" v-on:click="toggleCollapsed">
              Lesson {{ lessonIndex }}
              <br />
              <span
                class="tile"
                :data-bg-level="bookIndex"
                v-for="i in countWordsInLesson(lesson)"
                v-bind:key="'lesson-tile-' + i"
              ></span>
            </div>
            <ul class="dialogs collapsed">
              <li
                class="dialog"
                v-for="(dialog, dialogIndex) in lesson"
                :data-dialog="dialogIndex"
                v-bind:key="'dialog-' + dialogIndex"
              >
                <div class="dialog-title collapsed" v-on:click="toggleCollapsed">
                  Part {{ dialogIndex }}
                  <br />
                  <span
                    class="tile"
                    :data-bg-level="bookIndex"
                    v-for="(i, dialogIndex) in dialog"
                    v-bind:key="'dialog-tile-' + dialogIndex"
                  ></span>
                </div>
                <ul class="browse-words collapsed">
                  <WordList :words="dialog" class="ml-2" />
                  <a
                    class="btn btn-small ml-2 learn-all-button"
                    :data-bg-level="bookIndex"
                    :href="
                      `/${$l1.code}/${$l2.code}/learn/hsk/${bookIndex},${lessonIndex},${dialogIndex}`
                    "
                  >
                    <i class="glyphicon glyphicon-blackboard"></i> Learn These
                    Words
                  </a>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  data() {
    return {
      books: undefined,
      browseKey: 0, // used to force re-render this component
    }
  },
  async mounted() {
    this.books = await (await this.$dictionary).compileBooks()
  },
  methods: {
    saveAllClick: function(e) {
      $(e.target)
        .parents('.browse-words')
        .find('.add-word')
        .click()
    },
    countWordsInLesson(lesson) {
      var count = 0
      for (var index in lesson) {
        var dialog = lesson[index]
        count += dialog.length
      }
      return count
    },
    toggleCollapsed(e) {
      $(e.target)
        .toggleClass('collapsed')
        .next('ul')
        .toggleClass('collapsed')
    }
  }
}
</script>
<style>
.tile {
  height: 0.5rem;
  width: 1%;
  display: inline-block;
  box-shadow: 2px 2px 7px rgba(0, 0, 0, 0.4);
  margin-right: 0.2rem;
  background-image: url('/img/square.png');
  background-size: 100%;
}

.lessons.collapsed,
.dialogs.collapsed,
.browse-words.collapsed {
  display: none;
}

.browse-words a {
  text-decoration: none;
}

.book-title,
.lesson-title,
.dialog-title {
  cursor: pointer;
}

.books,
.lessons,
.dialogs {
  list-style: none;
  padding: 0;
}

.lesson-title br,
.dialog-title br {
  margin-top: 0.5rem;
  display: block;
  content: '';
}

.book-title {
  margin: 1rem 0 0 0;
}

.book-title:not(.collapsed) {
  background-color: inherit !important;
  color: #717171 !important;
  font-weight: bold;
  padding: 0.5rem 1rem;
}

.book-title.collapsed {
  padding: 0.5rem 1rem;
  color: white;
  font-weight: bold;
  box-shadow: 2px 2px 7px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  white-space: nowrap;
  /* border-radius: 0.2rem; */
  background-image: url('/img/square.png');
}

.book[data-book='1'] > .book-title.collapsed {
  width: 25%;
  background-size: 4% 16.67%;
}

.book[data-book='2'] > .book-title.collapsed {
  width: 25%;
  background-size: 4% 16.67%;
}

.book[data-book='3'] > .book-title.collapsed {
  width: 50%;
  background-size: 2% 16.67%;
}

.book[data-book='4'] > .book-title.collapsed {
  width: 100%;
  background-size: 1% 16.67%;
}

.book[data-book='5'] > .book-title.collapsed {
  width: 100%;
  height: 5rem;
  line-height: 4rem;
  background-size: 1% 8.3%;
}

.book[data-book='6'] > .book-title.collapsed {
  width: 100%;
  height: 10rem;
  line-height: 9rem;
  background-size: 1% 4.16%;
}

.lesson-title {
  padding: 1rem;
  border-top: none;
  font-weight: bold;
  line-height: 0.5rem;
}

.lesson-title:not(.collapsed) .tile {
  display: none;
}

.lesson-title:last-child {
  border-radius: 0 0 0 0.5rem;
}

.dialog {
  padding-left: 1rem;
}

.dialog-title {
  padding: 0.5rem 1rem;
  /* border: 1px solid #c5c5c5; */
  border-top: none;
  line-height: 0.5rem;
}

.dialog-title:not(.collapsed) .tile {
  display: none;
}

.browse-words {
  list-style: none;
  padding-left: 0.5rem;
}
</style>
