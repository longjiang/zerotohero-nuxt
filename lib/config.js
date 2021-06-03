// const dictionaryServer = 'http://hsk-server.local:8888/'
const dictionaryServer = 'https://server.chinesezerotohero.com/'

// const lrcServer = 'http://lyrics-search.local:8888/'
const lrcServer = 'https://lyrics-search.chinesezerotohero.com/'

export default {
  server: dictionaryServer,
  lrcServer: lrcServer,
  sketchEngineProxy: dictionaryServer + 'sketch-engine-proxy.php',
  proxy: dictionaryServer + 'proxy.php',
  jsonProxy: dictionaryServer + 'json-proxy.php',
  scrape: dictionaryServer + 'scrape.php',
  scrape2: dictionaryServer + 'scrape2.php',
  imageProxy: dictionaryServer + 'image.php',
  listPhotos: dictionaryServer + 'list-photos.php',
  savePhoto: dictionaryServer + 'save-photo.php',
  youtubeVideo: dictionaryServer + 'youtube-video.php',
  youtubePlaylist: dictionaryServer + 'youtube-playlist.php',
  youtubeChannelPlaylists: dictionaryServer + 'youtube-channel-playlists.php',
  imageUrl: dictionaryServer + 'img/words/',
  animatedSvgUrl: dictionaryServer + 'data/svgs/',
  lrcSearch: lrcServer + 'lrc/search/',
  wiki: 'https://db.zerotohero.ca/_/',
  wikiAdmin: 'https://db.zerotohero.ca/admin/#/',
  reject: {
    en: ['m', 's', 't', 'll', 'd', 're', 'ain', 'don']
  },
  approvedChannels: {
    en: [
      'UC6ZFN9Tx6xh-skXCuRHCDpQ', // PBS News Hour
      'UCrNnk0wFBnCS1awGjq_ijGQ', // PBS Kids
      'UCpVm7bg6pXKo1Pr6k5kxG9A', // National Geographic
      'UCNIFiHaLZkYASaWDdkC1njg', // A&E
      'UCLXo7UDZvByw2ixzpQCufnA', // Netflix
      'UCWOA1ZGywLbqmigxE4Qlvuw', // Netflix
      'UCKBnlTTgEnhIXv_c4LvvyMQ', // Own
      'UC9MAhZQQd9egwWCxrwSIsJQ', // History
      'UCe4TiRe3lU6kGVr9S3_2SCA', // Dance Moms
      'UCpYF_3dMxbTukeCG2GsgPbA', // Lifetime
      'UCf5CjDJvsFvtVIhkfmKAwAA', // MGM
      'UCx-KWLTKlB83hDI6UKECtJQ', // HBO
      'UCz_BJGTYrM4ntr7vsrsjfLw', // Filmrise
      'UC8Y-jrV8oR3s2Ix4viDkZtA', // Food Network
      'UCttMm3hHlDSqXGYmp7tqrEA', // Kitchen Nightmares
      'UC9tPS5igk3NOyDP0XLX96bw', // Duck Dynasty
      'UCw7SNYrYei7F5ttQO3o-rpA', // Disney
      'UCqf2gzmKtH3PaAbt-qgFFsw', // TLC
      'UCUsN5ZwHx2kILm84-jPDeXw', // Comedy Central
      'UCktaw9L-f65LzUUdjmCFkbQ', // Disney XD
      'UCUMZ7gohGI9HcU9VNsr2FJQ', // Bloomberg
      'UCThv5tYUVaG4ZPA3p6EXZbQ', // GoldSilver (w/ Mike Maloney)
      'UC2s0uKOc2WgB9eGta7cUUEA', // Washington Week PBS
      'UCwbwG_xm4Hhr-laGtzRux7Q', // Kansas City PBS
      'UCc99RaVe8PKgly2T3QNBWLw', // CUNY TV
      // 'UC0H7JADShpxWDjGQ4WhXPtQ', // Chicago Tonight (CC not matching)
    ],
    ja: [
      'UCR3m00HNhMGIxabCD1O-U2g',
      'UCceP1tpeVepBaxL8uhiCTRw',
      'UCWzenZSy9GJBcPzdSm-UX5w',
      'UCp1fVYjQEn9g1RB0VPWAjQQ',
      'UCqVDpXKLmKeBU_yyt_QkItQ',
      'UC_SI1j1d8vJo_rYMV5o_dRg',
      'UCxRVqCt8EUsiCjNycqKO_1A',
      'UCeVgoYp7d_JeWytBNpuA81A',
      'UCPL0Z9UArMSQBKKbqnmsphw',
    ],
    zh: [
      'UCUhpu5MJQ_bjPkXO00jyxsw', // iQiyi
      'UCYQPTeY3HOk0BprrGuCWCaA', // YouKu
      'UCiu3bj4rR8KOYcUA4KNkOAA', // WeTV
      'UCQatgKoA7lylp_UzvsLCgcw', // Tencent Video
      'UCmalSiRq25rjrpycAsS5ocA', // MangoTV
      'UCTulSfEm1c14WWRbSN-CNAQ', // MGTV Drama
      'UCW22wyIZecX1xgY4BkdRcbQ', // VSO Movie Channel
      'UCLsMbqJe_Oeqm6r9tvP1Nkg', // Clip Box
      'UCcLK3j-XWdGBnt5bR9NJHaQ', // CCTV
      'UCjnJ4buqbnpRVaT3IDUQPZQ', // CCTV chun wan
      'UCU5qmd5NvJljDBeM1sD-D1A', // Q1Q2
      'UCTF6rwqpN-QgtNK1ROAXu6g', // Q1Q2
      'UC7ACqIQiy1SkjglQQ6bWDRg', // 捷成华视 Idol & Romance
      'UCKn4SloJmZYNYNq6RgzgrHw', // NewTV
      'UCPh1aKtroMioOCPHTGPwUBQ', // Classic
      'UChqXUTNBOnIaBEU7K6Le6FA', // 邓小平
      'UCShvs7P4CMTGzHTmEwZRcHQ', // 茶馆
      'UCIZwFGOBwV1wOvCaRMIgNRQ', // 地道战
      'UCEWBSXNFMVBc7p79dtIh3HA', // 刘罗锅
      'UC8a4CRn6S5Yq2wEJ07B70OA', // 刘罗锅
      'UC7Vl0YiY0rDlovqcCFN4yTA', // CCTV 电视剧
      'UCdpiId0eJGnnIvfhpbJIM1w', // 腾讯动漫
      'UC2B9maQhihZed6ovrnK1cBA', // MZTV Exclusive Chinese Drama
      'UCNORTw_uosRNGgdEjwdHvuw', // 大劇獨播MZTV
      'UC0jYsshDZfOBZC9nIJn94Cg', // China Zone
      'UCteBLoijWzlVFSR5BBtS_2Q', // 优优独播剧场 YoYo Television Series Exclusive
      'UCLsrDKheyHv7GYsTkMaw2bw', // 优优青春剧场 YoYo fun station
      'UC5-YbNL-MUy1_tC9KSkEShw', // Caravan中文剧场
      'UCPIRD4yr1hlAEovBCSNlAKg', // Croton MEGA HIT
      'UC7VY0GWLswq_Z48nkETL-yA', // Chinese Drama
      'UC3cbVxXQ-p-auBRVhGCmUmQ', // 华录百納熱播劇場
      'UCMVaFMIJmL3kZ_RKYKd-aUg', // YoYo Television Series
      'UCyNIsMH1AhDFTnwIM9E92rQ', // 山河令
      'UC_U4WI3M0edEV5u1EHKcrsg', // YoYo Fun
      'UC3PKcYXUAhao3p4kuNS4_9w', // 腾讯经典剧场
      'UCVm75cj78njo38Izz_suQQA',
      'UCWiS6QxFGFK-LKwwHzSsmHQ',
      'UCAMrnDQlsPnrScHun5PgrXw',
      'UCCxMNXfmWlukwNRRxPO-P9A',
      'UCR3JG231i5rbq8NnM9Gp02Q',
      'UCRhpQlky8kT9ZtJ7WnH_3Wg',
      'UCYRLiAiyyRc-fRqdm2MaXzg',
      'UCfPmFrdqNLD-HFJpfjBs1Cg',
      'UCFSdTm2FE4BDThV3omA4UIA',
      'UC9M9sV3sGmutY26H4LNBTww',
      'UCQFyMGc6h30NMCd6HCk0ZPA',
      'UCE2UHXGOlqotRJgEWl_tiMw',
      'UCm6MXIlUFRv9-CBBGMNVf5w',
      'UCzc59v10qvwWRPrYoWUKEvQ',
      'UC9z0EFa_NEPdxIFIsm7_qzQ',
      'UC6KKrL5yrRBkUoHsFxVQlVg',
      'UCnHYtTFmgGodIWiRlc-mIGQ',
      'UCw1JmgFeYe9fDnjM05E2FQg',
      'UCcaKuPzlS9MXgMjHqtlZlDA',
      'UCUuZe7OB0yHSYAfu8annGKQ',
      'UCstdo3fo9H04nFVyaj2Bkew',
      'UClpQ52tidfcwbFhwjuzrWLg',
      'UCU1QlsCKFBmE_wf6CGU5tvg',
      'UC-Y1Dbb0wwmUrOc3nyvPlhA', // 鬼吹灯
      'UCMa54YqvXp23R6onUCj5Sjg', // 脑海深处
      'UCvprguYo0gxOHi5YzSk7t9g', // 花火
      'UC3UUwfyntghfisq02q5v2tw', // YoYo English Channel
      'UCjVzBodPWE3BOwHIfzTkirA', // YOUHUG MEDIA Official Channel
      'UCeOHXaUp7kGDtu1ChW_KNgg',
    ],
    ru: [
      'UCl0lW3ojU3ERRNwu3fSIiUQ'
    ],
    vi: [
      'UCNAny2p6H5iiQN7udvCLbKg',
      'UC7EzhxEvDQXWxYaxV95qfnA',
      'UCZQoLxHa2Wjt0aAGbfhmgqg',
    ],
    ko: [
      'UC5BMQOsAB8hKUyHu9KI6yig',
      'UCIq7cqgQRXTXBQurJSeJJ9w',
      'UCNK0-1KNIwowKzZu6tSjqsw',
      'UCDMIbQQ1seltE6H__f2x3Tw',
      'UC6_wEAVJZzG2pxZOEFi_SJA',
      'UClLfeGqYIROod6D_ux7k2wQ',
      'UCMIclL_bqlsiy2eP6tNfORw',
      'UCh_CAEhnquDzq94_gBfx6ig',
      'UCXRQDRtCbHJUO3DO6ND-qNA'
    ]
  },
  talkChannels: {
    en: [
      'UC3R-xanNgtoa8b7gpVexVlA', // Smarthistory
      'UC9HKTT8bRKKoWYvjajPWnzQ', // Mystic Books
      'UCkZOdSgatxupQJfvWUz610g', // Audiobooks
      'UCAuUUnT6oDeKwE6v1NGQxug', // TED
      'UCf099SXtegD4kv9-M3GIgnw',
      'UCT2tOnAEBBt2GtkLmlPtviw',
      'UCYbZIbExoclrrOKx79y2H4g',
      'UCFxsheTIDqQb6-9iaiL0Wog',
      'UCPtGRJgv2klUy25peVli7tw',
      'UCeOUU5JlBHKbreahdaFxCmA',
      'UCg2Zur8LbbsDEMicvGBSLsg'
    ],
    zh: [
      'UCKFB_rVEFEF3l-onQGvGx1A', // 一席
      'UC1pGI-x2n70SuOIIykOlT9A', // 食谱
      'UCQEF54z0aOwpV2EtRsh6t_Q', // 易学族
      'UCulFhrW_YCwkq_BP16C82mA', // 一条
      'UCXWW8rllT5OQwSmeqaLcKYg', // 装修攻略
      'UCSs4A6HYKmHA2MG_0z-F0xw', // 李永乐老师
      'UC2Zqo6npCEH079SjnZ84v4g', // 课程
      'UCJsq4QYu9BaxXDk0qR8Ms3w', // 食谱
      'UCENJEn-rZ9VUrXw4krJwFsQ', // 大山
      'UCM33VtveeEmfA6LC7tH30Xw', // 袁腾飞
      'UCbi-ZrTUyuReTqPpqVGJ8pg', // 锵锵三人行
      'UCLROLAN8kmU7tGQDs6KH-bQ', // 妈咪说
      'UCg0m_Ah8P_MQbnn77-vYnYw', // 厨师长
    ],
    ja: [],
    ru: [],
    ko: []
  }
}
