import { 
    Scene, Engine, Vector3, MeshBuilder, SceneLoader, Color4, Sound, StandardMaterial, 
    Color3, DynamicTexture, AbstractMesh, 
    ActionManager,
    ExecuteCodeAction,
    Matrix
} from '@babylonjs/core';
import { createFPSCamera } from './Camera';
import "@babylonjs/loaders";

export class Ship {
    
    scene: Scene;
    engine: Engine;
    amplitude = 0.25;
    frequency = 5;

    private readonly MAX_AMPLITUDE = 1.5;
    private readonly MIN_AMPLITUDE = 0.01;
    private readonly MAX_FREQUENCY = 10;
    private readonly MIN_FREQUENCY = 0.3;

    private screenTextureSelecteur: DynamicTexture | null = null;
    private screenTextureNav: DynamicTexture | null = null;
    private screenTextureAmp: DynamicTexture | null = null;
    private screenTextureFreq: DynamicTexture | null = null;

    private buttonAmplitude: AbstractMesh | null = null;
    private buttonFrequency: AbstractMesh | null = null;
    private isHoveringAmplitude = false;
    private isHoveringFrequency = false;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.createScene();
        this.createSpaceShip();
        this.createGround();

        const isLocked = false;
        this.scene.onPointerDown = function () {
            if (!isLocked) {
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
        };

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        this.setupScrollEvents();
    }
    
    createScene(): Scene {
        const scene = new Scene(this.engine);
        scene.clearColor = new Color4(0, 0, 0, 1); 
        scene.gravity = new Vector3(0, -0.75, 0);
        scene.collisionsEnabled = true;
        scene.enablePhysics();

        const camera = createFPSCamera(scene, this.canvas);
        camera.metadata = { isFPSCamera: true }; // Marque la caméra comme FPS pour le Raycast

            
        return scene;
    }

    createSpaceShip(): void {
        SceneLoader.ImportMeshAsync("", "/models/", "spaceship.glb", this.scene).then((result) => {
            const spaceship = result.meshes[0];

            console.log("Le vaisseau est bien chargé");
            
            spaceship.checkCollisions = true; 
            spaceship.getChildMeshes().forEach(mesh => {
                console.log(mesh.name);
                mesh.checkCollisions = true;

                // Détection des boutons
                if (mesh.name === "selecteur_onde.boutton_amplitude") {
                    mesh.showBoundingBox = true;
                    this.buttonAmplitude = mesh;
                } 
                if (mesh.name === "selecteur_onde.boutton_frequence") {
                    mesh.showBoundingBox = true;
                    this.buttonFrequency = mesh;
                }

                // Création de la texture dynamique pour l'écran du sélecteur
                if (mesh.name === "selecteur_onde.screen") {
                    this.screenTextureSelecteur = this.createScreenMaterial(mesh);
                    this.screenTextureSelecteur.uScale = 4.6;
                    this.screenTextureSelecteur.vScale = 5;
                    this.screenTextureSelecteur.uOffset = -0.005;
                    this.screenTextureSelecteur.vOffset = 0.25;
                }

                // Création de la texture dynamique pour l'écran de navigation
                if (mesh.name === "poste_navigation.screen") {
                    this.screenTextureNav = this.createScreenMaterial(mesh);
                    this.screenTextureNav.uScale = 5;
                    this.screenTextureNav.vScale = 5;
                    this.screenTextureNav.uOffset = 0;
                    this.screenTextureNav.vOffset = 0.2;
                }

                // Création de la texture dynamique pour l'écran de l'amplitude
                if (mesh.name === "amplitude_screen") {
                    this.screenTextureAmp = this.createScreenMaterial(mesh);
                    //this.screenTextureAmp.uScale = 0;
                    //this.screenTextureAmp.vScale = 0;
                    //this.screenTextureAmp.uOffset = 0;
                    //this.screenTextureAmp.vOffset = 0;
                }

                 // Création de la texture dynamique pour l'écran des fréquences
                 if (mesh.name === "frequence_screen") {
                    this.screenTextureFreq = this.createScreenMaterial(mesh);
                    //this.screenTextureFreq.uScale = -1;
                    //this.screenTextureFreq.vScale = 0;
                    //this.screenTextureFreq.uOffset = 0;
                    //this.screenTextureFreq.vOffset = 0;
                }
            });

            this.setupButtonHoverDetection();
            this.updateSineWave();   // Dessiner l'onde au démarrage
            this.updateDataScreen(); // Afficher les valeurs par défaut
        });

        // Sons d'ambiance
        new Sound("", "/sons/buzzing-sound.wav", this.scene, null, { volume: 0.05, autoplay: true, loop: true });
        new Sound("", "/sons/horror-ambience-01-66708.mp3", this.scene, null, { volume: 0.5, autoplay: true, loop: true });
    }

    createGround(): void {
        const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this.scene);
        ground.position.y = 1; 
        ground.isVisible = false; 
        ground.checkCollisions = true;
    }

    /**
     * Crée une texture dynamique et l'applique à un écran du vaisseau
     */
    createScreenMaterial(mesh: AbstractMesh): DynamicTexture {
        const dynamicTexture = new DynamicTexture("waveTexture", { width: 512, height: 512 }, this.scene, true);
        const material = new StandardMaterial("screenMaterial", this.scene);
        material.diffuseTexture = dynamicTexture;
        material.specularColor = new Color3(0, 0, 0); 
        mesh.material = material;

        return dynamicTexture;
    }

    /**
     * Met à jour l'onde sur les deux écrans et centre correctement l'affichage
     */
    private lastAmplitude = 0;
    private lastFrequency = 0;

updateSineWave(): void {
    if (this.amplitude === this.lastAmplitude && this.frequency === this.lastFrequency) {
        return; // Skip unnecessary updates
    }

    this.lastAmplitude = this.amplitude;
    this.lastFrequency = this.frequency;

    [this.screenTextureSelecteur, this.screenTextureNav].forEach((screenTexture) => {
        if (!screenTexture) return;
        const textureContext = screenTexture.getContext();
        if (!textureContext) return;

        // Clear screen
        textureContext.fillStyle = "black";
        textureContext.fillRect(0, 0, 512, 512);

        // Draw Sine Wave
        const centerY = 256;
        const waveHeight = 80;
        const waveLength = Math.PI * 4;

        textureContext.strokeStyle = "lime";
        textureContext.lineWidth = 3;
        textureContext.beginPath();

        for (let i = 0; i < 512; i++) {
            const x = i;
            const y = centerY - this.amplitude * Math.sin(this.frequency * (i / 512) * waveLength) * waveHeight;
            i === 0 ? textureContext.moveTo(x, y) : textureContext.lineTo(x, y);
        }

        textureContext.stroke();
        screenTexture.update();
    });
}

    updateDataScreen(): void {
        if (this.screenTextureAmp) {
            this.screenTextureAmp.clear();
            this.screenTextureAmp.drawText(
                `A : ${this.amplitude.toFixed(2)}`,
                80, 150, "100px Arial",
                "lime", "transparent", false, true
            );
        }
    
        if (this.screenTextureFreq) {
            this.screenTextureFreq.clear();
            this.screenTextureFreq.drawText(
                `f : ${this.frequency.toFixed(2)}`,
                80, 150, "100px Arial",
                "lime", "transparent", false, true
            );
        }
    }
    

    setupScrollEvents(): void {
        this.canvas.addEventListener("wheel", (event) => {
            if (this.isHoveringAmplitude) {
                this.amplitude += (event.deltaY < 0) ? 0.01 : -0.01;
            } else if (this.isHoveringFrequency) {
                this.frequency += (event.deltaY < 0) ? 0.05 : -0.05;
            }
    
            // Appliquer les limites
            this.amplitude = Math.min(this.MAX_AMPLITUDE, Math.max(this.MIN_AMPLITUDE, this.amplitude));
            this.frequency = Math.min(this.MAX_FREQUENCY, Math.max(this.MIN_FREQUENCY, this.frequency));
    
            if (this.isHoveringAmplitude || this.isHoveringFrequency) {
                this.updateSineWave();
                this.updateDataScreen();
            }
        });
    }
    
    
    setupButtonHoverDetection(): void {
        this.scene.onPointerMove = (event) => {
            const hit = this.scene.pick(this.scene.getEngine().getRenderWidth() / 2, this.scene.getEngine().getRenderHeight() / 2);
    
            this.isHoveringAmplitude = hit?.pickedMesh === this.buttonAmplitude;
            this.isHoveringFrequency = hit?.pickedMesh === this.buttonFrequency;
        };
    }
    
}
