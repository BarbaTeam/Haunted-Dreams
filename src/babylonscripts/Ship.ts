import { Scene, Engine, Vector3, MeshBuilder, SceneLoader, Color4, Sound, StandardMaterial, Texture, Color3 } from '@babylonjs/core';
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
                if (mesh.name == "poste_navigation.screen" || mesh.name == "boussole.screen" || mesh.name == "selecteur_onde.screen") {
                    if (mesh.material) {
                        
                        const material = new StandardMaterial("screenMaterial", this.scene);

                        let texture: Texture;
                        switch (mesh.name) {
                            case "poste_navigation.screen":
                                texture = new Texture("/images/nav_screen.png", this.scene);
                                texture.uScale = 5;  
                                texture.vScale = 5;
                                texture.wAng = -0.5;
                                break;
                            case "boussole.screen":
                                texture = new Texture("/images/bouss_screen.png", this.scene);
                                texture.uScale = 16;  
                                texture.vScale = 16;
                                texture.uOffset = 0.11;
                                texture.vOffset = 0;
                                break;
                            case "selecteur_onde.screen":
                                texture = new Texture("/images/select_screen.png", this.scene);
                                texture.uScale = 5;  
                                texture.vScale = 5;
                                break;
                        }

                        material.diffuseTexture = texture;

                
                        material.specularColor = new Color3(0, 0, 0); //pour enlever la reflexion sinon on voit rien sur lesécrans à cause de alalumière
                    
                
                        mesh.material = material;
                    }
                }
                
            });
        });
        const buzzingSound = new Sound(
            "",
            "/sons/buzzing-sound.wav",
            this.scene,
            null,
            {
                volume:0.05,
                autoplay: true,
                loop: true,
            }
        )
        const backGroundMusic = new Sound(
            "",
            "/sons/horror-ambience-01-66708.mp3",
            this.scene,
            null,
            {
                volume:0.5,
                autoplay: true,
                loop: true,
            }
        )
        
    }

    createGround(): void {
        const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, this.scene);
        ground.position.y = 1; 
        ground.isVisible = false; 
        ground.checkCollisions = true;
    }
}