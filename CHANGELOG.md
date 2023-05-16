# Changelog

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
