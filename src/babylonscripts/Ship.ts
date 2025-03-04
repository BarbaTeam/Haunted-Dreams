import { 
    Scene, Engine, Vector3, MeshBuilder, SceneLoader, Color4, Sound, StandardMaterial, 
    Color3, DynamicTexture, AbstractMesh, 
    ActionManager,
    ExecuteCodeAction
} from '@babylonjs/core';
import { createFPSCamera } from './Camera';
import "@babylonjs/loaders";

export class Ship {
    
    scene: Scene;
    engine: Engine;
    amplitude = 2;
    frequency = 1;

    private readonly MAX_AMPLITUDE = 4;
    private readonly MIN_AMPLITUDE = 0.5;
    private readonly MAX_FREQUENCY = 3;
    private readonly MIN_FREQUENCY = 0.3;

    private screenTextureSelecteur: DynamicTexture | null = null;
    private screenTextureNav: DynamicTexture | null = null;

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

        createFPSCamera(scene, this.canvas);
            
        return scene;
    }

    createSpaceShip(): void {
        SceneLoader.ImportMeshAsync("", "/models/", "spaceship.glb", this.scene).then((result) => {
            const spaceship = result.meshes[0];

            console.log("Le vaisseau est bien chargé");
            
            spaceship.checkCollisions = true; 
            spaceship.getChildMeshes().forEach(mesh => {
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
                }

                // Création de la texture dynamique pour l'écran de navigation
                if (mesh.name === "poste_navigation.screen") {
                    this.screenTextureNav = this.createScreenMaterial(mesh);
                }
            });

            this.setupButtonHoverDetection();
            this.updateSineWave(); // Dessiner l'onde au démarrage
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
    updateSineWave(): void {
        [this.screenTextureSelecteur, this.screenTextureNav].forEach((screenTexture) => {
            if (!screenTexture) return;
            const textureContext = screenTexture.getContext();
            if (!textureContext) return;

            // Nettoyage de l'écran
            textureContext.fillStyle = "black";
            textureContext.fillRect(0, 0, 512, 512);

            // Paramètres de l'onde
            const centerY = 256; // Centre de l'écran
            const waveHeight = 80; // Hauteur visuelle ajustée
            const waveLength = Math.PI * 4; // Plus long pour meilleure visibilité

            textureContext.strokeStyle = "lime"; 
            textureContext.lineWidth = 3;
            textureContext.beginPath();

            for (let i = 0; i < 512; i++) {
                const x = i;
                const y = centerY - this.amplitude * Math.sin(this.frequency * (i / 512) * waveLength) * waveHeight;
                if (i === 0) {
                    textureContext.moveTo(x, y);
                } else {
                    textureContext.lineTo(x, y);
                }
            }

            textureContext.stroke();
            screenTexture.update(); 
        });
    }

    setupScrollEvents(): void {
        this.canvas.addEventListener("wheel", (event) => {
            if (this.isHoveringAmplitude) {
                this.amplitude += (event.deltaY < 0) ? 0.1 : -0.1;
            } else if (this.isHoveringFrequency) {
                this.frequency += (event.deltaY < 0) ? 0.1 : -0.1;
            }

            // Appliquer les limites
            this.amplitude = Math.min(this.MAX_AMPLITUDE, Math.max(this.MIN_AMPLITUDE, this.amplitude));
            this.frequency = Math.min(this.MAX_FREQUENCY, Math.max(this.MIN_FREQUENCY, this.frequency));

            this.updateSineWave();
        });
    }
    
    setupButtonHoverDetection(): void {
        if (!this.buttonAmplitude || !this.buttonFrequency) return;

        this.buttonAmplitude.actionManager = new ActionManager(this.scene);
        this.buttonFrequency.actionManager = new ActionManager(this.scene);

        this.buttonAmplitude.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnPointerOverTrigger,
            () => { this.isHoveringAmplitude = true; }
        ));
        this.buttonAmplitude.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnPointerOutTrigger,
            () => { this.isHoveringAmplitude = false; }
        ));

        this.buttonFrequency.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnPointerOverTrigger,
            () => { this.isHoveringFrequency = true; }
        ));
        this.buttonFrequency.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnPointerOutTrigger,
            () => { this.isHoveringFrequency = false; }
        ));
    }
}
