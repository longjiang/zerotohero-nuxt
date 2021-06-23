import Papa from 'papaparse'
import axios from 'axios'

export default {
  name: 'ecdict',
  lang: undefined,
  file: undefined,
  frequencyFile: undefined,
  frequencyAdded: false,
  words: [],
  frequency: [],
  index: {},
  cache: {},
  tables: [],
  levels: {
    1: 'Pre-A1',
    2: 'A1',
    3: 'A2',
    4: 'B1',
    5: 'B2',
    6: 'C1',
    7: 'C2'
  },
  load(lang) {
    console.log('Loading ECDICT...')
    this.lang = lang
    const server = 'https://server.chinesezerotohero.com/'
    this.file = `${server}data/ecdict/ecdict-longer-ranked.csv.txt`
    this.touchstoneFile = `${server}data/ecdict/touchstone.csv.txt`
    this.frequencyFile = `${server}data/ecdict/frequency.csv.txt`
    return new Promise(async resolve => {
      let promises = [this.loadWords(), this.loadFrequency()]
      await Promise.all(promises)
      this.addIdToWords()
      // this.addFrequencyToWords()
      // this.addFrequencyToPhrases()
      this.assignLevels()
      // console.log(Papa.unparse(this.words))
      resolve(this)
    })
  },
  async loadWords() {
    console.log('Loading words...')
    let res = await axios.get(this.file)
    let results = await Papa.parse(res.data, {
      header: true
    })
    for (let index in results.data) {
      let row = results.data[index]
      let word = row
      word = this.augment(row)
      this.words.push(word)
    }
    console.log('Words loaded.')
  },
  async loadFrequency() {
    console.log('Loading word frequency list...')
    let res = await axios.get(this.frequencyFile)
    let results = await Papa.parse(res.data, {
      header: true
    })
    this.frequency = results.data.map(row => row.word)
  },
  getIelts1400() {
    return this.ielts1400
  },
  addIdToWords() {
    for (let index in this.words) {
      let word = this.words[index]
      word.id = index
    }
  },
  addFrequencyToWords() {
    console.log('Adding frequency to words')
    for (let word of this.words) {
      if (!word.word.includes(' ')) {
        let rank = -1
        rank = this.findRank(word.word)
        word.rank = rank !== -1 ? rank : this.frequency.length
      }
    }
  },
  addFrequencyToPhrases() {
    console.log('adding frequency to phrases')
    if (!this.frequencyAdded) {
      for (let word of this.words.filter(word => word.word.includes(' ') || word.word.includes('-'))) {
        if (word.word.includes(' ') || word.word.includes('-')) {
          let ranks = []
          for (let part of word.word.split(/[ -]/g)) {
            let partRank = this.findRank(part)
            if (partRank === -1) {
              ranks.push(this.frequency.length)
              break
            } else {
              ranks.push(partRank)
            }
          }
          word.rank = Math.pow(Math.max(...ranks), 1.3)
        }
      }
      this.frequencyAdded = true
    }
  },
  maxRank() {
    return this.frequency.length
  },
  assignLevels() {
    let c1 = 10000
    let b2 = c1 / 2
    let b1 = c1 / 2 / 2
    let a2 = c1 / 2 / 2 / 2
    let a1 = c1 / 2 / 2 / 2 / 2
    let zero = c1 / 2 / 2 / 2 / 2 / 2
    for (let word of this.words) {
      word.level = this.levels[7]
      if (word.rank < c1) {
        word.level = this.levels[6]
      }
      if (word.rank < b2) {
        word.level = this.levels[5]
      }
      if (word.rank < b1) {
        word.level = this.levels[4]
      }
      if (word.rank < a2) {
        word.level = this.levels[3]
      }
      if (word.rank < a1) {
        word.level = this.levels[2]
      }
      if (word.rank < zero) {
        word.level = this.levels[1]
      }
    }
  },
  credit() {
    return '英汉词典由<a href="https://github.com/skywind3000/ECDICT">ECDICT</a>提供, 开源并以<a href="https://github.com/skywind3000/ECDICT/blob/master/LICENSE">MIT License</a>发行。'
  },
  f(results) {
    let words = results.data.filter(row => {
      return (row.phonetic.length > 0 && row.frq > 0)
    }).sort((a, b) => b.word.length - a.word.length)
    let csv = Papa.unparse(words)
    console.log(csv)
  },
  /* Returns the longest word in the dictionary that is inside `text` */
  longest(text) {
    text = text.toLowerCase()
    return this.words.find(row => text.includes(row.word.toLowerCase()))
  },
  findPhrases(text) {
    text = text.toLowerCase()
    let phrases = []
    for (let row of this.words.filter(row => row.word.includes(' '))) {
      if (text.includes(row.word.toLowerCase())) {
        phrases.push(row)
      }
    }
    return phrases
  },
  loadTouchstone() {
    console.log('Loading Touchtone...')
    return new Promise(resolve => {
      Papa.parse(this.touchstoneFile, {
        download: true,
        header: true,
        complete: results => {
          for (let index in results.data) {
            let row = results.data[index]
            this.words.push(this.augment(row))
          }
          console.log('Touchtone loaded.')
          resolve()
        }
      })
    })
  },
  augment(row, id) {
    let word = {
      id: id,
      bare: row.word,
      accented: row.word,
      head: row.word,
      pronunciation: row.phonetic,
      definitions: row.translation ? row.translation.split('\\n') : [],
      pos: row.pos,
      extra: row
    }
    if (row.level) {
      word.book = parseInt(row.level)
      word.level = this.levels[parseInt(row.level)]
    }
    return Object.assign(row, word)
  },
  findRank(word) {
    return this.frequency.indexOf(word.toLowerCase())
  },
  get(id) {
    return this.words[id]
  },
  lookup(text) {
    let word = this.words.find(word => word && word.bare.toLowerCase() === text.toLowerCase())
    return word
  },
  lookupMultiple(text) {
    let words = this.words.filter(word => word && word.bare.toLowerCase() === text.toLowerCase())
    return words
  },
  formTable() {
    return this.tables
  },
  wordForms(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word.bare
    }]
    if (word) {
      for (let table of this.formTable()) {
        for (let field of table.fields) {
          if (word[table.name] && word[table.name][field]) {
            for (let form of word[table.name][field].split(',')) {
              forms.push({
                table: table.name,
                field: field,
                form: form.trim()
              })
            }
          }
        }
      }
    }
    return forms
  },
  lookupByDef(text, limit = 30) {
    text = text.toLowerCase()
    let words = this.words
      .filter(word => word.definitions.join(', ').toLowerCase().includes(text))
      .slice(0, limit)
    return words
  },
  lookupFuzzy(text, limit = 30) { // text = 'abcde'
    text = text.toLowerCase()
    let words = []
    let subtexts = []
    for (let i = 1; text.length - i > 3; i++) {
      subtexts.push(text.substring(0, text.length - i))
    }
    for (let word of this.words) {
      let head = word.head ? word.head.toLowerCase() : undefined
      if (head && head.startsWith(text)) {
        words.push(
          Object.assign(
            { score: text.length - (head.length - text.length) },
            word
          )
        ) // matches 'abcde', 'abcde...'
      }
      if (head && text.includes(head)) {
        words.push(Object.assign({ score: head.length - text.length - 4 }, word)) // matches 'cde', 'abc'
      }
      if (head && head.includes(text)) {
        words.push(Object.assign({ score: text.length - (head.length - text.length) - 4 }, word)) // matches 'XXXabcdeWWW'
      }
      for (let subtext of subtexts) {
        if (head && head.includes(subtext)) {
          words.push(
            Object.assign(
              { score: subtext.length - (head.length - subtext.length) },
              word
            )
          ) // matches 'abcxyz...'
        }
      }
    }
    for (let word of words) {
      if (word.book) {
        word.score = word.score + 7 - word.book
      }
    }
    return this.uniqueByValue(words, 'id').sort((a, b) => b.score - a.score).slice(0, limit)
  },
  uniqueByValue(array, key) {
    let flags = []
    let unique = []
    let l = array.length
    for (let i = 0; i < l; i++) {
      if (flags[array[i][key]]) continue
      flags[array[i][key]] = true
      unique.push(array[i])
    }
    return unique
  },
  randomArrayItem(array, start = 0, length = false) {
    length = length || array.length
    array = array.slice(start, length)
    let index = Math.floor(Math.random() * array.length)
    return array[index]
  },
  //https://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
  randomProperty(obj) {
    var keys = Object.keys(obj)
    return obj[keys[(keys.length * Math.random()) << 0]]
  },
  random() {
    return this.randomProperty(this.words)
  },
  accent(text) {
    return text.replace(/'/g, '́')
  },
  stylize(name) {
    const stylize = {
      adjectives: 'adjective',
      incomparable: 'incomparable',
      short_f: 'short (fem.)',
      short_m: 'short (masc.)',
      short_n: 'short (neut.)',
      short_pl: 'short plural',
      superlative: 'superlative',
      conjugations: 'conjugation',
      pl1: 'мы',
      pl2: 'вы',
      pl3: 'они',
      sg1: 'я',
      sg2: 'ты',
      sg3: 'он/она',
      declensions: 'declension',
      decl_sg: 'singular',
      decl_pl: 'plural',
      decl_f: 'feminine',
      decl_m: 'masculine',
      decl_n: 'neuter',
      acc: 'accusative',
      dat: 'dative',
      gen: 'genitive',
      inst: 'instrumental',
      nom: 'nominative',
      prep: 'prepositional',
      verbs: '',
      aspect: 'aspect',
      imperative_pl: 'imperative plural',
      imperative_sg: 'imperative singular',
      partner: 'partner',
      past_f: 'past tense (feminine)',
      past_m: 'past tense (masculine)',
      past_n: 'past tense (neuter)',
      past_pl: 'past tense (plural)'
    }
    return stylize[name]
  },
  ielts1400: `abashed
abate
abbreviate
abdicate
abduct
abhor
abhorrent
ablaze
aboriginal
abortive
abound
abrasion
abridge
absolve
absorbing
abstain
abstinence
abstraction
abstruse
accentuate
accomplice
accost
acoustic
acquisitive
acquit
acrid
acrimonious
acrimony
acumen
adage
adaptable
addicted
additive
adept
adherent
adhesive
adjoin
adjoining
adjourn
adjunct
admonish
adobe
adorn
adroit
aerobic
affable
affinity
afflict
afflicting
aghast
agile
agility
agonize
agrarian
alchemist
alga
alkali
allay
allegiance
allegory
altruism
alumnus
amalgamate
amazed
amenable
amicable
amino
ammonia
anatomy
annihilate
annotate
annoyed
annul
anomalous
anomaly
anthropology
antiquity
antiseptic
apathetic
aperture
apex
apparel
apprehend
apprehension
aquarium
aquatic
arable
arbitrator
archaeology
archaic
ardor
arduous
arid
aroma
artisan
ascending
ascent
ascetic
aspersion
assiduous
assuage
asteroid
astonished
astound
astute
atheism
attrition
audition
aura
auspice
auspicious
austerity
autocrat
avalanche
avarice
avaricious
aviator
avid
avow
baby-sit
Babylonian
balk
balmy
bandit
banish
barbarian
barricade
barter
bashful
bask
baste
beaver
becoming
befuddle
beget
begrudge
beguile
belie
believer
belittle
belligerent
benefactor
bent
bequest
berate
bereave
bestow
bicker
bidding
bigoted
bison
bland
blemish
blessed
blip
bliss
blizzard
bog
bombastic
bonanza
boon
boredom
boulder
boundless
brawl
brim
brittle
budge
burgeon
burnish
burrow
byword
cactus
calamity
calculus
caliber
camouflage
cannibalism
canny
canopy
canyon
capacious
captivate
captivity
cardiac
caribou
carnage
carnal
carnivore
carp
cartilage
cascade
cassette
castigate
cataclysm
catalyst
catching
categorical
caterpillar
caustic
cavern
ceaseless
celebrated
celestial
censure
centennial
ceremonious
chafe
charcoal
charisma
chary
chaste
chide
chiefly
chilled
chimpanzee
chirp
chlorine
choreographer
chromosome
chronical
chuckle
cipher
circuitous
circumference
circumscribe
circumspect
circumvent
clam
clamor
clandestine
cleft
clinch
clipper
clot
clump
clutter
coax
coddle
cogent
cohere
collaborator
collateral
colloquial
colossal
combustible
commodious
communal
composed
composure
compulsive
conciliatory
concoct
concur
concurrence
condiment
condone
conductivity
cone
confederacy
confiscate
confound
congenial
congested
congestion
congressman
congruity
conjure
connivance
connive
connoisseur
consecrate
conservatory
consonant
consort
constellation
constrict
constricted
construe
contemptuous
continuum
contour
contravene
contrite
convection
corona
corpulent
corroborate
corrosive
countless
courteous
covetous
cower
crafty
cramped
crater
credulous
creed
creek
crest
crevice
crippling
crisscross
critique
crooked
crumple
crusade
crustacean
cryptic
culpable
cultivated
cumbersome
cuneiform
cursory
curt
dab
dagger
dangle
dank
dated
dauntless
daze
dazzling
debatable
decadence
deceitful
deciduous
decipher
declaim
declivity
decode
decompose
decorum
decry
defame
deference
deferential
defile
definitive
deflect
deform
defraud
deft
defunct
deity
dejected
deleterious
deliberately
delineate
delta
demise
demolish
demur
deprecate
derange
deride
deserted
despicable
despoil
destine
detest
detract
devious
devoid
devoted
devout
dexterous
diagonal
dictatorial
diction
dignified
digress
dilate
diminutive
dingy
disadvantage
disarming
disarrange
disarray
disband
disburse
discernible
disciple
disclaim
discrete
discretion
disdain
disfigure
disgrace
disinterested
dismal
disparage
dispensable
disprove
disreputable
disrespectful
dissect
dissemble
disseminate
dissimilar
dissimulate
dissipate
distillation
distressed
disunite
diverge
divergent
diversification
divulge
documentation
dogmatic
doleful
domineering
dominion
doomed
dormant
downcast
downhearted
drizzle
drowsy
ductile
dungeon
dusky
dwindle
Easter
ebb
economize
ecstasy
edifice
edify
efface
effectuate
effuse
elation
elliptical
elm
elucidate
elude
elusive
emaciate
emaciated
embalm
embellish
embezzle
emblem
embroider
embryo
emerald
empower
encase
enchant
encompass
encroach
encumber
endangered
energize
enervate
engaging
engender
engraving
engross
engrossed
engulf
enigma
enigmatic
enrage
enrapture
enslave
entangle
enthrall
entice
entitled
entrap
enumerate
enunciate
enzyme
ephemeral
epitomize
equilibrium
equivocal
equivocate
erratic
eschew
estimable
euphonious
exacting
exalt
exalted
exasperate
excavate
exhale
exhilarating
exhume
exodus
exorbitant
expedient
expedite
expeditious
expound
extant
extemporaneous
extenuate
exterminate
extol
extraneous
extricate
exude
exultant
eyewitness
facade
facetious
facile
factious
Fahrenheit
fallible
famish
fanatic
fanaticism
farce
fatalism
fateful
fatuous
faucet
fauna
favored
feign
ferment
fermentation
ferocious
ferret
fertilize
fervent
fester
fetter
feud
feudal
fickle
fictitious
fidelity
figment
figurehead
filthy
fin
finch
fishy
fitful
fitting
flagellum
flake
flask
flavoring
flay
flicker
flighty
flimsy
flint
flora
flounder
flout
fluffy
fluster
flux
foliage
foment
forage
forefront
forerunner
foreshorten
forestall
forlorn
forsake
forte
forthright
fortitude
fortress
fortuitous
fowl
frail
fraternal
fraught
fray
frenzy
fresco
fret
frigid
frugal
fulminate
fungus
fussy
fuzzy
gabble
gainful
gainsay
gale
gallant
gallop
garb
garner
garnish
gaseous
gash
gauche
gem
gemstone
genesis
genetics
genial
genteel
gentility
gentry
germinate
gibe
gild
gin
giraffe
girder
girdle
gist
glacial
glaring
glaze
glean
gleeful
glorify
glossy
gnaw
gorilla
Gothic
gourd
gradient
grading
granite
granular
grasshopper
gratify
gratuitous
gravel
gravitational
grazing
gregarious
grievance
grieved
grimly
groom
grouchy
grudge
grumble
grumpy
guileless
guise
gull
gush
habitually
hackneyed
haggle
haphazard
hardheaded
harry
hatchet
haughty
headstrong
hearsay
heed
heedless
heredity
heresy
hew
hideous
hieroglyph
hilarious
hilarity
hind
hinterland
hoarse
hoax
holocaust
homage
homestead
homicide
homing
hominid
hormone
hubbub
hue
hummingbird
hump
husbandry
hustle
hydrothermal
hypothesize
idealize
idiocy
idiosyncrasy
idyllic
ignoble
ignominious
illegible
illegitimate
illustrious
imbibe
imbue
immature
immobile
immortal
immutable
impale
impartial
impassioned
impassive
impeach
impeccable
impel
impending
impermeable
impersonal
impertinent
impervious
impetuous
implicate
impotence
impressionism
imprint
impropriety
improvident
improvise
imprudent
impunity
impure
impurity
impute
inactivate
inactive
inanimate
incapacitate
incense
inception
incessant
incessantly
incinerate
incipient
incisive
incite
incoherent
incompatible
incompetent
inconceivable
incongruity
incongruous
inconspicuous
inconvenient
incorruptible
incredulity
incriminate
incubate
incursion
indecent
indefatigable
indemnity
indent
indigent
indigestion
indignity
indolent
indomitable
ineligible
inept
inert
inevitably
infallible
infamous
infancy
inflammation
inflexible
influx
infrared
infuse
innate
inordinate
inscribe
insinuate
insolent
instigate
instill
insufferable
insufficient
insular
insulin
intercede
intercept
interject
interlude
internship
interplay
intersect
intersection
interstellar
intoxicate
intoxication
intrepid
intriguing
inure
invalidate
inverse
invertebrate
invocation
invoke
irreconcilable
irrelevant
irrepressible
irreproachable
irresistible
irresolute
irreverent
irrevocable
isolated
itinerant
jeer
jellyfish
jolt
jumble
juncture
Jupiter
justly
ken
kennel
kernel
kerosene
kiln
kindle
kinetic
labyrinth
lament
landmass
languid
languish
larva
latent
Latin
laud
laudable
laureate
laurel
lava
leash
ledge
leftover
legible
legislature
lethal
lethargy
lettuce
liaison
lichen
limestone
limpid
linguist
lipid
listless
lithe
lithosphere
lizard
loath
loathe
locomotion
lubricant
lull
lumber
lurk
lush
luster
lusty
luxuriant
maglev
magma
magnesium
maim
malady
malcontent
malevolent
malign
malleable
mammals
mammoth
mangle
mania
manifold
mantle
manure
marked
mason
mast
matchless
maxim
maze
meager
meander
mechanist
meddle
mediocre
meditative
meek
melodic
melting
membrane
menial
mercantile
meteor
meteorite
meteorology
methane
metropolis
microbe
microorganism
microprocessor
millennium
mime
mimic
mimicry
miser
miserly
misgiving
mishap
mitigate
modeling
modem
modulate
moisten
mollify
molten
morbid
moron
mosaic
moth
motif
mottled
muddle
mundane
munificent
mural
musicologist
mutation
myriad
naturalist
nectar
neoclassical
neolithic
neon
neutron
newsletter
nibble
niche
nimble
nocturnal
nomadic
nostalgia
notate
noted
novice
noxious
null
nutriment
oasis
obliging
oblivion
oblivious
observance
obsolete
obstinate
oceanographer
octopus
offhand
olfactory
onslaught
ooze
opal
opulence
oracle
oration
orchid
originally
oust
outrageously
outspoken
outwit
overbearing
oyster
pacify
packed
paddle
painstaking
palatable
palate
panacea
pancreas
paramount
paraphrase
parasitic
pathology
patronizing
pebble
pedagogy
peerless
penal
penchant
pendant
penicillin
pensive
penury
percussion
perennial
peripheral
perishable
pertain
pertinent
pervasive
pervert
petrify
pheromone
phonetics
photosynthesis
physiology
pictorial
pigment
pilferage
pinpoint
pious
pitiful
pivot
pivotal
placate
placid
plankton
plaster
platitude
playwright
pliable
plumb
plump
pointed
pollen
pollinate
polygon
ponderous
pore
porous
posit
posterity
potassium
potter
practically
prairie
precipitate
preclude
precursor
predominantly
preeminent
prehistoric
prelude
preponderance
presumptuous
pretension
pretentious
prevailing
primal
primate
probity
prod
prodigal
prodigious
profane
profess
profoundly
profuse
prohibitively
proliferate
prolific
prolonged
pronounced
propensity
proponent
propriety
proscribe
protract
protrude
provident
proxy
prudent
prune
psychoanalysis
puddle
pueblo
pulp
puncture
pungent
puppet
purge
quaint
qualified
quarry
quartz
quasar
queer
quell
quilt
racket
radius
raft
rainfall
ransom
rapacious
rapture
rashly
ravage
ravenous
ravish
rayon
raze
rebate
rebuke
receptacle
receptor
recluse
recoil
recollection
rectangle
reddish
redeem
redress
reef
refined
refreshing
refrigerate
refurbish
regenerate
regimen
reimburse
reiterate
rejuvenate
relapse
relatively
relieved
relinquish
remains
remit
remodel
rend
renounce
repertory
replenish
replicate
reptile
repudiate
repulse
repulsive
residue
resin
resolved
resonance
respiration
restricted
retard
retract
revere
reverence
revert
revitalize
revoke
rhinoceros
rhyme
rite
roam
rodent
rodeo
roe
rudimentary
rugged
rumble
ruminate
rupture
rustic
sac
salamander
salient
sallow
sanity
sapphire
sardonic
satiate
satiric
Saturn
savings
savor
scanty
scarf
scavenger
scoop
scorch
scruffy
scruple
scrupulous
scuba
sculpt
scurry
sear
seasoning
seclusion
secrete
secretion
sedate
sedentary
sediment
seep
seismic
seismograph
seismology
sensory
sensuous
sequoia
serene
serenity
sermon
sever
sewage
shackle
sharply
shear
sheathe
shovel
shroud
shuffle
shun
sieve
silica
silly
silt
simmer
simultaneously
singe
sinuous
situated
skeletal
skimpy
slacken
slag
slander
slant
sled
sledding
slog
sloppy
sloth
slovenly
slug
sluggish
slumber
sly
smear
smoothly
smother
snag
sneer
snowflake
sojourn
solder
solicitous
soprano
soybean
sparse
spawn
specialized
spew
spineless
spinning
spiny
spleen
sporadic
spout
sprout
spun
spurt
squabble
squander
squash
squeak
squid
squirrel
squirt
stagecoach
staggered
staggering
stamina
starch
startling
stash
statistics
stature
steadfast
stellar
sterile
stew
stingy
stocky
stodgy
stratum
strenuous
stringent
stunt
stylistic
stylized
subdue
subjection
sublimate
subsist
subspecies
substantiate
substantive
subvert
succinct
succumb
suffragist
suffuse
sullen
sunlit
supersede
supplant
supple
surmise
surmount
sustained
sustenance
swan
swarm
sweeping
syllable
synchronize
synopsis
syrup
tacit
tactics
tally
tamper
tantalize
tardy
tarnish
taunt
tectonics
tedium
teem
telegraph
temperance
temperate
tenacious
tendon
tenement
tentacle
tenuous
tepid
terminology
terrestrial
thaw
throng
thump
thwart
tilted
tingle
tint
titanic
topography
topsoil
torment
torpid
torrent
torturous
touching
touchy
towering
tractable
traitor
trample
transact
transfix
transitory
translucent
transpire
traverse
treason
tremor
trepidation
tributary
trifling
trot
troupe
trudge
tundra
turnpike
twig
twine
twinkling
tycoon
ultimatum
ultraviolet
unaided
unanimity
unbecoming
unbiased
unblemished
uncanny
unconscious
unconsolidated
unconventional
undaunted
underscore
unearth
uneven
unfair
unfortunately
unparalleled
unpredictable
unravel
unruly
unseemly
unshaken
unsubstantiated
untamed
untapped
upheaval
uppermost
uproar
utilitarian
vacate
valiant
valor
vanquish
varnish
vascular
vault
vehemence
vehement
venerate
vertebrate
vestige
vex
vigilant
vindicate
violently
viral
vulgarity
waddle
wade
wag
wand
wane
warily
warp
wasp
watercourse
waver
weathering
wheedle
whim
whir
whit
wick
willful
willow
wispy
wistful
worldly
wrath
wring
wry
X-ray
yarn
yeast
yelp
yen
yogurt
zinc`.split("\n")
}