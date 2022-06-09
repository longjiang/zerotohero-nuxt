import config from '@/lib/Config'
import { default as Wol, WOL_BASE_URL } from '@/lib/jw/Wol'
import ArticleQuestionSource from '@/lib/jw/ArticleQuestionSource'
import $ from 'jquery'
import langData from '@/lib/jw/languages/en-US'
import { shuffle, findRandomUniqueElementsFromArray } from '@/lib/utils/array'

export default class {
  constructor(numArticlesToGetQuestionsFrom) {
    this.questions = []
    this.numArticleQuestions = 15
    this.numGlossaryQuestions = 5
    this.numArticlesToGetQuestionsFrom = numArticlesToGetQuestionsFrom

    // Have empty arrays to hold:
    // (1) the article questions
    this.articleQuestions = []
    this.scriptureQuestions = []
    // (2) the identify the picture questions and
    this.pictureQuestions = []
    // (3) the glossary questions
    this.glossaryQuestions = []
    this.taskMaster = undefined
  }
  async getQuestions() {
    var quizMixer = this

    // Goal: get 10 questions, including:
    // 4 Questions from 2 random articles from 2017
    // 4 "Define this term" from the NWT glossary
    // 2 Identify this picture


    let articleUrls = await this.getNArticlesFromArticleLists(quizMixer.numArticlesToGetQuestionsFrom)
    this.articleQuestions = this.getArticleQuestions(articleUrls)
    this.getRandomNwtGlossaryTerms()

    // Randomly pick 4 questsions from (1) the article questions,
    // 2 questions from (2) the identify the picture questions
    // and 4 questions from (3) the glossary questions
    quizMixer.dataLoaded = true
    var a = findRandomUniqueElementsFromArray(quizMixer.articleQuestions, quizMixer.numArticleQuestions)
    var b = findRandomUniqueElementsFromArray(quizMixer.glossaryQuestions, quizMixer.numGlossaryQuestions)
    let questions = shuffle($.merge(a, b)).filter(Boolean) // Filter out undefined items
    return questions
  }

  async getNArticlesFromArticleLists(n) {
    for (let articleIndex of langData.article_indices_for_questions) {
      let article = await Wol.getArticle(WOL_BASE_URL + articleIndex.url)
      // Randomly pick n articles to get questions
      var articleLinks = article.contentParsed.querySelectorAll(articleIndex.selector).map(node => node.getAttribute('href'))
      var randomArticleLinks = findRandomUniqueElementsFromArray(articleLinks, n)
      return randomArticleLinks
    }
  }

  async getArticleQuestions(articleUrls) {
    // AJAX: Go to all articles
    let articleQuestions = []
    for (let articleUrl of articleUrls) {
      var article = await Wol.getArticle(articleUrl)

      let articleQuestionSource = new ArticleQuestionSource(article)
      let questions = await articleQuestionSource.getQuestions()
      articleQuestions = articleQuestions.concat(questions)
    }
    return articleQuestions
  }

  async getRandomNwtGlossaryTerms() {
    var quizMixer = this
    if (langData.glossary !== undefined) {
      // AJAX: Go to NWT glossary https://www.jw.org/en/publications/bible/nwt/bible-glossary/
      let res = await axios.get('/data/jw/' + langData.glossary)
      if (res) {
        let html = res.data
        quizMixer.glossaryQuestions = $(html).find('.de').map(function () {
          return {
            term: $(this).find('.dt').first().text(),
            definition: $(this).find('.dd').text(),
            type: 'glossary'
          }
        })
      }
    }
  }
}
