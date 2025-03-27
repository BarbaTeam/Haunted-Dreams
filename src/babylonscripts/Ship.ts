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
    ICanvasRenderingContext,
    ShadowGenerator,
    Texture,
    DefaultRenderingPipeline,
    DepthOfFieldEffectBlurLevel,
    ColorCorrectionPostProcess,
    SSAO2RenderingPipeline
} from '@babylonjs/core';

import { createFPSCamera } from './Camera';
import "@babylonjs/loaders";

type Nightmare = {
    nmAmplitude: number;
    nmFrequency: number;
    nmAngle: number;
}

export class Ship {
    
    scene: Scene;
    engine: Engine;

    isStartOfGame = true;

    amplitude = Math.random() * 1.5; 
    frequency = Math.random() * 10; 

    amplitudePos = Math.random() * 1.5; 
    frequencyPos =Math.random() * 10; 

    angle = Math.random() * Math.PI * 2;
    points: { x: number, y: number }[] = [];
    angle_points: number[] = [];
    angleToAim: number | undefined;

    nightmares: Nightmare[] = [
        {
        nmAmplitude : 1.00,
        nmFrequency : 1.02,
        nmAngle : 5.10
    },
    {
        nmAmplitude : 0.45,
        nmFrequency : 3.42,
        nmAngle : 1.50
    }]
    nightMareIndex = 0;
    currentNightmare = this.nightmares[this.nightMareIndex];


    private readonly MAX_AMPLITUDE = 1.5;
    private readonly MIN_AMPLITUDE = 0.01;
    private readonly MAX_FREQUENCY = 10;
    private readonly MIN_FREQUENCY = 1;

    private screenTextureSelecteur!: DynamicTexture;
    private screenTextureNav!: DynamicTexture;
    private screenTextureAmp!: DynamicTexture;
    private screenTextureFreq!: DynamicTexture;
    private screenTextureBoussole!: DynamicTexture;
    private motorTextureOn!: Texture;
    private motorTextureOff!: Texture;
    private motorMaterial!: StandardMaterial;

    private buttonAmplitude!: AbstractMesh;
    private buttonFrequency!: AbstractMesh;

    private isHoveringAmplitude = false;
    private isHoveringFrequency = false;

    private buttonUp!: AbstractMesh;
    private buttonDown!: AbstractMesh;
    private buttonLeft!: AbstractMesh;
    private buttonRight!: AbstractMesh;

    private buttonPhoto!: AbstractMesh;
    private paperSheet!: AbstractMesh;

    private engineState = true;
    private buttonMotor!: AbstractMesh;
    private motor_control_screen!: AbstractMesh;
    private door!: AbstractMesh
    private lightList: SpotLight[] = [];

    private isHoveringPhoto = false;
    private isHoveringPaperSheet = false;
    private isHoveringMotor = false
    private isHoveringUp = false;
    private isHoveringDown = false;
    private isHoveringLeft = false;
    private isHoveringRight = false;

    private metalfootstep!: Sound;
    private buzzingSound!: Sound;
    private motorSound!: Sound;
    private horrorSound!: Sound;

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
            setTimeout(() => {
                this.updateSineWave();
            }, 50);
        });
        this.setupScrollEvents();
        this.setupNavEvents();
        this.setupMoveEvents();
        this.setupMotorEvents();
        this.setupPaperSheetEvent();
    }
    









   
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                            //                                  
    //                                         GESTION DE LA SCENE                                                //
    //                                                                                                            //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    createScene(): Scene {
        const scene = new Scene(this.engine);
        scene.clearColor = new Color4(0, 0, 0, 1); 
        scene.gravity = new Vector3(0, -0.75, 0);
        scene.collisionsEnabled = true;
        scene.enablePhysics();
        this.createLights();
        const camera = createFPSCamera(scene, this.canvas);
        camera.metadata = { isFPSCamera: true }; // Marque la caméra comme FPS pour le Raycast

        // POST-PROCESSING 

        // profondeur de champ
        const pipeline = new DefaultRenderingPipeline("pipeline", true, scene, [camera]);
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Low;
        pipeline.depthOfField.focalLength = 1; 
        pipeline.depthOfField.fStop = 2; 
        pipeline.depthOfField.focusDistance = 1000; 

        return scene;
    }

    createSpaceShip(): void {
        SceneLoader.ImportMeshAsync("", "/models/", "spaceship.glb", this.scene).then((result) => {
            const spaceship = result.meshes[0];

            console.log("Le vaisseau est bien chargé");
            
            spaceship.checkCollisions = true; 
            spaceship.getChildMeshes().forEach(mesh => {
                mesh.checkCollisions = true;
            
                switch (mesh.name) {
                    case "selecteur_onde.boutton_amplitude":
                        this.buttonAmplitude = mesh;
                        break;
                    case "selecteur_onde.boutton_frequence":
                        this.buttonFrequency = mesh;
                        break;

                    case "nav.button_up":
                        this.buttonUp = mesh;
                        break;
                    case "nav.button_down":
                        this.buttonDown = mesh;
                        break;
                    case "nav.button_left":
                        this.buttonLeft = mesh;
                        break;
                    case "nav.button_right":
                        this.buttonRight = mesh;
                        break;
            
                    case "appareil_photo.boutton":
                        this.buttonPhoto = mesh;
                        break;
                    case "papersheet":
                        this.paperSheet = mesh;
                        break;
            
                    case "motor_controle.boutton":
                        this.buttonMotor = mesh;
                        break;
            
                    case "motor_controle.screen":
                        this.motor_control_screen = mesh;
                        this.motorMaterial = new StandardMaterial("motor_control_screen", this.scene);
                        this.motorTextureOn = new Texture("/images/power_on.png", this.scene);
                        this.motorTextureOff = new Texture("/images/power_off.png", this.scene);
            
                        this.motorTextureOn.wAng = Math.PI / 2;
                        this.motorTextureOn.uScale = -1;
                        this.motorTextureOff.wAng = Math.PI / 2;
                        this.motorTextureOff.uScale = -1;
            
                        mesh.material = this.motorMaterial;
                        this.motorMaterial.emissiveTexture = this.motorTextureOn;
                        this.motorMaterial.specularColor = new Color3(0, 0, 0);
                        break;
            
                    case "selecteur_onde.screen":
                        this.screenTextureSelecteur = this.createScreenMaterial(mesh);
                        this.screenTextureSelecteur.uScale = 1;
                        this.screenTextureSelecteur.vScale = 1;
                        this.screenTextureSelecteur.uOffset = 0;
                        this.screenTextureSelecteur.vOffset = 0.26;
                        break;
            
                    case "poste_navigation.screen":
                        this.screenTextureNav = this.createScreenMaterial(mesh);
                        this.screenTextureNav.uScale = 1;
                        this.screenTextureNav.vScale = 1;
                        this.screenTextureNav.uOffset = 0;
                        this.screenTextureNav.vOffset = 0.2;
                        break;
            
                    case "boussole.screen":
                        this.screenTextureBoussole = this.createScreenMaterial(mesh);
                        break;
            
                    case "amplitude_screen":
                        this.screenTextureAmp = this.createScreenMaterial(mesh);
                        break;
            
                    case "frequence_screen":
                        this.screenTextureFreq = this.createScreenMaterial(mesh);
                        break;
            
                    case "walls.door":
                        this.door = mesh;
                        break;
                    case "photo1":
                        mesh.visibility = 0;
                        this.photos.push(mesh);
                        break;
                    case "photo2":
                        mesh.visibility = 0;
                        this.photos.push(mesh);
                        break;
                    case "photo3":
                        mesh.visibility = 0;
                        this.photos.push(mesh);
                        break;
                    case "photo4":
                        mesh.visibility = 0;
                        this.photos.push(mesh);
                        break;
                    case "photo5":
                        mesh.visibility = 0;
                        this.photos.push(mesh);
                        break;
                    case "photo6":
                        mesh.visibility = 0;
                        this.photos.push(mesh);
                        break;

                }
            });
            

            this.setupButtonHoverDetection();
            this.setupNavEvents();
            this.setupPhotoEvent();
            this.updateSineWave();   // Dessiner l'onde au démarrage
            this.updateDataScreen(); // Afficher les valeurs par défaut
            this.updateBoussoleScreen();
        });

        // Sons d'ambiance
        this.buzzingSound = new Sound("", "/sons/buzzing-sound.wav", this.scene, null, { volume: 0.05, autoplay: true, loop: true });
        this.motorSound = new Sound("", "/sons/horror-ambience-01-66708.mp3", this.scene, null, { volume: 0.5, autoplay: true, loop: true });
        this.metalfootstep = new Sound("", "/sons/metal-footsteps.mp3", this.scene, null, { volume: 0.5, autoplay: false, loop: true });
        this.horrorSound = new Sound("", "/sons/spooky-ambience-sound.mp3",this.scene, null, { volume : 0.5, autoplay: false, loop: true});
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
        material.emissiveTexture = dynamicTexture;
        material.specularColor = new Color3(0, 0, 0); 
        mesh.material = material;

        return dynamicTexture;
    }

    createLights(): void {
        const entrance_light = new SpotLight("spotLight", new Vector3(0, 16, -6), new Vector3(0, -1, 0), Math.PI / 2, 10, this.scene);
        const entrance_light2 = new SpotLight("spotLight", new Vector3(0, 16, -6), new Vector3(0.5, -1, 0.5), Math.PI / 2, 10, this.scene);
        const entrance_light3 = new SpotLight("spotLight", new Vector3(0, 16, -6), new Vector3(-0.5, -1, 0.5), Math.PI / 2, 10, this.scene);
        const entrance_light4 = new SpotLight("spotLight", new Vector3(1, 20, 2), new Vector3(0.6, -1, 0), Math.PI / 2, 10, this.scene);

        
        const table_light = new SpotLight("spotLight", new Vector3(0, 16, 34), new Vector3(0, -1, 0), Math.PI / 2, 5, this.scene);
        const table_light2 = new SpotLight("spotLight", new Vector3(0, 16, 34), new Vector3(0.5, -1, -0.5), Math.PI / 2, 10, this.scene);
        const table_light3 = new SpotLight("spotLight", new Vector3(0, 16, 34), new Vector3(-0.5, -1, -0.5), Math.PI / 2, 10, this.scene);

        const nav_light = new SpotLight("spotLight", new Vector3(13, 16, 13.5), new Vector3(0.2, -1, 0), Math.PI * (2/3), 10, this.scene);
        const nav_light2 = new SpotLight("spotLight", new Vector3(41, 16, 13.5), new Vector3(-1, -1, 0), Math.PI * (2/3), 10, this.scene);

        const motor_light = new SpotLight("spotLight", new Vector3(-14, 16, 13.5), new Vector3(-1, -1, 0), Math.PI * (2/3), 10, this.scene);
        
        
        this.lightList = [
            entrance_light,
            entrance_light2,
            entrance_light3,
            entrance_light4,
            table_light,
            table_light2,
            table_light3,
            nav_light,
            nav_light2,
            motor_light
        ];

        this.lightList.forEach((light) => {
            light.intensity = 1;
            light.diffuse = new Color3(106, 143, 63);
            light.range = 2;
        });
    }











    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                            //                                  
    //                                         GESTION DES OBJECTIFS                                              //
    //                                                                                                            //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    photos : AbstractMesh[] = []
    updateObjectives(){
        if(this.currentNightmare.nmAmplitude.toFixed(2)===this.amplitude.toFixed(2) && this.currentNightmare.nmFrequency.toFixed(2) === this.frequency.toFixed(2)){
            this.angleToAim = this.currentNightmare.nmAngle;
            if(this.angle.toFixed(1) === this.angleToAim.toFixed(1)){
                this.frequencyPos = this.frequency;
                this.isDistorted = false;
            }
        }
        else {
            this.angleToAim = undefined;
            this.isDistorted = true;
        }
        this.updateBoussoleScreen();
    }








   
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                            //                                  
    //                                            GESTION DES ECRANS                                              //
    //                                                                                                            //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    isDistorted = true;

    updateSineWave(): void {

        //if(!this.isHoveringSomeButtonForNavigation() || !this.isStartOfGame){
        //    return;
        //} 
        // à creuser pour ecnomiser des ressources

        const centerY = 256;
        const waveHeight = 80;
        const waveLength = Math.PI * 4;
    
        // Fonction pour dessiner une sinusoïde sur un contexte de texture
        const drawSineWave = (context: ICanvasRenderingContext, amplitude: number, frequency: number, color: string, allowDistorded: boolean): void => {
            context.strokeStyle = color;
            context.lineWidth = 3;
            context.beginPath();
            
            for (let i = 0; i < 512; i++) {
                const x = i;

                const y = this.isDistorted && allowDistorded
                    ? centerY + 
                        Math.sin(i * 0.1 + Math.random() * 50) * (Math.random() * 50) + 
                        Math.cos(i * 0.05 + Math.random() * 30) * (Math.random() * 30) +
                        (Math.random() - 0.5) * 10
                    : centerY - amplitude * Math.sin(frequency * (i / 512) * waveLength) * waveHeight;


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
            drawSineWave(ctx, this.amplitude, this.frequency, "lime", false);
    
            screenTexture.update();
        });
    
        // Onde liée à la position du vaisseau (en vert clair)
        if (this.screenTextureNav) {
            const ctx = this.screenTextureNav.getContext();
            if (ctx) {
                drawSineWave(ctx, this.amplitudePos, this.frequencyPos, "#90EE90", true); // Vert clair (light green)
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

    updateBoussoleScreen(): void {

        const drawCircle = (context: ICanvasRenderingContext, color: string): void => {
            const centerX = 256;
            const centerY = 256;
            const radius = 220;
        
            for (let i = 0; i < 21; i++) {
                const angle = (i / 21) * 2 * Math.PI; // Diviser l'angle en 21 parts égales
                const x = centerX + radius * Math.cos(angle); // Calculer la position X
                const y = centerY + radius * Math.sin(angle); // Calculer la position Y
        
                this.points.push({ x, y }); // Stocker les coordonnées dans le tableau
                this.angle_points.push(angle);

                // Dessiner un petit cercle pour chaque point
                context.beginPath();
                
                context.arc(x, y, 20, 0, 2 * Math.PI);
                //console.log("angle point: " +this.angle_points[i].toFixed(1))
                //console.log("angle to aim: "+ this.angleToAim?.toFixed(1))
                if(this.angleToAim && this.angle_points[i].toFixed(1) === this.angleToAim.toFixed(1)){
                    context.fillStyle = "lime"; // Remplir avec la couleur
                }
                else{
                    context.fillStyle = color; // Remplir avec la couleur
                }
                context.fill();
            }
            //console.log(this.angle_points);
            //console.log(this.angle);
        
        };

        const drawArrow = (context: ICanvasRenderingContext, angle: number): void => {
            const startX = 256; 
            const startY = 256; 
            const arrowHeadLength = 100; 
            const arrowHeadWidth = 70;
            const color = "#FF0000";
        
            // Sauvegarde l'état du contexte (pour ne pas affecter les autres dessins)
            context.save();

            // Déplacer le point de référence au centre de la flèche
            context.translate(startX, startY);
            // Appliquer la rotation en fonction de l'angle
            context.rotate(angle);

            context.beginPath();
            context.arc(0, 0, 150, 0, 2 * Math.PI);
            context.fillStyle = "#000000"; // Remplir avec la couleur
            context.fill();

            // Dessiner la tête de la flèche sous forme de triangle allongé
            context.strokeStyle = color;
            context.lineWidth = 3;
            context.beginPath();

            context.moveTo(130, 0); 
        
            // Point à gauche de la base du triangle (base de la flèche)
            context.lineTo(-arrowHeadLength, -arrowHeadWidth); 
        
            // Point à droite de la base du triangle
            context.lineTo(-arrowHeadLength, arrowHeadWidth); 
        
            // Retour au centre de la flèche
            context.closePath();
        
            // Dessiner le triangle
            context.stroke();
        
            // Remplir le triangle avec la couleur
            context.fillStyle = color;
            context.fill();
        
            // Restaure l'état du contexte (pour ne pas affecter d'autres dessins)
            context.restore();
        };
        
        
        if (this.screenTextureBoussole) {
            const context = this.screenTextureBoussole.getContext(); // Récupère le contexte de dessin 2D du canvas
            if (context) {
                drawCircle(context, "#013500",);
                drawArrow(context, this.angle);
            }
        }
        this.screenTextureBoussole.update();
    }
    
    




    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                            //                                  
    //                                         GESTION DES EVENEMENTS                                             //
    //                                                                                                            //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    private intervalId: number | null = null; // Stocke l'intervalle en cours

    setupNavEvents(): void {
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
                this.angle -= Math.PI / 180;
            } else if (this.isHoveringLeft) {
                this.angle += Math.PI / 180;            
            }
            if (this.angle > 2 * Math.PI) {
                this.angle -= 2 * Math.PI; 
            }
            if (this.angle < 0) {
                this.angle += 2 * Math.PI; 
            }

            this.amplitudePos = Math.max(this.MIN_AMPLITUDE, Math.min(this.amplitudePos, this.MAX_AMPLITUDE));
            this.frequencyPos = Math.max(this.MIN_FREQUENCY, Math.min(this.frequencyPos, this.MAX_FREQUENCY));

            this.updateObjectives();
            this.updateSineWave(); 
            this.updateBoussoleScreen();
        }, 50); // Met à jour toutes les 50ms
    }

    private stopIncrementing(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private pressedKeys: Set<string> = new Set();

    setupMoveEvents(): void {
        window.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if (["z", "q", "s", "d"].includes(key)) {
                this.pressedKeys.add(key);
                if (this.metalfootstep && !this.metalfootstep.isPlaying) {
                    this.metalfootstep.play();
                }
        }
        });
    
        window.addEventListener("keyup", (event) => {
            const key = event.key.toLowerCase();
            if (["z", "q", "s", "d"].includes(key)) {
                this.pressedKeys.delete(key);
                if (this.pressedKeys.size === 0 && this.metalfootstep && this.metalfootstep.isPlaying) {
                    this.metalfootstep.stop();
                }
            }
        });
    }

    setupScrollEvents(): void {
        this.canvas.addEventListener("wheel", (event) => {
            if (this.isHoveringAmplitude) {
                this.amplitude += (event.deltaY < 0) ? 0.01 : -0.01;
            } else if (this.isHoveringFrequency) {
                this.frequency += (event.deltaY < 0) ? 0.01 : -0.01;
            }
    
            // Appliquer les limites
            this.amplitude = Math.min(this.MAX_AMPLITUDE, Math.max(this.MIN_AMPLITUDE, this.amplitude));
            this.frequency = Math.min(this.MAX_FREQUENCY, Math.max(this.MIN_FREQUENCY, this.frequency));
    
            if (this.isHoveringAmplitude || this.isHoveringFrequency) {
                this.updateSineWave();
                this.updateDataScreen();
                this.updateObjectives();
            }
        });
    }
    
    setupPhotoEvent(): void {
        this.canvas.addEventListener("mousedown", (event) => {
            if(this.isHoveringPhoto){
                if(this.isOverlap()){
                    console.log("cauchemar photographié !");
                    this.photos[this.nightMareIndex].visibility = 1;
                    if(this.nightMareIndex < this.nightmares.length-1){
                        this.nightMareIndex++;
                        console.log("Nouveau cauchemar : "+ this.nightMareIndex);
                        this.currentNightmare = this.nightmares[this.nightMareIndex];
                    }
                }
                else{
                    console.log("rêve photographié !");
                }

            }
        });
    }

    //CODE POUR TOM
    setupPaperSheetEvent(): void {
        this.canvas.addEventListener("mousedown", (event) => {
            if(this.isHoveringPaperSheet){
                console.log("l'interface s'affiche")
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
            this.isHoveringMotor = hit?.pickedMesh === this.buttonMotor;
            this.isHoveringPaperSheet = hit?.pickedMesh === this.paperSheet;
        };
        this.setupButtonMaterials();

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
            this.buttonRight,
            this.buttonPhoto,
            this.buttonMotor
        ];
        
        buttons.forEach((button) => {
            if (button) {
                button.material = buttonMaterial;
            }
        });

        const paperSheetMaterial = this.paperSheet.material;
    
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
            }
            if (this.paperSheet) {
                this.paperSheet.material = this.isHoveringPaperSheet ? highlightMaterial : paperSheetMaterial;
            }
            if (this.buttonMotor) {
                this.buttonMotor.material = this.isHoveringMotor ? highlightMaterial : buttonMaterial;
            }
        }
    );
    }

    isOverlap() {
        return Math.abs(this.amplitudePos - this.currentNightmare.nmAmplitude) < 0.01 && Math.abs(this.frequencyPos - this.currentNightmare.nmFrequency) < 0.01;
    }

    isHoveringSomeButtonForNavigation() {
        return this.isHoveringAmplitude || this.isHoveringFrequency || this.isHoveringUp || this.isHoveringDown || this.isHoveringLeft || this.isHoveringRight;
    }

    setupMotorEvents(): void {
        this.canvas.addEventListener("mousedown", (event) => {
            if(this.isHoveringMotor){
                if(this.engineState){
                    this.shutDownEngine();
                }
                else{
                    this.powerEngine();
                }
            }
        });
    }

    powerEngine() {
        this.engineState = true;
        this.buzzingSound?.play();
        this.motorSound?.play();
        if (this.door) {
            this.door.isVisible = true;
        }
        if (this.motorMaterial) {
            this.motorMaterial.diffuseTexture = this.motorTextureOn;
        }
        this.lightList.forEach((light) => {
            light.diffuse = new Color3(106, 143, 63);
            light.intensity = 1;
        });
        this.horrorSound.stop();
    }

    shutDownEngine() {
        this.engineState = false;
        this.buzzingSound?.stop();
        this.motorSound?.stop();
        if (this.door) {
            this.door.isVisible = false;
        }
        if (this.motorMaterial) {
            this.motorMaterial.diffuseTexture = this.motorTextureOff;
        }
        this.lightList.forEach((light) => {
            light.diffuse = new Color3(175,0,0);
            light.intensity = 0.5;
        });
        this.horrorSound?.play();
    }
}
