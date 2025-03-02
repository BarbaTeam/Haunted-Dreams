import { Scene, Engine, Vector3, MeshBuilder, HemisphericLight, VideoTexture, StandardMaterial } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import { createMenuCamera } from './Camera';
import { Ship } from './Ship';
import "@babylonjs/loaders";

export class MainMenu {
    
    scene: Scene;
    engine: Engine;
    canvas: HTMLCanvasElement;

    constructor(private _canvas: HTMLCanvasElement) {
        this.canvas = _canvas;
        this.engine = new Engine(this.canvas, true);
        this.scene = this.createMenuScene(this.engine, this.canvas);

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    createMenuScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
        const scene = new Scene(engine);

        const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
        light.intensity = 0.2;

        const menuPlane = MeshBuilder.CreatePlane("menuPlane", { width:24,height:13 }, scene);
        menuPlane.position = new Vector3(0, 0, 0);  
        this.createVideoTexture(menuPlane, scene);

        const camera = createMenuCamera(scene, canvas);

        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

        const playButton = Button.CreateSimpleButton("playButton", "Jouer");
        playButton.width = "150px";
        playButton.height = "50px";
        playButton.color = "white";
        playButton.background = "green";
        playButton.fontSize = 24;
        playButton.top = "300px";  
        advancedTexture.addControl(playButton); 

        playButton.onPointerUpObservable.add(() => {
            this.startGame();
        });

        return scene;
    }

    createVideoTexture(menuPlane: any, scene: Scene) {
        const videoTexture = new VideoTexture("videoTexture", ["/videos/main_menu_background.mp4"], scene, true, true);
        videoTexture.video.muted = true;

        const videoMaterial = new StandardMaterial("videoMaterial", scene);
        videoMaterial.diffuseTexture = videoTexture;  
        videoMaterial.emissiveTexture = videoTexture;  
        videoTexture.uScale = 1;
        videoTexture.vScale = -1;
        menuPlane.material = videoMaterial;
    }

    startGame() {
        console.log("Le jeu commence !");
        
        this.scene.dispose();

        new Ship(this.canvas);
    }
}
