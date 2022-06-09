import Wikipedia from '@/lib/Wikipedia'
import Event from '@/lib/Event'
import $ from 'jquery'

export default class {
  constructor () {
    this.wikipedia = new Wikipedia()
    this.events = []
  }
  getEventsByYear (yyyy, callback) {
    var source = this
    var yearSlug = yyyy
    if (yyyy < 0) {
      yearSlug = Math.abs(yearSlug) + '_BC'
    }
    if (yearSlug < 100) {
      yearSlug = 'AD_' + yearSlug
    }
    // console.log('getting article ' + yearSlug)
    this.wikipedia.getHtmlContentByTitle(yearSlug, function (content) {
      var $eventSection = source.getEventSection($(content))
      if ($eventSection !== undefined) {
        // console.log('processing event list of article ' + yearSlug)
        source.processEventsList($eventSection, yearSlug, yyyy, callback)
      } else if (yyyy > 0) {
        // console.log('getting article ' + 'AD_' + yyyy)
        source.wikipedia.getHtmlContentByTitle('AD_' + yyyy, function (content) {
          var $eventSection = source.getEventSection($(content))
          source.processEventsList($eventSection, yearSlug, yyyy, callback)
        })
      } else {
        // console.log('article n/a: ' + yyyy)
        source.articleUrl = 'https://en.wikipedia.org/wiki/' + yearSlug
        source.events = []
        callback(source.events)
      }
    })
  }

  getEventSection ($content) {
    var $newSection
    // $content.find('h2').nextUntil('h2').clone().appendTo($newSection)
    $content.find('h2').each(function () {
      var title = $(this).text().replace(/\[.*\]/g, '')
      if (title === 'Events' || title === 'Events and trends') {
        $newSection = $(this).nextUntil('h2')
      }
    })
    return $newSection
  }

  processEventsList ($eventSection, yearSlug, yyyy, callback) {
    var source = this
    var numEvents = $eventSection.find('li').length
    var getPageViewStat = numEvents < 10
    // console.log('taskmaster: ' + $eventSection.find('li').length)
    var taskMaster = new TaskMaster($eventSection.find('li').length, function () {
      // console.log('taskmaster: SUCCESS')
      source.articleUrl = 'https://en.wikipedia.org/wiki/' + yearSlug
      if (getPageViewStat) {
        source.events = source.sortByPageViews(source.events)
      }
      // console.log(sortedEvents)
      callback(source.events)
    })
    taskMaster.timeout(5000)
    $eventSection.find('li').each(function () {
      let event = new Event(this, yyyy)
      event.getMainArticle(function (success) {
        source.events.push(event)
        taskMaster.removeTask()
        // console.log(taskMaster.numTasks)
      }, getPageViewStat)
    })
  }
  sortByPageViews (events) {
    return events.sort(function (a, b) {
      if (a.article === undefined || a.article.pageViews === undefined || a.article.pageViews === false) {
        return true
      } else {
        if (b.article === undefined || b.article.pageViews === undefined || b.article.pageViews === false) {
          return true
        } else {
          return a.article.pageViews < b.article.pageViews
        }
      }
    })
  }
}
