import { Scene, Engine, Vector3, MeshBuilder, HemisphericLight, VideoTexture, StandardMaterial, Sound, Mesh } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import { createMenuCamera } from './Camera';
import { Ship } from './Ship';
import "@babylonjs/loaders";

export class MainMenu {
    
    scene: Scene;
    engine: Engine;
    canvas: HTMLCanvasElement;

    private language ="fr"; 
    private subtitlesEnabled = true;

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

        const menuPlane = MeshBuilder.CreatePlane("menuPlane", { width:24, height:13 }, scene);
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
        playButton.top = "250px";  
        advancedTexture.addControl(playButton);

        const languageButton = Button.CreateSimpleButton("languageButton", "Langue: Français");
        languageButton.width = "400px";
        languageButton.height = "50px";
        languageButton.color = "white";
        languageButton.thickness = 0;
        languageButton.background = "";
        languageButton.fontSize = 20;
        languageButton.top = "350px";
        advancedTexture.addControl(languageButton);

        const subtitlesButton = Button.CreateSimpleButton("subtitlesButton", "Sous-titres: Activés");
        subtitlesButton.width = "400px";
        subtitlesButton.height = "50px";
        subtitlesButton.color = "white";
        subtitlesButton.thickness = 0;
        subtitlesButton.background = "";
        subtitlesButton.fontSize = 20;
        subtitlesButton.top = "400px";
        advancedTexture.addControl(subtitlesButton);

        new Sound("", "sons/buzzing-sound.wav", this.scene, null, { volume: 0.05, autoplay: true, loop: true });
        new Sound("", "sons/dark-horror-ambience-296781.mp3", this.scene, null, { volume: 0.10, autoplay: true, loop: true });
        new Sound("", "sons/menumusic.mp3", this.scene, null, { volume: 0.2, autoplay: true, loop: true });

        playButton.onPointerUpObservable.add(() => {
            this.startGame();
        });

        languageButton.onPointerUpObservable.add(() => {
            this.toggleLanguage(languageButton);
        });

        subtitlesButton.onPointerUpObservable.add(() => {
            this.toggleSubtitles(subtitlesButton);
        });

        return scene;
    }

    createVideoTexture(menuPlane: Mesh, scene: Scene) {
        const videoTexture = new VideoTexture("videoTexture", ["videos/main_menu_background.mp4"], scene, true, true);
        videoTexture.video.muted = true;
        videoTexture.video.play();

        const videoMaterial = new StandardMaterial("videoMaterial", scene);
        videoMaterial.diffuseTexture = videoTexture;  
        videoMaterial.emissiveTexture = videoTexture;  
        videoTexture.uScale = 1;
        videoTexture.vScale = -1;
        menuPlane.material = videoMaterial;
    }

    toggleLanguage(languageButton: Button) {
        if (this.language === "fr") {
            this.language = "en";
            languageButton.textBlock!.text = "Langue: Anglais";
        } else {
            this.language = "fr";
            languageButton.textBlock!.text = "Langue: Français";
        }
    }

    toggleSubtitles(subtitlesButton: Button) {
        this.subtitlesEnabled = !this.subtitlesEnabled;
        subtitlesButton.textBlock!.text = `Sous-titres: ${this.subtitlesEnabled ? "Activés" : "Désactivés"}`;
    }

    startGame() {
        console.log("Le jeu commence !");
        console.log(`Langue sélectionnée: ${this.language}`);
        console.log(`Sous-titres activés: ${this.subtitlesEnabled}`);

        this.scene.dispose();

        new Ship(this.canvas, this.language, this.subtitlesEnabled);
    }
}
