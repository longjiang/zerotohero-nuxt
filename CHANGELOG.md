# Changelog

## [2.19.0] - 2023-05-21

### Added
- Improved subtitle search and added popular features chart.
- Included Newly Added section to explore-media and popular language pairs.
- Enhanced Russian dictionary with IPA pronunciation and loaded wiktionary words.

### Fixed
- Fixed several bugs including issues with subs fetching, scroll behavior, and word identification in multiple languages.
- Resolved 'mutating prop' error and fixed issues with skin switching and localization.

### Changed
- Refactored YouTubeViewComp and changed data collection start date for What's popular feature.
- Enhanced overlay player subs display and removed reduplicated padding bottom.

### Refactored
- Simplified wordblock attributes and refactored subtitles loading logic in <YouTubeViewComp>.
## [2.18.7] - 2023-05-16
### Added
- Add changelog
- Add version identifier.

### Fixed
- Various bugs in dictionary lookup, tokenizer, tabbed section nav, video seeking, and Arabic lemmatization.
- Styling and layout issues in video player, video details, and admin area.
- Saved words count, Chinese level colors, and new HSK info.
- Error messages, translation strings, radicals, idioms, and word explorer.
- Chinese level colors in popups.
- Mistakes section in the dictionary.

### Improved
- Word lookup, localization, and video admin area.
- Compactness of admin video editing area.
- Allow video hero to be paused.
- Japanese text spacing and non-kanji character display.
- Japanese dictionary lookup.
- Layout and appearance of New HSK list and pop quiz.

### Removed
- PopQuiz feature.

## [2.18.6] - 2023-05-09

### Added
- Allow users to click to move the subs to the top or to the bottom.

### Changed
- Show subs at the bottom.
- Correctly calculate video letterbox.
- Vertically center video in overlay mode.

### Fixed
- Fix transcript mode layout.
- Fix bug: fullscreen mode has space left over.
- VideoWithTranscript: Remove redundant top padding.
- Clean up classes with video view pages.


## [2.18.5] - 2023-05-09

### Added
- Redirect landing page to appropriate language if appropriate.
- YouTube Search: handle channel: and locale: filters.

### Changed
- Refactor Nav component and layout template and CSS.
- New grid-based layout working.

### Fixed
- Take secondary nav from the layout for route-video-view.
- Show sitetopbar on 'full' pages.
- Get mini player to work with other pages.
- Bring back mini player.
- Fix bug: time is not pushed to server for new users (when their server-side time is undefined).
- Fix bug: Chinese dictionary look up suggestion doesn't work when the user types in pinyin without tone marks.
- Fix bug: wiktionary with supplemental langs not loading correctly.
- Fix bug: languages with supplementalLangCode do not load.


## [2.18.4] - 2023-05-07

### Added
- Ability to sort shows from newest to oldest.

### Changed
- Improved go-pro-success page without forcing the user to log out and log in.
- PurchaseStripe: attach user ids to payment links to elevate them to pro.
- Made "TEST" a shared variable defined in utils/variables.js.
- Load or create the user's progress data item upon registration.

### Fixed
- Localizations and styling in WatchHistory, and a potential bug in go-pro.
- Bug: home page "settings" icon throws error since l1 and l2 don't exist.
- Language translations.


## [2.18.3] - 2023-05-05

### Added
- Popular search terms.
- Refresh button above show list.
- Quality assurance checklist page.
- Localized password reset messages.

### Changed
- Dark mode for phrasebook and phrasebook phrase cards.
- Increased spacing between pinyin and text.
- Localize and optimize Gutenberg library.
- YouTubeBrowse refactored and optimized.
- Refactored filters and FilterDropdown.
- Reorganized and cleaned up pages and folders.
- Format user's name differently if they are cjk.
- Load fewer videos at a time for YouTubeBrowse and show episodes list.

### Fixed
- Chinese HSK level browser.
- Dictionary: lookupMultiple looking for index that doesn't exist.
- Popover issues and styles.
- Redirects for English and Chinese courses.
- Wiktionary can't do lookupMultiple.
- ShowCard: if a show has no cover, direct to the show episode list.
- "You need Pro" on overlay subs and positioning.
- Speak component causing language map to crash.
- Admin nav button goes to tutoring.
- Removed unused dependencies and plugin files.
- Deleted archived pages.


## [2.18.2] - 2023-05-04
### Added
- Move site top bar electron css rule to zerotohero.scss, allow users to click on the flag
- Optimize layout for electron
- Create kana index for Japanese
- String translations
- Add links to desktop apps
- Encapsulate RussianLegacy
- Add new electron support

### Changed
- Improve Japanese searching
- Reinstalled all npm packages
- Fix app name in capacitor config
- Use consistent naming for server urls
- Refactor QuickSettings and add logout link
- Refactor SiteTopBar and AnnotationSettings components

### Fixed
- Fix dictionaries: indices don't load
- Fix bug: new variable name broke tokenization
- Newly registered users should not see the dashboard


## [2.18.1] - 2023-05-02
### Added
- Ban more endings for hanja byeonggi
- Use em units for zoom
- ePub reader: display images inside svgs with xlink:href

### Changed
- Revert annotate button to vertical elipsis

### Fixed
- Fix bug: when changing chapters in the ePub reader, sometimes the text of the previous chapter gets annotated and shows up in the current chapter (use a temporary hack (loader) to fix this)
- Fix Korean dictionary bug
- Chinese words now look up normally
- Get fuzzy search to work with substrings
- Resolve console errors

## [2.18.0] - 2023-05-02
### Added
- Add source maps so dev tools don't complain
- Add more compromise inflectors
- Add a limited English inflector
- Add ability to add russian accent marks back
- Add LemmatizationListTokenizer as a fallback
- Add local EnglishTokenizer

### Changed
- Externalize language data into CSVs
- Load translations correctly
- Load hours by raw loader
- Load dPlayer only when livetv is loaded
- Put all language data in one place
- Get rid of "Helper"
- Refactor Kdic-jc
- Refactor edict
- Simplify ChineseDialectDictionary
- Simplify module loading
- Simplify russian dictionary
- Revise dictionary worker method names
- Do not redirect to course home pages
- Use new tokenizer for Klingon dictionary
- Remove dead imports
- Modularize tokenizers
- Start to add tokenization logic back to the dictionary

### Fixed
- Fix Japanese-Chinese dictionary
- Fix bug: freedict can't load words
- Fix bug: wiktionary not loading words
- Fix bug: load the dictionary only once
- Fix bug: forgot to define the inflector in the base dictionary class
- Fix logic with new l1/l2 passing into dictionary, but this is causing pages to freeze
- Fix Russian inflections to work again
- Fix French inflector to work
- Fix bug: jp-conjugations.js is not committed to version control
- Fix Korean Inflector to work
- Get Chinese version of Kengdic to work again
- Get HSK Cedict to work
- Get FreeDict to work

### Removed
- Remove Config
- Remove Helper
- Remove console log


## [2.17.3] - 2023-04-26

### Added
- Ability to rewind/fast-forward 2s in admin mode
- Russian inflectors and tokenizer
- Improved rendering of saved Japanese pronunciation
- Hanja display made more robust
- Korean conjugator loading via script tag in default.vue's head() hook
- Japanese tokenizer
- MediaSearchResults can search for a locale

### Changed
- Use of new inflectors and tokenizers consistently throughout
- Improved Register functionality (flip first/last name in Asian languages)
- Moved jp-conjugations into a folder with a README

### Fixed
- CommonJS export issue
- Various bugs related to tokenization, furigana, and Korean tokenizer
- Vuex mutation errors with findPhrases
- iOS Safari Speak reading out diagnostic info
- BringYourOwnVideo always using light skin


## [2.17.2] - 2023-04-22

### Added
- Caching for ChatGPT
- Epub prompt
- Subtitle dragging functionality for mobile devices

### Changed
- Improved subs search and word lists display
- ShowCard behavior in adminMode
- Constrained moving of subtitles height
- Made subtitles only as wide as needed

### Fixed
- Dark Mode not correctly checked in quick settings
- Various localizations and bug fixes
- VideoWithTranscript: Hiding video info area in mini mode
- Bug fixes related to subtitles

## [2.17.1] - 2023-04-20

### Added
- Keyboard shortcuts to video controls and paginator
- Vernacular names to language lists
- Language name localizations
- Images for unrecognized words in the popup
- New quick settings design

### Changed
- Disabled most zhwiktionary languages due to bad parsing
- Slightly tweaked HSK 5 color
- Improved line spacing in reader and definition/pinyin spacing
- Improved video settings, inline pronunciation display, and transcript typography
- Refactored EpubReader's loadChapter function
- Styling for dark/light themes and various UI tweaks
- Separated translations into multiple files

### Fixed
- Reduce spacing in annotate, Reader should show single line breaks
- Several bugs related to keyboard shortcuts, languages loading, and freezing pages
- Improved display of inline glosses and styled inline definitions
- Various fixes and improvements related to video and transcript functionality
- Fixed Korean word search and implemented new fuzzy search for wiktionary
- Corrected translation of 'Polish'


## [2.17.0] - 2023-04-17

### Added
- Ability to bring the video to fullscreen
- Fullscreen toggle automatically switching to subtitles mode

### Changed
- Allowed bigger text zooms
- Tweak progress bar color
- Renamed video layout related variables for consistency

### Fixed
- Annotated text reflow issue
- Some mobile layout issues
- Mobile Safari allowed to go into full screen
- Fullscreen mode hiding the margin the nav bar leaves off
- Transcript mode toggle not working
- Mini mode

### Removed
- 'Go Pro' button on site top bar to save space

## [2.16.2] - 2023-04-16

### Added
- Remember the same L1 when switching languages.
- Message shown before loading YouTube video iframe in case the user's connection to YouTube is blocked.
- VPN links added.
- Custom CSS variables before loading Bootstrap (recolor all links to green).

### Improved
- Styling for dark/light modes across various components.
- Exclude kids content on home page.
- Resolve language object circularity.
- Improve phrasebook colors and triage L1 select.
- Improved triage, selecting the user's default language if available.
- Translate register and forget password.
- Use the right dark/light logos, string translations, do not show 14-day refund badge for iOS purchases (Apple doesn't refund them), and youneedpro styling for dark/light modes.
- Some Chinese quick gloss is too long.
- Remove jQuery from YouTubeVideo component.
- Improve Kengdic performance by not getting too many phrases.

### Fixed
- Fix bug in FeatureComparison (missing var).
- Fix styling issues across various components in light/dark modes.
- Dark mode optimizations.

## [2.16.1] - 2023-04-16

### Added
- Ability to study Korean from Chinese.

### Improved
- Korean dictionary search speed.


## [2.16.0] - 2023-04-14

### Added
- Dark mode for various pages, including my texts and explore-media.
- Ability to lemmatize Persian and show lemmas in the word block popup.
- Improved tooltip colors.
- Improved horizontal lines appearance.
- Style video controls progress bar and slider.
- Style nav bar and mini player.

### Changed
- Improved lemma-getting.
- Consolidated $primary-color and references to l2Settings.
- Localized quick settings by browser setting.
- Make video hero smaller throughout.

### Fixed
- Fixed bugs related to settings loading, dictionary names, and layout loading.
- Fixed tokenization issues for some traditional texts.
- Fixed color of video controls buttons.
- Restored wordblock 'shine' animation.
- Closed overlay player when switching languages.

## [2.15.3] - 2023-04-12

### Added
- Improved page navigation consistency.
- Ability to assign lesson videos and improved assign interface.
- Nested table of contents in ePub reader.
- Support for various toc/spine item correlations in ePub reader.
- Support for Japanese right-to-left books in ePub reader.
- Ability to read images in ePub and show cover image as a chapter.

### Changed
- Turned off verb underlining.
- Updated pricing.
- Improved lesson assign interface.
- Optimized lesson videos SQL performance.
- Slightly reworded the 'save all' prompt.

### Fixed
- Fixed text zoom and spacing issues in wordblock.
- Fixed page turn behavior in ePub reader.
- Fixed bring-your-video minimizing behavior.
- Fixed bug in assigning lesson videos (adding a video resets matched words).
- Fixed wordblock map kana errors.
- Added safe inset for mobile in the reader.

## [2.15.2] - 2023-04-10

### Added
- ePub reader for beta use.
- Table of contents toggle in the ePub reader.
- Ability to read local ePub files.
- Ability to extract the table of contents from ePub files.
- ePubjs library.

### Changed
- Consolidated reader and user's text.

### Fixed
- Fixed bug in wordblock.
- Fixed ePub reader update process.
- Implemented pagination for ePub content.


## [2.15.1] - 2023-04-09

### Added
- Vue-infinite-loading package and translation strings.
- Restored legacy pricing until Apr 10.

### Changed
- Localize and optimize.
- Handle ChatGPT error and added localizations.
- Improved Hepburn display.
- Added localizations, improved books, and minimal pairs.

### Fixed
- Make sure not to show up 'bring-your-own' videos in history.


## [2.15.0] - 2023-04-09

### Added
- Translation for 'go-pro-success' (a18f07a0, ee9333fc).
- Test mode in PurchaseStripe (89162f8b).
- Subscription renewal reminder (32e457b6).
- Legacy pricing display until Apr 10 (297d09d0).
- Upgraded PayPal pricing (bdcd5165).
- Japanese translations for dictionary results (ce87ff2e).
- New subscription pricing for Stripe (643ad569).

### Changed
- Removed specific price references (f66b488f).
- Disabled PayPal and iOS in-app purchases for non-lifetime plans (94ca407e).
- Styled pricing cards (762536b3).
- Added plan selection and annual subscription handling with Stripe (9a430edd).

### Fixed
- Search subs respecting Pro privileges (797e032a).

### Updated
- Checked subscription status on login (dbb2e933).
- Used Vuex for subscription change monitoring (8f9f2cad).
- Added active subscription check logic (ac6377a5).
- Showed subscription status in Profile (5ae3818f).


## [2.14.2] - 2023-04-07

### Added
- Legacy path support (1c69bba9, f916ad0d).
- Duration badge in YouTube search (fac34ad3).

### Changed
- HSK Cedict tokenization handling (e407b5c6).
- Switched back to Directus VPS (bc40605d).

### Fixed
- Temporarily switched to db2 (c2596a32).
- Duration parsing error (faa1c3ab).

### Reverted
- Route redirects (42941040).


## [2.14.1] - 2023-04-01

### Changed
- Optimize word look up for Chinese.

## [2.14.0] - 2023-04-01

### Added
- Open Local Video: allowing users to play their own videos

### Changed
- Enhanced the handling of lemmatization and tokenization for multiple languages.

### Fixed
- Various bug fixes

## [2.13.0] - 2023-03-25

### Added
- Japanese is now tokenized on the server so users do not need to download the large Kuromoji library
- Improve the display of Japanese text with furigana
- Translations of "app unresponsive" notice

### Fixed
- Various bug fixes

## [2.12.1] - 2023-03-24

### Added
- New features such as the ability to compare similar words and generate stories using ChatGPT, and a new "quiz mode" toggle from settings.
- Localizing the application and adding translations.

### Changed
- Improving the layout and functionality of various pages, including the media home page and history view.
- Refactoring and optimizing code, including the wordblock component, and improving the tokenization and annotation logic in the dictionary.

### Fixed
- Fixing bugs related to saved words and phrases.

# Language Player Changelog

All notable changes to Language Player will be documented in this file. Language Player adheres to the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

## [2.10.1] - 2023-03-16

### Added
- Ability to turn quick gloss on or off
- Ability to choose subtitles search terms

### Fixed
- Bug: Russian accents not showing
- Started Korean grammar feature

## [2.10.0] - 2023-03-12

### Added
- Remember the context where a word is saved and show that context when reviewing words
- Popup dictionary: Ability to save unrecognized words as phrases
- Ability to generate an adhoc wordlist accessible from a public URL with the schema `/learn/adhoc/word1,word2,word3`

### Changed
- Optimized display of grammar notes in annotated text
- Improved video progress bar behavior
- More UI localizations

### Fixed
- Bug fixes and optimizations

## [2.9.3] - 2023-03-05

### Added
- Loading indicator at the Dashboard and Media Home
- Japanese grammar section

## [2.9.2] - 2023-03-04

### Added
- Share button
- Improved look up links in word popups
- Dictionary: Ability to tap the title of the word to quickly toggle phonetics/definitions like a flashcard

## [2.9.1] - 2023-02-19

### Added
- More missing UI localizations
- Improved SRT import

## [2.9.0] - 2023-02-19

### Added
- Ability to learn French and Japanese from Chinese
- More Chinese and Japanese localizations
- Simplified dashboard display
- Refactor UI translation code to make translation easier for additional languages

## [2.8.2] - 2022-12-24

### Added
- Show episodes list: Ability to sort by views (sort by popularity)
- Show popular videos in YouTube channels, music, and movies by default

## [2.8.1] - 2022-12-11

### Added
- Show popular content in YouTube browse
- Feature more popular content on the home page
- Add an import bookmarklet
- Improved quizzes: Paginate through questions

## [2.8.0] - 2022-12-10

### Added
- New feature: Show suggested videos in the video player
- Improvement: Arabic lemmatization

### Fixed
- Bug fixes

## [2.7.2] - 2022-12-09

### Added
- Allow non-admin users to add SRT subs
- Annotate: Add the option for the user to edit annotated text

### Fixed
- Bug fixes

# Language Player Changelog

## [2.7.1] - 2022-12-03

### Added
- Improvement to pagination behavior of saved words in the dictionary

### Fixed
- Bug fixes

## [2.7.0] - 2022-11-28

### Added
- Ability to view auto-generated subtitles

### Fixed
- Bug fixes

## [2.6.0] - 2022-11-26

### Added
- Ability to smooth scroll

### Fixed
- Bug fixes

## [2.5.0] - 2022-11-10

### Added
- Tools for linguists: Phonological features

### Fixed
- Bug fixes

## [2.4.11] - 2022-09-21

### Added
- Popup dictionary: "Close" button sticks to the top right corner when scrolling inside a popup
- Fix bug: Errors on the home page
- Fix bug: Mini player controls should not have a black background

## [2.4.10] - 2022-09-12

### Fixed
- Bug fixes

## [2.4.9] - 2022-09-10

### Added
- Chinese: Show HSK 7-9 grammar notes under annotated text

### Fixed
- Bug fixes

## [2.4.8] - 2022-09-07

### Added
- In the subtitles context menu, show translator links and quick settings
- Japanese: Add wiktionary to popup dictionary entries
- Chinese: Make HSK word lists load faster

### Fixed
- Bug fixes

## [2.4.7] - 2022-08-30

### Fixed
- Fix pop quizzes and text size adjustment
- Other bug fixes

## [2.4.6] - 2022-08-28

### Added
- Improvement: Subtitles search: Add video information button "i"
- Improvements to the Korean dictionary (remove '-' in suffix word head)

### Fixed
- Fix bug: YouTube video loses interactivity after minimizing and maximizing
- Other bug fixes

## [2.4.5] - 2022-08-25

### Added
- Fall 2022 Sale at 50% off

### Fixed
- Fix iOS in-app purchase
- Bug fixes

## [2.4.4] - 2022-08-24

### Added
- Admin feature: Improvements to the Reels mode in Dictionary video search
- Backend: Change PayPal account

### Fixed
- Bug fixes

## [2.4.3] - 2022-08-22

### Improvements
- Video player controls are more spaced out on larger screens
- New settings button to toggle annotation settings, auto-pause, and playback speed

### Updated
- Capacitor updated from version 3 to version 4

### Fixed
- Android back button should navigate back instead of closing the app
- Bug fixes

## [2.4.2] - 2022-08-21

### Added
- New: AutoPause -- pause the video automatically after each line
- Text size is automatically increased to fill the available space, especially on vertical screens (e.g. phones)

### Fixed
- Bug fixes

## [2.4.1] - 2022-08-20

### Added
- Content recommendation based on user's language level and preferred categories

### Improved
- Settings now sync across devices


## [2.3.2] - 2022-08-16
### Changed
- Improvement: Player controls - make controls always visible, add progress bar with time display.

## [2.3.1] - 2022-08-07
### Changed
- Improvement: New video player controls.
- Improvement: Play video in fullscreen by default.
- Improvement: Add legend to language map.
- Bug fixes.

## [2.2.8] - 2022-08-06
### Fixed
- Bug fixes.

## [2.2.7] - 2022-08-03
### Changed
- Remove jquery 1.4 from the korean_conjugations package due to security warnings from Google Play.

### Fixed
- Bug fixes and internal features.

## [2.2.6] - 2022-08-02
### Changed
- Improvement: Improve home page layout and add some Chinese-translated text on the home page.

### Fixed
- Bug fixes for Android app.

## [2.2.5] - 2022-08-01
### Added
- Android app release in the Google Play store.

### Fixed
- Bug fixes.

## [2.2.4] - 2022-07-31
### Changed
- Improvement: Swedish and Estonian popup dictionary are much better at finding root words.
- Improvement: Subtitles search - Subtitles do not flicker as much during playback.
- Improvement: A redesigned homepage with an intro video.
- Improvement: Users are automatically imported into MailerLite upon registration.

### Added
- New admin feature: Subtitles search now can be viewed in "reels mode" for a quick screen recording for Instagram Reels.

## [2.2.3] - 2022-07-27
### Added
- New: TV Shows and YouTube Channels now display the locale of the video, e.g. French (France) vs French (Canada).

### Changed
- Improvement: Feedback button now lets you fill out a form instead of opening the email client directly.
- Improvement: Videos that are unavailable or of the wrong language have been removed.

### Fixed
- Bug fix: Spanish section often crashes due to large dictionary size.
- Bug fixes.

## [2.2.2] - 2022-07-24
### Added
- New: Learning path now has links to phrasebook for the lower levels.
- New: Video player now displays how many views, likes, comments the video has, as well as the locale of the video, e.g. French (France), French (Canada).

### Changed
- Improvement: Quick settings popup now has a link to the full settings page.


## [2.2.1] - 2022-07-22
### Added
- New UI: Redesigned navigation bar and top bar, as well as better, more abstract backgrounds that change every day.

### Changed
- Improvement: Better English-Chinese dictionary, which can now work with multi-word phrases.

### Fixed
- Bug fixes.

## [1.1.17] - 2022-07-19
### Added
- New: Browse videos by popularity. (Korean, Cantonese, Russian, German, and Japanese).
- New: TV shows and YouTube channel thumbnails now show up as "decks" - better visual appeal.

### Improved
- Arabic popup dictionary now finds dictionary forms (lemmas) much better.
- Feedback button.
- Navigation menu is now restructured and simplified (extra items grouped under 'more').
- Video search now allows you to search inside videos.

### Fixed
- Bug fix: English-English dictionary was too large and often crashed, now the size is smaller and more stable.
- Other bug fixes.

## [1.1.16] - 2022-07-13
### Added
- New: Pop up quizzes inside video transcript.
- New: Name changed from "Zero to Hero" to "Language Player".

### Improved
- Explore (the Media section's home page) now loads much faster.

## [1.1.15] - 2022-07-12
### Improved
- Live TV now works again in Chrome.

### Fixed
- Bug fixes.

## [1.1.14] - 2022-07-10
### Changed
- Improvement: After the user purchases pro, automatically log them out and prompt them to log in.

### Fixed
- Bug fixes.


## [1.1.13] - 2022-07-09
### Added
- New: Chinese popup dictionary now shows phrases that contain this word.
- New: Chinese popup dictionary now automatically looks up other Chinese words that are mentioned in the definition.

### Fixed
- Bug fixes.

## [1.1.12] - 2022-07-07
### Added
- New: Simplified language selection with two simple questions: which language are you learning, and what language do you speak.

### Improved
- Learning path gets a design upgrade.
- Dictionary video search (captions search) is much faster and consumes only a fraction of the bandwidth.
- Learning path cards are more clear with action buttons.
- Explore (Media section's home page) now shows recently played videos in a "Continue Watching" section.

### Fixed
- Bug fixes.

## [1.1.11] - 2022-07-03
### Added
- New: A kids section showing content made for kids.

### Improved
- Media section's navigation items are consolidated into just four. Categories that are not shown are grouped under a "topics" dropdown.
- Icons are now upgraded to Font Awesome 6 Pro.

## [1.1.10] - 2022-07-02
### Added
- New: Turn off auto pronunciation. If you don't like hearing the word pronounced to you automatically, you can now turn it off in settings.

### Improved
- Full menu item names annotated text side menu.
- Video player now animates when being minimized.

### Fixed
- Bug fixes.

## [1.1.9] - 2022-07-01
### Added
- New: Play a random movie, music, or song. In movies, music, and songs, you can play a random video by pressing the "random" button next to the filter bar.

### Improved
- Quick Gloss does not show long definitions. When you save a word, a short definition appears next to the saved word. We now hide Quick Gloss that's too long.
- Expanded video filtering. When filtering videos and the result set is empty, we now suggest other videos you can watch that match the keywords.

### Changed
- End Quiz shown in full by default.
- Users can no longer add videos to the library.
- Collocations can no longer be saved.
- Hide Video Hero on mobile layouts.
- Video Hero is muted by default.

### Fixed
- Bug fixes.

## [1.1.8] - 2022-06-30
### Changed
- Live TV only works in Safari and in the native app. This is possibly due to a recent change in Chrome/Firefox.

### Improved
- More helpful error messages. If an error occurs, the error message gives you the option to go back or go to the dashboard. It also gives you the ability to file a "one-click bug report".
- Dashboard icon in the site top bar.
- Auto-redirect to Dashboard. When you open the app, if you have already logged in, you are automatically redirected to the Dashboard.


## [1.1.7] - 2022-06-29
### Improved
- Resuming paused text-to-speech mid-sentence. In Reader and in Books, if you press the "play" button, then pause, then "play" again, previously the text would play from the beginning of the highlighted sentence. Now it will resume from wherever you've paused it, even if it's mid-sentence.
- Translation highlight syncing. In Reader and in Books, sometimes the translation line highlighting is out of sync. Tapping on the correct translation line now puts it back in sync.

### Changed
- Plain text editor in Reader. The WYSIWYG editor was too buggy so we decided to revert back to the plain text editor (markdown is still allowed).

### Fixed
- Refactoring, performance improvements, and bug fixes.

## [1.1.6] - 2022-06-27
### Added
- New feature: find content that matches your level. TV shows, YouTube channels, and audiobooks are now labeled by the level of difficulty based on lexical diversity (Chinese, German, English, Spanish, French, and Arabic only).
- New feature: filter TV shows, YouTube channels, and audiobooks by subject tag.
- New feature: find TV shows, YouTube channels, and audiobooks that are made for kids.

### Improved
- YouTube player "minimize" and "close" icons should not obstruct the video.
- Separate our "on-boarding" landing page (with video intro) and the logged-in users' dashboard, so returning users do not see promotional messages every time.
- Login, register, and password reset pages now have a top bar with a back button.

### Fixed
- Bug fixes.

## [1.1.5] - 2022-06-26
### Added
- New feature: iOS users can now upgrade to Pro via in-app purchase.

### Changed
- Update Chinese Zero to Hero intro video.

## [1.1.4] - 2022-06-24
### Added
- New feature: users can delete their account.

### Changed
- Cleaner top bar -- annotation settings in the top bar are now grouped under a cog icon, remove 'forward' button.
- Media home page sectioned re-ordered to reflect content popularity.
- Reader now uses markdown by default rather than WYSIWYG, which is buggy.
- Add an intro video to the home screen.

### Fixed
- Bug fixes.


## [1.1.3] - 2022-06-20
### Changed
- Use a new logo that looks like a play button with a speech bubble on top and a globe at the bottom.

### Added
- New feature: in Reading > Reader and in Reading > Books, when you tap on a sentence, that sentence is highlighted, and the corresponding translation of that line is also highlighted.

### Improved
- Better Chinese UI translations.

## [1.1.2] - 2022-06-19
### Improved
- Smart History: When you launch the app or website, we now automatically redirect you where you were the last time you used it. If you were reading page 17 of the Great Gatsby in Reading > Books, for example, we will automatically redirect you back to that page next time you log on.

## [1.1.1] - 2022-06-19
### Improved
- Faster dictionary lookup for languages that use Wiktionary (French, Spanish, English, German, Italian, etc.).
- iOS: make it easier to "reactivate" the app after it's been inactive for a while.
- On mobile layouts, the bottom navigation bar is now always visible.

## [1.1.0] - 2022-06-19
### Added
- New feature: Quick Gloss - When you save a word, a short definition of the word appears next to the word.
- New feature: Dictionary - A new "Phrases" tab now shows multi-word phrases that contain this word (available for German, Italian, French, and Spanish).

### Improved
- Phrasebooks: popular and commonly used phrasebooks are now featured on the top.
- Media > Songs: the videos shown on the page are more random, rather than always showing the same set.
- On mobile layouts, the top navigation bar is now always visible.
- Media > All: Bring back the media browse interface, move the feed to a new nav item: Media > Feed.

### Fixed
- Bug fixes.

## [1.0.19] - 2022-06-10
### Added
- New feature: My Bookshelf - Now you can save books to your bookshelf and continue reading where you've left off.
- New feature: Web Reader - Read web pages by entering a URL.

### Improved
- Reader: Make URL sharing easier, better reader layout for Wikipedia text, improved appearance of links, pagination can go to an arbitrary page.

### Fixed
- Bug fixes.

## [1.0.18] - 2022-06-09
### Added
- New feature: Reader and My Text - Logged-in users can save multiple texts and read them later.
- New feature: Reader now uses a rich-text editor.

### Fixed
- Bug fixes and refactoring.

## [1.0.17] - 2022-06-08
### Added
- New feature: See live TV channel recommendations in Feed.

### Improved
- Reader: Improve vocabulary list layout.
- Popup Dictionary: Word lemma with gloss should be shown first before conjugated forms.
- Live TV styling and layout.

### Fixed
- Bug fixes and refactoring.


## [1.0.16] - 2022-06-07
### Added
- New feature: Password reset - Users can now retrieve lost passwords.

### Fixed
- Bug fixes, performance gains, and refactoring.

## [1.0.15] - 2022-06-05
### Added
- New feature: Feed - See an infinite scroll of various recommended content, including videos and word cards.
- New feature: Reader - Now long documents will be broken up into pages.

### Improved
- New Noto serif font from Google Fonts in serif mode.

### Fixed
- Bug fixes.

## [1.0.14] - 2022-06-04
### Added
- New feature: Stats - Now you can see exactly how many videos we have across languages, updated live.

### Improved
- Popup Dictionary should respect accents (e.g. when looking up French word réserve, the first result should not be réservé. French is accent-sensitive).

### Fixed
- Bug fixes.

## [1.0.13] - 2022-06-02
### Changed
- Quizzes in video player: Aggregate all quizzes to the end of the video rather than popping up many times in the transcript.
- Video transcript: Show line breaks within each line (for example, in the case of music lyrics). Increase translation font size in the video transcript.
- Reader: Do not show Speak bar unless the browser/device supports text-to-speech in that language.
- Navigation bar: Move "Courses" ahead of "Media" (English and Chinese languages only).

### Fixed
- Bug fixes.


## [1.0.12] - 2022-05-30
### Added
- Reader: You can now create a shareable link by tapping on the "share" icon in the toolbar.
- Reader: Show vocabulary list at the end, show links to many different online translators.
- Books and Reader: The text-to-speech bar now has a speed adjustment button to allow you to adjust the rate of speech.
- Profile & progress: Add the ability to remove languages from your dashboard, show your saved words and watch history.
- Top bar: You can now adjust text sizes by tapping on the big T or the small T.
- Video Player: Add a "share" button below the video title.
- Chinese Dictionary: Create a separate tab for "Mistakes".
- Home page: Add an app store badge.

### Fixed
- Bug fixes: Text-to-speech bar isn't reading some numbers or punctuations, Chinese dictionary tabs messed up, Chinese dictionary error messages, and many other bugs.

## [1.0.11] - 2022-05-29
### Changed
- Video lists: Make video thumbnails smaller on phones so they show up as two columns.
- Reader: Add speech bar.
- Nav bar: Regroup and simplify navigation to only 5 menu items (or 6 items for Chinese and English).
- Language switch: Show dashboard on top, then 9 common languages, followed by all other languages.
- Home screen: New layout featuring 8 common languages, add login and logout links.

### Fixed
- Bug fixes: User cannot register; time autologging on multiple devices may overwrite one another.

## [1.0.10] - 2022-05-28
### Added
- Video player: Episode navigation bar can better handle large shows with more than 100 episodes.

### Improved
- Improve performance by making fewer networking calls when loading videos and shows.
- Disqus discussion: Merge discussions for all languages into a single discussion board.

### Fixed
- Bug fixes.

## [1.0.9] - 2022-05-28
### Added
- Inline translation: Tap on "..." next to any line, then from the menu tap the translation icon, then the translation will appear next to the current line.
- Add privacy policy.

### Fixed
- Bug fixes.
