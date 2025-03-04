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

    private readonly MAX_AMPLITUDE = 0.5;
    private readonly MIN_AMPLITUDE = 0.01;
    private readonly MAX_FREQUENCY = 10;
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
                    this.screenTextureSelecteur.wAng = (-1) *Math.PI / 2;
                    this.screenTextureSelecteur.uScale = 1.55;
                    this.screenTextureSelecteur.vScale = 1.55;
                    this.screenTextureSelecteur.uOffset = -0.98;
                    this.screenTextureSelecteur.vOffset = -0.55;
                }

                // Création de la texture dynamique pour l'écran de navigation
                if (mesh.name === "poste_navigation.screen") {
                    this.screenTextureNav = this.createScreenMaterial(mesh);
                    this.screenTextureNav.wAng = (-1) *Math.PI / 2;
                    this.screenTextureNav.uScale = 1.55;
                    this.screenTextureNav.vScale = 1.55;
                    this.screenTextureNav.uOffset = -0.02;
                    this.screenTextureNav.vOffset = -0.035;
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
                this.amplitude += (event.deltaY < 0) ? 0.01 : -0.01;
            } else if (this.isHoveringFrequency) {
                this.frequency += (event.deltaY < 0) ? 0.05 : -0.05;
            }
    
            // Appliquer les limites
            this.amplitude = Math.min(this.MAX_AMPLITUDE, Math.max(this.MIN_AMPLITUDE, this.amplitude));
            this.frequency = Math.min(this.MAX_FREQUENCY, Math.max(this.MIN_FREQUENCY, this.frequency));
    
            if (this.isHoveringAmplitude || this.isHoveringFrequency) {
                this.updateSineWave();
            }
        });
    }
    
    
    setupButtonHoverDetection(): void {
        if (!this.buttonAmplitude || !this.buttonFrequency) return;
    
        this.scene.onBeforeRenderObservable.add(() => {
            const camera = this.scene.activeCamera!;
            if (!camera) return;
    
            // Lancer un raycast depuis le centre de l'écran
            const hit = this.scene.pick(this.scene.getEngine().getRenderWidth() / 2, this.scene.getEngine().getRenderHeight() / 2);
    
            // Réinitialiser l'état des boutons
            this.isHoveringAmplitude = false;
            this.isHoveringFrequency = false;
    
            // Si un objet est détecté, vérifier s'il s'agit d'un bouton
            if (hit && hit.pickedMesh) {
                if (hit.pickedMesh === this.buttonAmplitude) {
                    this.isHoveringAmplitude = true;
                } 
                if (hit.pickedMesh === this.buttonFrequency) {
                    this.isHoveringFrequency = true;
                }
            }
        });
    }
    
}
