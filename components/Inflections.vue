<template>
  <div class="container">
    <div v-for="(conjugation, term) in data" :key="term" class="mt-4">
      <h5>{{ formatField(term) }}</h5>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="width: 150px;">Field</th>
              <th>Form</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in conjugation" :key="item.field">
              <td>{{ formatField(item.field) }}</td>
              <td>{{ item.form }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatField(field) {
      // Convert camelCase to words
      let result = field.replace(/([A-Z])/g, ' $1');
      
      // Convert the first character of each word to uppercase
      return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    }
  }
}
</script>
