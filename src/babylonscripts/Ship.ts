import { Scene, Engine, Vector3, MeshBuilder, SceneLoader, Color4, Sound } from '@babylonjs/core';
import { createFPSCamera } from './Camera';
import "@babylonjs/loaders"

export class Ship {
    
    scene: Scene;
    engine: Engine;

    constructor(private canvas:HTMLCanvasElement){
        this.engine = new Engine(this.canvas, true);
        this.scene = this.createScene();
        this.createSpaceShip();
        this.createGround();

        const isLocked = false;
        // On click event, request pointer lock
        this.scene.onPointerDown = function (evt) {
            //true/false check if we're locked, faster than checking pointerlock on each single click.
            if (!isLocked) {
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
        };

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
    
    createScene(): Scene {
        const scene = new Scene(this.engine);
            scene.clearColor = new Color4(0, 0, 0, 1); //ciel noir
            scene.gravity = new Vector3(0, -.75, 0);
            scene.collisionsEnabled = true;
            scene.enablePhysics();
        
        createFPSCamera(scene, this.canvas);
            
        return scene;
    }

    createSpaceShip(): void {
        SceneLoader.ImportMeshAsync("", "/models/", "spaceship.glb", this.scene).then((result) => {
            const spaceship = result.meshes[0]; // Le vaisseau est le premier (et seul ?) mesh importé

            console.log("Le vaisseau est bien chargé");
            
            spaceship.checkCollisions = true; 
            spaceship.getChildMeshes().forEach(mesh => {
                console.log(mesh.name);
                mesh.checkCollisions = true;
                //if(mesh.name == "spaceship.walls.type2" || mesh.name == "spaceship.walls.type2.001" ){
                //    mesh.showBoundingBox = true;
                //}

            });
        });
        new Sound(
                    "",
                    "/sons/horror-ambience-01-66708.mp3",
                    this.scene,
                    null,
                    {
                        volume:0,
                        autoplay: true,
                    }
                ).setVolume(1,30);
        
    }

    createGround(): void {
        const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, this.scene);
        ground.position.y = 1; 
        ground.isVisible = false; 
        ground.checkCollisions = true;
    }
}