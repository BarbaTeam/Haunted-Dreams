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
#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
