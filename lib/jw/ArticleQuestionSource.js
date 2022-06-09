import { findRandomUniqueElementsFromArray, shuffle } from '@/lib/utils/array'

export default class {
  constructor(article) {
    this.article = article
    this.articleQuestions = []
    this.pictureQuestions = []
    this.scriptureQuestions = []
  }

  async getQuestions() {
    var articleQuestionSource = this
    articleQuestionSource.articleQuestions = articleQuestionSource.getArticleQuestions() || []
    articleQuestionSource.pictureQuestions = articleQuestionSource.getPictureQuestions() || []
    articleQuestionSource.scriptureQuestions = articleQuestionSource.getScriptureQuestions() || []
    articleQuestionSource.questions = shuffle(
      $.merge(
        $.merge(
          articleQuestionSource.pictureQuestions, findRandomUniqueElementsFromArray(articleQuestionSource.scriptureQuestions, 8)
        ), findRandomUniqueElementsFromArray(articleQuestionSource.articleQuestions, 6)
      )
    ).filter(Boolean) // Filter out undefined items
    return articleQuestionSource.questions
  }

  getArticleQuestions() {
    // find suitable questions, and add all to (1)
    var articleQuestions = $(this.article.html).find('.qu').map(function () {
      var $answer = $(this).nextUntil('.qu')
      $answer.find('sup').remove()
      return {
        question: $(this).text().replace(/^(\s?[\d\.． ,，]+\s?)+/, '').replace(/\(.*?\)/g, '').replace(/（.*?）/g, ''),
        answer: $answer.text(),
        type: 'article'
      }
    }).get()
    return articleQuestions.splice(3, articleQuestions.length - 6) // Omit the first and last 3 paragraphs
  }

  getPictureQuestions() {
    var pictureQuestions = $(this.article.html).find('figure').map(function () {
      return {
        image: $(this).find('img').attr('src'),
        caption: $(this).find('img').attr('alt'),
        type: 'picture'
      }
    }).get()
    return pictureQuestions
  }

  getScriptureQuestions() {
    var scriptureQuestions = this.article.scriptureSnippets
    if (scriptureQuestions) {
      scriptureQuestions = scriptureQuestions.map(function (snippet) {
        // console.log(snippet)
        var $scripture = $(snippet.content_element).clone()
        $scripture.find('.scripture-citation-caption, .vl, .fn').remove()
        return {
          scripture: $scripture.html(),
          caption: $(snippet.caption_element).text(),
          type: 'scripture-' + findRandomUniqueElementsFromArray(['front', 'back'], 1)
        }
      })
      return scriptureQuestions
    }
  }
}
