<template>
  <div>
    <canvas></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CustomModels } from '@/babylonscripts/CustomModels';

export default defineComponent({
  name: 'BabylonExamples',
  mounted(){
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    new CustomModels(canvas);
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
