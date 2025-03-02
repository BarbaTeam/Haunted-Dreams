import { Scene, Engine, UniversalCamera, Vector3, MeshBuilder, SceneLoader, Color4 } from '@babylonjs/core';
import "@babylonjs/loaders"

export class CustomModels {
    
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
        
        this.createCamera();
            
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
    }

    createGround(): void {
        const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, this.scene);
        ground.position.y = 1; 
        ground.isVisible = false; 
        ground.checkCollisions = true;
    }

    createCamera(): void {
        const camera = new UniversalCamera("UniversalCamera", new Vector3(0, 11, 0), this.scene);
            camera.setTarget(new Vector3(0, 11, 10));
            camera.applyGravity = true;
            camera.checkCollisions = true;
            camera.attachControl(this.canvas, true);
            camera.ellipsoid = new Vector3(3, 5, 3);
            camera.inertia = 0.8;
            camera.speed = 1.5;
            camera.fov = 1.3;
            //AZERTY (hexa)
            camera.keysUp.push(90);
            camera.keysDown.push(83);
            camera.keysRight.push(68);
            camera.keysLeft.push(81);
    }

    
}