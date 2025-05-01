import { Scene, Engine, Vector3, MeshBuilder, HemisphericLight, VideoTexture, StandardMaterial, Sound, Mesh } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";
import { createMenuCamera } from './Camera';
import { Ship } from './Ship';
import "@babylonjs/loaders";

type Language = 'fr' | 'en';

export class MainMenu {
    scene: Scene;
    engine: Engine;
    canvas: HTMLCanvasElement;

    private subtitlesEnabled = true;
    private keyBindings: { [action: string]: string } = {
        "Forward": "z",
        "Backward": "s",
        "Left": "q",
        "Right": "d"
    };

    private mainMenuButtons: Button[] = [];

    private language: Language = "en";

    private texts: Record<Language, {
        play: string;
        settings: string;
        language: string;
        subtitles: string;
        back: string;
        keys: string;
    }> = {
        fr: {
            play: "Jouer",
            settings: "Paramètres",
            language: "Langue: Français",
            subtitles: "Sous-titres: Activés",
            back: "Retour",
            keys: "Touches"
        },
        en: {
            play: "Play",
            settings: "Settings",
            language: "Language: English",
            subtitles: "Subtitles: Enabled",
            back: "Back",
            keys: "Keys"
        }
    };
    
    constructor(private _canvas: HTMLCanvasElement) {
        this.canvas = _canvas;
        this.engine = new Engine(this.canvas, true);
        this.scene = this.createMenuScene(this.engine, this.canvas);

        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());
    }

    private createMenuScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
        const scene = new Scene(engine);

        const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
        light.intensity = 0.2;

        const menuPlane = MeshBuilder.CreatePlane("menuPlane", { width: 24, height: 13 }, scene);
        menuPlane.position = new Vector3(0, 0, 0);
        this.createVideoTexture(menuPlane, scene);

        createMenuCamera(scene, canvas);

        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
        this.createMainMenuUI(advancedTexture);

        new Sound("", "sons/buzzing-sound.wav", scene, null, { volume: 0.05, autoplay: true, loop: true });
        new Sound("", "sons/dark-horror-ambience-296781.mp3", scene, null, { volume: 0.10, autoplay: true, loop: true });
        new Sound("", "sons/menumusic.mp3", scene, null, { volume: 0.2, autoplay: true, loop: true });

        return scene;
    }

    private createVideoTexture(menuPlane: Mesh, scene: Scene): void {
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

    private createMainMenuUI(advancedTexture: AdvancedDynamicTexture): void {
        const playButton = this.createButton("playButton", this.texts[this.language].play, "250px", "150px", "50px", 50);
        playButton.onPointerUpObservable.add(() => this.startGame());
        advancedTexture.addControl(playButton);

        const settingsButton = this.createButton("settingsButton", this.texts[this.language].settings, "350px", "200px", "50px", 20);
        settingsButton.onPointerUpObservable.add(() => this.showSettingsMenu(advancedTexture));
        advancedTexture.addControl(settingsButton);

        this.mainMenuButtons = [playButton, settingsButton];
    }

    private showSettingsMenu(advancedTexture: AdvancedDynamicTexture): void {
        this.mainMenuButtons.forEach(btn => advancedTexture.removeControl(btn));
        const inputFields: Button[] = [];

        const languageButton = this.createButton("languageButton", this.texts[this.language].language, "-40px");
        languageButton.onPointerUpObservable.add(() => this.toggleLanguage(languageButton));
        advancedTexture.addControl(languageButton);
        inputFields.push(languageButton);

        const subtitlesButton = this.createButton("subtitlesButton", this.texts[this.language].subtitles, "10px");
        subtitlesButton.onPointerUpObservable.add(() => this.toggleSubtitles(subtitlesButton));
        advancedTexture.addControl(subtitlesButton);
        inputFields.push(subtitlesButton);

        const mappingTitle = this.createButton("mappingTitle", this.texts[this.language].keys, "80px", "200px", "50px", 20);
        mappingTitle.isEnabled = false;
        advancedTexture.addControl(mappingTitle);
        inputFields.push(mappingTitle);

        Object.keys(this.keyBindings).forEach((action, i) => {
            const inputButton = this.createButton(`${action}Button`, `${action}: ${this.keyBindings[action].toUpperCase()}`, `${130 + i * 50}px`);
            inputButton.onPointerUpObservable.add(() => {
                inputButton.textBlock!.text = `${action}: _`;
                const onKeyDown = (event: KeyboardEvent) => {
                    this.keyBindings[action] = event.key.toLowerCase();
                    inputButton.textBlock!.text = `${action}: ${event.key.toUpperCase()}`;
                    window.removeEventListener("keydown", onKeyDown);
                };
                window.addEventListener("keydown", onKeyDown);
            });
            advancedTexture.addControl(inputButton);
            inputFields.push(inputButton);
        });

        const backButton = this.createButton("backButton", this.texts[this.language].back, "350px", "150px", "40px");
        backButton.onPointerUpObservable.add(() => {
            inputFields.forEach(field => advancedTexture.removeControl(field));
            advancedTexture.removeControl(backButton);
            this.createMainMenuUI(advancedTexture);
        });
        advancedTexture.addControl(backButton);
    }

    private createButton(id: string, text: string, top: string, width = "400px", height = "50px", fontSize = 20): Button {
        const button = Button.CreateSimpleButton(id, text);
        button.width = width;
        button.height = height;
        button.color = "white";
        button.thickness = 0;
        button.background = "";
        button.fontSize = fontSize;
        button.top = top;
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.left = "40px";
        if (button.textBlock) {
            button.textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            button.textBlock.paddingLeft = "20px"; 
        }
        return button;
    }

    private toggleLanguage(languageButton: Button): void {
        this.language = this.language === "en" ? "fr" : "en";
        languageButton.textBlock!.text = this.texts[this.language].language;
        this.mainMenuButtons.forEach(btn => {
            if (btn.name === "playButton") btn.textBlock!.text = this.texts[this.language].play;
            if (btn.name === "settingsButton") btn.textBlock!.text = this.texts[this.language].settings;
        });
    }

    private toggleSubtitles(subtitlesButton: Button): void {
        this.subtitlesEnabled = !this.subtitlesEnabled;
        subtitlesButton.textBlock!.text = `Sous-titres: ${this.subtitlesEnabled ? "Activés" : "Désactivés"}`;
    }

    private startGame(): void {
        console.log("Le jeu commence !");
        console.log(`Langue sélectionnée: ${this.language}`);
        console.log(`Sous-titres activés: ${this.subtitlesEnabled}`);
        console.log(`Touch Bindings:`, this.keyBindings);

        this.scene.dispose();
        new Ship(this.canvas, this.language, this.subtitlesEnabled, this.keyBindings);
    }
}
