<router>
  {
    path: '/:l1/:l2/characters',
    meta: {
      title: 'Characters | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content:
            'Chinese characters by HSK level.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main mt-4 mb-4">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div>
            <h2 class="text-center mb-4">Chinese Characters by HSK Level</h2>
            <p class="text-center mb-4">This will take a minute to load...</p>
            <Loader class="mt-5" />
            <table class="table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Character</th>
                  <th>Components</th>
                  <th>Stroke Count</th>
                  <th>Words</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="character in characters">
                  <td>{{ character.hsk }}</td>
                  <td>{{ character.word }}</td>
                  <td>{{ character.radicals }}</td>
                  <td>{{ character.strokeCount }}</td>
                  <td>{{ character.examples.replace(/ /g, ', ') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'

export default {
  async mounted() {
    this.characters = await (await this.$getDictionary()).listCharacters()
  },
  methods: {
    async buildCharactersTable() {
      let characters = await (await this.$getDictionary()).listCharacters()
      for (let character of characters) {
        let h = await (await this.$hanzi).lookupShallow(character.word)
        character = Object.assign(character, h)
        let examples = (await (await this.$getDictionary()).lookupByCharacter(
          character.character
        )).filter(example => example.hsk !== 'outside').sort((a, b) => a.hsk - b.hsk)
        character.examples = [...new Set(examples.map(item => item.simplified))]
        character.radicals = character.decomposition ? character.decomposition.replace(/[⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻？]/g, '') : ''
      }
      return characters
    },
  },
  data() {
    return {
      characters: []
    }
  }
}
</script>

<style lang="scss">
</style>