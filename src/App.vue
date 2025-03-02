<template>
  <BabylonScene/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BabylonScene from './components/BabylonScene.vue';

export default defineComponent({
  name: 'App',
  components: {
    BabylonScene
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
