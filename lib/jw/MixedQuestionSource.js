import config from '@/lib/Config'
import Wol from '@/lib/jw/Wol'
import ArticleQuestionSource from '@/lib/jw/ArticleQuestionSource'
import $ from 'jquery'
import langData from '@/lib/jw/languages/en-US'

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
  async getQuestions(callback) {
    var quizMixer = this

    // Goal: get 10 questions, including:
    // 4 Questions from 2 random articles from 2017
    // 4 "Define this term" from the NWT glossary
    // 2 Identify this picture


    let articleUrls = await this.getNArticlesFromArticleLists(quizMixer.numArticlesToGetQuestionsFrom)
    this. articleQuestions = this.getArticleQuestions(articleUrls)
    this.getRandomNwtGlossaryTerms()

    // Randomly pick 4 questsions from (1) the article questions,
    // 2 questions from (2) the identify the picture questions
    // and 4 questions from (3) the glossary questions
    quizMixer.dataLoaded = true
    var a = Helper.findRandomUniqueElementsFromArray(quizMixer.articleQuestions, quizMixer.numArticleQuestions)
    var b = Helper.findRandomUniqueElementsFromArray(quizMixer.glossaryQuestions, quizMixer.numGlossaryQuestions)
    context.questions = Helper.shuffle($.merge(a, b)).filter(Boolean) // Filter out undefined items
    return 
  }

  async getNArticlesFromArticleLists(n) {
    for (let articleIndex of langData.article_indices_for_questions) {
      let article = await Wol.getArticle(articleIndex.url)
      // Randomly pick n articles to get questions
      var articleLinks = article.content.querySelector(articleIndex.selector).map(node => node.getAttribute('href'))
      var randomArticleLinks = Helper.findRandomUniqueElementsFromArray(articleLinks, n)
      return randomArticleLinks
    }
  }

  async getArticleQuestions(articleUrls) {
    // AJAX: Go to all articles
    articleQuestions = []
    for (let articleUrl of articleUrls) {
      var article = await Wol.getArticle(articleUrl)

      let articleQuestionSource = new ArticleQuestionSource(article)
      let questions = await articleQuestionSource.getQuestions()
      articleQuestions = articleQuestions.concat(questions)
    }
    return articleQuestions
  }

  getRandomNwtGlossaryTerms() {
    var quizMixer = this
    if (langData.glossary !== undefined) {
      quizMixer.taskMaster.addTask(1)
      // AJAX: Go to NWT glossary https://www.jw.org/en/publications/bible/nwt/bible-glossary/
      $.ajax(config.dataUrl + langData.glossary).done(function (html) {
        quizMixer.glossaryQuestions = $(html).find('.de').map(function () {
          return {
            term: $(this).find('.dt').first().text(),
            definition: $(this).find('.dd').text(),
            type: 'glossary'
          }
        })
        // report the Task Master you're done
        quizMixer.taskMaster.removeTask(1)
      })
    }
  }
}
