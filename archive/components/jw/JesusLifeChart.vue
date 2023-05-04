<template>
  <div id="jesus-life-navigation-sections">
    <div
      class="jesus-life-navigation-section"
      v-for="(section, sectionIndex) in sections"
      :data-section-id="sectionIndex"
      :key="`jesus-life-navigation-section-${sectionIndex}`"
    >
      <h2 class="jesus-life-navigation-section-title" v-cloak>
        {{ section.title }}
      </h2>
      <table class="jesus-life-navigation-section-table">
        <tr class="jesus-life">
          <thead>
            <tr>
              <th>Time</th>
              <th>Place</th>
              <th>Events</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-cloak
              class="jesus-life-navigation-section-items"
              v-for="(event, eventIndex) in section.events"
              :key="`jesus-life-navigation-section-items-${eventIndex}`"
              @click="$router.push(`/jesus/${sectionIndex}/${eventIndex}`)"
              v-bind:data-event-id="eventIndex"
            >
              <td class="jesus-life-navigation-section-item-time">
                {{ event.time }}
              </td>
              <td class="jesus-life-navigation-section-item-place">
                {{ event.place }}
              </td>
              <td class="jesus-life-navigation-section-item-title">
                {{ event.title }}
              </td>
            </tr>
          </tbody>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>

export default {
  props: ['sections'],
  data() {
    return {
      
    };
  },
  mounted() {
  },
  methods: {
  },
};
</script>

<style>
.jesus-life-navigation-section-items {
  cursor: pointer;
  background-color: aliceblue;
  border-bottom: 4px solid white;
}

.jesus-life-navigation-section-items td, .jesus-life-navigation-section-items th {
  padding: 1rem 2rem 1rem 1rem;
  position: relative;
}

.jesus-life-navigation-section-items th:first-child, .jesus-life-navigation-section-items td:first-child {
  padding-left: 1rem;
  /* This resets the default behavior */
}

.jesus-life-navigation-section-items td:last-child::after {
  content: '\f078';
  font: normal normal normal 16px/1 octicons;
  text-decoration: none;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: absolute;
  right: 1rem;
  top: calc(50% - (16px / 2));
}

.jesus-life-navigation-section-items td {
  padding: 0.5rem;
  font-size: 0.85rem;
}

.jesus-life-navigation-section-items :last-child {
  padding-right: 2rem;
}

.jesus-life-navigation-section-items:hover {
  background-color: #d1eaff;
}

@media screen and (max-width: 600px) {
  .jesus-life-navigation-section-table thead {
    display: none;
  }
  .jesus-life-navigation-section-items> :nth-last-child(n+2) {
    display: none;
  }
}
</style>