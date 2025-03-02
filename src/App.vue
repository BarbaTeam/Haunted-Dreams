<template>
  <BabylonExamples/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BabylonExamples from './components/BabylonExamples.vue';

export default defineComponent({
  name: 'App',
  components: {
    BabylonExamples
  }
});
</script>

<style>

.html, body{
  margin: 0%;
  padding: 0%;
  background-color: rgb(255, 134, 134);
  overflow-y: hidden;
}

#app {
  height: 100vh;
  background-color: black;
}

</style>
