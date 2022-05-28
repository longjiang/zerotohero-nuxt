import Helper from './helper'
import Config from './config'
import axios from 'axios'
import { parse } from 'node-html-parser'

export default {
  savePhoto(word, url, callback) {
    axios.get(
      `${Config.savePhoto}?id=${word.hskId}&word=${word.simplified
      }&url=${encodeURIComponent(url)}`,
    ).then(response => callback(response.data))
  },
  getPhoto(word, success, fail = () => { }) {
    let src = `${Config.imageUrl}${word.hskId}-${word.simplified}.jpg`
    this.testImage(src, success, fail)
  },
  testImage(image, success, fail = () => { }) {
    let tester = new Image()
    tester.onload = () => {
      success(image)
    }
    tester.onerror = () => {
      fail(image)
    }
    tester.src = image.img
  },
  testImages(images, success, fail = () => { }) {
    if (images.length === 0) return
    for (let image of images) {
      this.testImage(image, success, fail)
    }
  },
  findFirstWorkingImage(srcs, success, fail = () => { }) {
    if (srcs.length === 0) {
      fail()
      return
    }
    let f = srcs => {
      this.findFirstWorkingImage(srcs.slice(1), success, srcs => {
        f(srcs)
      })
    }
    this.testImage(srcs[0], success, () => {
      f(srcs)
    })
  },
  tryImg(src) {
    return new Promise(resolve => {
      let tester = new Image()
      tester.onload = () => {
        resolve(true)
      }
      tester.src = src
    })
  },
  // strWord = "视频"
  async getWebImages(strWord, { proxy = `${Config.proxy}?`, cacheLife = -1 } = {}) {
    let response = await Helper.proxy(
      `http://image.so.com/j?q=${encodeURIComponent(strWord)}&src=srp&correct=&sn=0&pn=10`,
      {cacheLife})
    let images = [] // images = [{_thumb: "http://...", img: "http://..."}, {...}, {...}]
    if (response && response.list) {
      for (let item of response.list) {
        images.push(item)
      }
    }
    images = images.filter(image => {
      let keep = true
      for (let keyword of this.reject) {
        if (image.img && image.img.includes(keyword)) keep = false
      }
      return keep
    })
    return images
  },
  async getGoogleImages(options) {
    options = Object.assign({
      lang: 'en'
    }, options)

    let html = await Helper.proxy(
      `https://www.google.com/search?q=${options.term.replace(/ /g, '+')}&lr=lang_${options.lang}&safe=active&sout=1&tbas=0&tbm=isch`
    )

    let images = []
    let root = parse(html)
    for (let img of root.querySelectorAll('img').slice(1)) {
      let url = img.parentNode.parentNode.getAttribute('href')
      if (url) url = url.replace('/url?q=', '')
      let src = img.getAttribute('src')
      images.push({ src, url })
    }
    return images
  },
  reject: [
    'jianbihua.cc',
    'nipic',
    '16pic.com',
    'photophoto.cn',
    'pconline',
    'zol.com',
    'youth.cn',
    '58pic.com',
    'sanwen.net',
    'winxuancdn.com',
    'gtimg.com',
    'pic.ibaotu.com',
    'sc.jb51.net',
    'so.qhmsg.com',
    'soso.com',
    'comicyu.com',
    'duitang.com',
    'chachaba.com',
    'qzone.cc',
    'tianjimedia.com',
    'bitauto.com',
    'dzwww.com',
    'pstatp.com',
    'huitu.com'
  ]
}
