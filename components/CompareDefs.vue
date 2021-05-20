<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12 text-center definitions">
        <Merge direction="top" class="h-half d-none d-sm-block" />
        <DefinitionsList :definitions="defCommon" nodef="(no common definitions)" class="mt-2 mb-2"></DefinitionsList>
        <Merge direction="bottom" class="h-half d-none d-sm-block" />
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-6 text-center">
        <DefinitionsList :definitions="defDistinct.a"></DefinitionsList>
      </div>
      <div class="col-6 text-center">
        <DefinitionsList :definitions="defDistinct.b"></DefinitionsList>
      </div>
    </div>
  </div>
</template>

<script>
import DefinitionsList from '@/components/DefinitionsList.vue'
import Merge from '@/components/Merge'

export default {
  components: {
    DefinitionsList,
    Merge
  },
  props: ['a', 'b'],
  data() {
    return {
      defCommon: [],
      defDistinct: {
        a: [],
        b: []
      }
    }
  },
  mounted() {
    this.common(this.a, this.b)
  },
  methods: {
    defListIncludes(defList, def) {
      return defList.find(d => def.includes(d))
    },
    common(a, b) {
      for (let adef of a.definitions) {
        for (let bdef of b.definitions) {
          if (bdef && bdef.includes(adef)) {
            this.defCommon.push(bdef)
          } else if (adef && adef.includes(bdef)) {
            this.defCommon.push(adef)
          }
        }
      }
      for (let adef of a.definitions) {
        if (!this.defListIncludes(this.defCommon, adef))
          this.defDistinct.a.push(adef)
      }
      for (let adef of b.definitions) {
        if (!this.defListIncludes(this.defCommon, adef))
          this.defDistinct.b.push(adef)
      }
      // not in this.defCommon
    }
  }
}
</script>
