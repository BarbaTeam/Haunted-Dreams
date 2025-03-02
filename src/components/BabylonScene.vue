<template>
    <canvas></canvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Ship } from '@/babylonScripts/Ship';
import { MainMenu } from '@/babylonScripts/MainMenu';

export default defineComponent({
  name: 'BabylonScene',
  mounted(){
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    new MainMenu(canvas);
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas{
  width: 100%;
  height: 100%;
}
</style>