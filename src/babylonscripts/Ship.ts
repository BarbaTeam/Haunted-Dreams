import { 
    Scene, Engine, Vector3, MeshBuilder, SceneLoader, Color4, Sound, StandardMaterial, 
    Color3, DynamicTexture, AbstractMesh, 
    ActionManager,
    ExecuteCodeAction,
    Matrix,
    PBRMaterial,
    PBRMetallicRoughnessMaterial,
    PointLight,
    SpotLight,
    ICanvasRenderingContext
} from '@babylonjs/core';
import { createFPSCamera } from './Camera';
import "@babylonjs/loaders";

export class Ship {
    
    scene: Scene;
    engine: Engine;

    isStartOfGame = true;

    amplitude = 0.5;
    frequency = 2;

    amplitudePos = 0.2;
    frequencyPos = 5;

    private readonly MAX_AMPLITUDE = 1.5;
    private readonly MIN_AMPLITUDE = 0.01;
    private readonly MAX_FREQUENCY = 10;
    private readonly MIN_FREQUENCY = 1;

    private screenTextureSelecteur: DynamicTexture | null = null;
    private screenTextureNav: DynamicTexture | null = null;
    private screenTextureAmp: DynamicTexture | null = null;
    private screenTextureFreq: DynamicTexture | null = null;

    private buttonAmplitude: AbstractMesh | null = null;
    private buttonFrequency: AbstractMesh | null = null;

    private isHoveringAmplitude = false;
    private isHoveringFrequency = false;

    private buttonUp: AbstractMesh | null = null;
    private buttonDown: AbstractMesh | null = null;
    private buttonLeft: AbstractMesh | null = null;
    private buttonRight: AbstractMesh | null = null;

    private buttonPhoto: AbstractMesh | null = null;

    private isHoveringPhoto = false;

    private isHoveringUp = false;
    private isHoveringDown = false;
    private isHoveringLeft = false;
    private isHoveringRight = false;

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
        this.setupMoveEvents();
    }
    
    createScene(): Scene {
        const scene = new Scene(this.engine);
        scene.clearColor = new Color4(0, 0, 0, 1); 
        scene.gravity = new Vector3(0, -0.75, 0);
        scene.collisionsEnabled = true;
        scene.enablePhysics();

        
        const entrance_light = new SpotLight("spotLight", new Vector3(0, 24, 0), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
        entrance_light.intensity = 1.5;
        entrance_light.diffuse = new Color3(255,218,100);

        const table_light = new SpotLight("spotLight", new Vector3(0, 24, 25), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
        table_light.intensity = 1.5;
        table_light.diffuse = new Color3(255,218,100);

        const nav_light = new SpotLight("spotLight", new Vector3(28, 24, 14), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
        nav_light.intensity = 1.5;
        nav_light.diffuse = new Color3(255,218,100);

        const motor_light = new SpotLight("spotLight", new Vector3(-20, 24, 14), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
        motor_light.intensity = 1.5;
        motor_light.diffuse = new Color3(255,218,100);
        

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

                // Détection des boutons du selecteur d'onde
                if (mesh.name === "selecteur_onde.boutton_amplitude") {
                    //mesh.showBoundingBox = true;
                    this.buttonAmplitude = mesh;
                } 
                if (mesh.name === "selecteur_onde.boutton_frequence") {
                    //mesh.showBoundingBox = true;
                    this.buttonFrequency = mesh;
                }

                // Détection des boutons de la navigation
                if (mesh.name === "nav.button_up") {
                    //mesh.showBoundingBox = true;
                    this.buttonUp = mesh;
                }
                if (mesh.name === "nav.button_down") {
                    //mesh.showBoundingBox = true;
                    this.buttonDown = mesh;
                }
                if (mesh.name === "nav.button_left") {
                    //mesh.showBoundingBox = true;
                    this.buttonLeft = mesh;
                }
                if (mesh.name === "nav.button_right") {
                    //mesh.showBoundingBox = true;
                    this.buttonRight = mesh;
                }

                if(mesh.name === "appareil_photo.boutton"){
                    this.buttonPhoto = mesh;
                }

                // Création de la texture dynamique pour l'écran du sélecteur
                if (mesh.name === "selecteur_onde.screen") {
                    this.screenTextureSelecteur = this.createScreenMaterial(mesh);
                    this.screenTextureSelecteur.uScale = 1;
                    this.screenTextureSelecteur.vScale = 1;
                    this.screenTextureSelecteur.uOffset = 0;
                    this.screenTextureSelecteur.vOffset = 0.26;
                }

                // Création de la texture dynamique pour l'écran de navigation
                if (mesh.name === "poste_navigation.screen") {
                    this.screenTextureNav = this.createScreenMaterial(mesh);
                    this.screenTextureNav.uScale = 1;
                    this.screenTextureNav.vScale = 1;
                    this.screenTextureNav.uOffset = 0;
                    this.screenTextureNav.vOffset = 0.2;
                }

                // Création de la texture dynamique pour l'écran de l'amplitude
                if (mesh.name === "amplitude_screen") {
                    this.screenTextureAmp = this.createScreenMaterial(mesh);
                }

                 // Création de la texture dynamique pour l'écran des fréquences
                 if (mesh.name === "frequence_screen") {
                    this.screenTextureFreq = this.createScreenMaterial(mesh);
                }

                if (mesh.name === "walls.door"){
                   //mesh.isVisible = false; 
                }
            });

            this.setupButtonHoverDetection();
            this.setupMoveEvents();
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

    updateSineWave(): void {

        //if(!this.isHoveringSomeButtonForNavigation() || !this.isStartOfGame){
        //    return;
        //} 
        // à creuser pour ecnomiser des ressources

        const centerY = 256;
        const waveHeight = 80;
        const waveLength = Math.PI * 4;
    
        // Fonction pour dessiner une sinusoïde sur un contexte de texture
        const drawSineWave = (context: ICanvasRenderingContext, amplitude: number, frequency: number, color: string): void => {
            context.strokeStyle = color;
            context.lineWidth = 3;
            context.beginPath();
    
            for (let i = 0; i < 512; i++) {
                const x = i;
                const y = centerY - amplitude * Math.sin(frequency * (i / 512) * waveLength) * waveHeight;
                i === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
            }
    
            context.stroke();
        };
    
        // Met à jour les textures
        [this.screenTextureSelecteur, this.screenTextureNav].forEach((screenTexture) => {
            if (!screenTexture) return;
            const ctx = screenTexture.getContext();
            if (!ctx) return;
    
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, 512, 512);
    
            // Utilisation du vert normal pour `screenTextureSelecteur`
            drawSineWave(ctx, this.amplitude, this.frequency, "lime");
    
            screenTexture.update();
        });
    
        // Onde liée à la position du vaisseau (en vert clair)
        if (this.screenTextureNav) {
            const ctx = this.screenTextureNav.getContext();
            if (ctx) {
                drawSineWave(ctx, this.amplitudePos, this.frequencyPos, "#90EE90"); // Vert clair (light green)
                this.screenTextureNav.update();
            }
        }

        this.isStartOfGame = false; //Ppour le premier affichage
    }
    

    updateDataScreen(): void {
        if (this.screenTextureAmp) {
            this.screenTextureAmp.clear();
            this.screenTextureAmp.drawText(
                `A : ${this.amplitude.toFixed(2)}`,
                70, 150, "80px Arial",
                "lime", "transparent", false, true
            );
        }
        
        if (this.screenTextureFreq) {
            this.screenTextureFreq.clear();
            this.screenTextureFreq.drawText(
                `f : ${this.frequency.toFixed(2)} Hz`,
                70, 150, "80px Arial",
                "lime", "transparent", false, true
            );
        }
    }


    private intervalId: number | null = null; // Stocke l'intervalle en cours

    setupMoveEvents(): void {
        this.canvas.addEventListener("mousedown", (event) => {
            this.startIncrementing();
        });

        this.canvas.addEventListener("mouseup", () => {
            this.stopIncrementing();
        });

        this.canvas.addEventListener("mouseleave", () => {
            this.stopIncrementing(); // Arrêter si la souris quitte la zone
        });
    }

    private startIncrementing(): void {
        if (this.intervalId !== null) return; // Évite de créer plusieurs intervals

        this.intervalId = setInterval(() => {
            if (this.isHoveringUp) {
                this.amplitudePos += 0.01; 
            } else if (this.isHoveringDown) {
                this.amplitudePos -= 0.01; 
            } else if (this.isHoveringRight) {
                this.frequencyPos += 0.01;
            } else if (this.isHoveringLeft) {
                this.frequencyPos -= 0.01;
            }

            this.amplitudePos = Math.max(this.MIN_AMPLITUDE, Math.min(this.amplitudePos, this.MAX_AMPLITUDE));
            this.frequencyPos = Math.max(this.MIN_FREQUENCY, Math.min(this.frequencyPos, this.MAX_FREQUENCY));

            this.updateSineWave(); 
        }, 50); // Met à jour toutes les 50ms
    }

    private stopIncrementing(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    

    setupScrollEvents(): void {
        this.canvas.addEventListener("wheel", (event) => {
            if (this.isHoveringAmplitude) {
                this.amplitude += (event.deltaY < 0) ? 0.05 : -0.05;
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
            this.isHoveringUp = hit?.pickedMesh === this.buttonUp;
            this.isHoveringDown = hit?.pickedMesh === this.buttonDown;
            this.isHoveringLeft = hit?.pickedMesh === this.buttonLeft;
            this.isHoveringRight = hit?.pickedMesh === this.buttonRight;
            this.isHoveringPhoto = hit?.pickedMesh === this.buttonPhoto;
        };
        this.setupButtonMaterials();

    }
    
    isHoveringSomeButtonForNavigation() {
        return this.isHoveringAmplitude || this.isHoveringFrequency || this.isHoveringUp || this.isHoveringDown || this.isHoveringLeft || this.isHoveringRight;
    }

    setupButtonMaterials(): void {
        if (!this.scene) return;
    
        const buttonMaterial = this.buttonDown?.material as StandardMaterial;
        if (!buttonMaterial) return;
        buttonMaterial.diffuseColor = new Color3(1, 0, 0); 
    
        const highlightMaterial = new PBRMetallicRoughnessMaterial("highlightMat", this.scene);
        highlightMaterial.baseColor = new Color3(1, 1, 1); 
        highlightMaterial.metallic = 0;

        const buttons = [
            this.buttonAmplitude,
            this.buttonFrequency,
            this.buttonUp,
            this.buttonDown,
            this.buttonLeft,
            this.buttonRight
        ];
    
        buttons.forEach((button) => {
            if (button) {
                button.material = buttonMaterial;
            }
        });
    
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.buttonAmplitude) {
                this.buttonAmplitude.material = this.isHoveringAmplitude ? highlightMaterial : buttonMaterial;
            }
            if (this.buttonFrequency) {
                this.buttonFrequency.material = this.isHoveringFrequency ? highlightMaterial : buttonMaterial;
            }
            if (this.buttonUp) {
                this.buttonUp.material = this.isHoveringUp ? highlightMaterial : buttonMaterial;
            }
            if (this.buttonDown) {
                this.buttonDown.material = this.isHoveringDown ? highlightMaterial : buttonMaterial;
            }
            if (this.buttonLeft) {
                this.buttonLeft.material = this.isHoveringLeft ? highlightMaterial : buttonMaterial;
            }
            if (this.buttonRight) {
                this.buttonRight.material = this.isHoveringRight ? highlightMaterial : buttonMaterial;
            }
            if (this.buttonPhoto) {
                this.buttonPhoto.material = this.isHoveringPhoto ? highlightMaterial : buttonMaterial;
        }}
    );
    }
    
}
