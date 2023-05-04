<template>
  
  <div id="jesus-life-content-header">
    <progress
      v-bind:value="event.progress"
      max="100"
      class="jesus-life-content-progress"
    ></progress>
    <table>
      <tbody>
        <tr>
          <th>Events</th>
          <td>
            <ul class="jesus-life-event-list">
              <li
                class="jesus-life-event-list-item"
                v-for="eventName in event.names"
              >
                {{ eventName }}
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <th>Year</th>
          <td class="jesus-life-event-time">{{ event.time }}</td>
        </tr>
        <tr>
          <th>Locations</th>
          <td class="jesus-life-event-place">
            <ul class="jesus-life-event-list">
              <li
                class="jesus-life-event-list-item"
                v-for="place in event.places"
              >
                <div class="place-name">{{ place.name }}</div>
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {

  data() {
    return {
        event: {
          names: [],
          progress: 0,
        },};
  },
}
</script>

<style>
.jesus-life-event-list {
  margin-bottom: 0;
  list-style: none;
}

.jesus-life-event-list-item:nth-child(n+2) {
  margin-top: 1rem;
}


#jesus-life-content-header {
  margin-top: 1rem;
}

#jesus-life-content-header th {
  min-width: 2rem;
}

#jesus-life-content-header th {
  padding: 1rem;
  padding-left: 0;
  padding-right: 0;
  vertical-align: top;
}

#jesus-life-content-header td {
  padding: 1rem;
  padding-right: 0;
  vertical-align: top;
}

</style>