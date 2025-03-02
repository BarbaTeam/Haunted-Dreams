import { Scene, Engine, FreeCamera, Vector3, HemisphericLight, MeshBuilder } from "@babylonjs/core"

export class BasicScene {
    
    scene: Scene;
    engine: Engine;

    constructor(private canvas:HTMLCanvasElement){
        this.engine = new Engine(this.canvas, true);
        this.scene = this.createScene();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
    
    createScene(): Scene {
        const scene = new Scene(this.engine);
        const camera = new FreeCamera('camera1', new Vector3(0, 1, 0), this.scene);
        camera.attachControl();

        const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene);

        hemiLight.intensity = 0.5;

        const ground = MeshBuilder.CreateGround('ground', {width: 50, height: 50}, this.scene);

        const ball = MeshBuilder.CreateSphere('ball', {diameter: 1}, this.scene);
        ball.position.y = 1;
        ball.position.z = 3;


        return scene;
    }
  
}