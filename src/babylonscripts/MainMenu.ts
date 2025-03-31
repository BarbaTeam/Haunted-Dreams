import { Scene, Engine, Vector3, MeshBuilder, HemisphericLight, VideoTexture, StandardMaterial, Sound, Mesh } from '@babylonjs/core';
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

        createMenuCamera(scene, canvas);

        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

        const playButton = Button.CreateSimpleButton("playButton", "Jouer");
        playButton.width = "150px";
        playButton.height = "50px";
        playButton.color = "white";
        playButton.thickness = 0;
        playButton.background = "";
        playButton.fontSize = 40;
        playButton.top = "300px";  
        advancedTexture.addControl(playButton); 
        new Sound(
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
        new Sound(
            "",
            "/sons/dark-horror-ambience-296781.mp3",
            this.scene,
            null,
            {
                volume:0.10,
                autoplay: true,
                loop: true,
            })
        new Sound(
            "",
            "/sons/menumusic.mp3",
            this.scene,
            null,
            {
                volume:0.2,
                autoplay:true,
                loop:true,
            })
        

        playButton.onPointerUpObservable.add(() => {
            this.startGame();
        });

        return scene;
    }

    createVideoTexture(menuPlane: Mesh, scene: Scene) {
        const videoTexture = new VideoTexture("videoTexture", ["/videos/main_menu_background.mp4"], scene, true, true);
        videoTexture.video.muted = true;
        videoTexture.video.play();

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
