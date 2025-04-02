import { 
    Scene, Engine, Vector3, MeshBuilder, SceneLoader, Color4, Sound, StandardMaterial, 
    Color3, DynamicTexture, AbstractMesh, 
    SpotLight,
    ICanvasRenderingContext,
    Texture,
    DefaultRenderingPipeline,
    DepthOfFieldEffectBlurLevel,
    HighlightLayer,
    Mesh,
    Animation
} from '@babylonjs/core';

import { createFPSCamera } from './Camera';
import "@babylonjs/loaders";

type Nightmare = {
    nmAmplitude: number;
    nmFrequency: number;
    nmAngle: number;
}

type Door = {
    name: string;
    mesh: AbstractMesh;
    isOpen: boolean;
}

export class Ship {
    
    scene: Scene;
    engine: Engine;

    isStartOfGame = true;

    amplitude = 0.01; 
    frequency = 1; 

    amplitudePos = 0.1; 
    frequencyPos = 1; 

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
            nmFrequency : 2.42,
            nmAngle : 3.30
        },
        {
            nmAmplitude : 0.12,
            nmFrequency : 3.98,
            nmAngle : 1.20
        },
        {
            nmAmplitude : 0.97,
            nmFrequency : 5.23,
            nmAngle : 5.70
        },
        {
            nmAmplitude : 1.44,
            nmFrequency : 6.57,
            nmAngle : 2.70
        },
        {
            nmAmplitude : 1.17,
            nmFrequency : 8.11,
            nmAngle : 6.00
        }
    ]
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
    
    private buttonDoorNav1!: AbstractMesh
    private buttonDoorNav2!: AbstractMesh
    private buttonDoorMotor1!: AbstractMesh
    private buttonDoorMotor2!: AbstractMesh

    private isHoveringbuttonDoorNav1= false;
    private isHoveringbuttonDoorNav2= false;
    private isHoveringbuttonDoorMotor1= false;
    private isHoveringbuttonDoorMotor2= false;

    private telephone!:AbstractMesh;
    private isHoveringTelephone = false;

    private engineState = true;
    private buttonMotor!: AbstractMesh;
    private motor_control_screen!: AbstractMesh;


    private doorExterior!: AbstractMesh;
    private doorNav!: AbstractMesh;
    private doorMotor!: AbstractMesh;
    private doorList: Door[] = []

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

        this.narratorVoices = [
            new Sound("", "sons/intro.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
            new Sound("", "sons/tuto1.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
            new Sound("", "sons/tuto2.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
            new Sound("", "sons/tuto3.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
            new Sound("", "sons/tuto4.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
            new Sound("", "sons/tuto5.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
            new Sound("", "sons/tuto6.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
            new Sound("", "sons/tuto7.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
            new Sound("", "sons/tuto8.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
            new Sound("", "sons/outro.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
        ]

        return scene;
    }

    createSpaceShip(): void {
        SceneLoader.ImportMeshAsync("", "models/", "spaceship.glb", this.scene).then((result) => {
            const spaceship = result.meshes[0];

            console.log("Le vaisseau est bien chargé");
            
            spaceship.checkCollisions = true; 
            spaceship.getChildMeshes().forEach(mesh => {
                mesh.checkCollisions = true;
                console.log(mesh.name);
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
                   
                    case "appareil_photo.button":
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
                        this.motorTextureOn = new Texture("images/power_on.png", this.scene);
                        this.motorTextureOff = new Texture("images/power_off.png", this.scene);
            
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
            
                    case "door_exterieur":
                        this.doorExterior = mesh;
                        break;
                    case "door_navigation":
                        this.doorNav = mesh;
                        break;
                    case "door_navigation_button1":
                        this.buttonDoorNav1 = mesh;
                        break;
                    case "door_navigation_button2":
                        this.buttonDoorNav2 = mesh;
                        break;
                    case "door_motor":
                        this.doorMotor = mesh;
                        break;
                    case "door_motor_button1":
                        this.buttonDoorMotor1 = mesh;
                        break;
                    case "door_motor_button2":
                        this.buttonDoorMotor2 = mesh;
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
                    case "telephone":
                        this.telephone = mesh;
                        break;
                }
            });
            
            this.doorList = [
                {
                    name: "exterior",
                    mesh: this.doorExterior,
                    isOpen: false
                },
                {
                    name: "nav",
                    mesh: this.doorNav,
                    isOpen: false
                },
                {
                    name: "motor",
                    mesh: this.doorMotor,
                    isOpen: false
                }
            ]
            console.log(this.telephone);
            this.setupNarrator();
            this.setupButtonHoverDetection();
            this.setupEvents();
            this.updateSineWave();   
            this.updateDataScreen(); 
            this.updateBoussoleScreen();
        });

        // Sons d'ambiance
        this.buzzingSound = new Sound("", "sons/buzzing-sound.wav", this.scene, null, { volume: 0.05, autoplay: true, loop: true });
        this.motorSound = new Sound("", "sons/horror-ambience-01-66708.mp3", this.scene, null, { volume: 0.25, autoplay: true, loop: true });
        this.metalfootstep = new Sound("", "sons/metal-footsteps.mp3", this.scene, null, { volume: 0.5, autoplay: false, loop: true });
        this.horrorSound = new Sound("", "sons/spooky-ambience-sound.mp3",this.scene, null, { volume : 0.5, autoplay: false, loop: true});
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
            light.intensity = 3;
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
    beenPlayed = false;
    updateObjectives(){
        if(this.currentNightmare.nmAmplitude.toFixed(2)===this.amplitude.toFixed(2) && this.currentNightmare.nmFrequency.toFixed(2) === this.frequency.toFixed(2)){
            this.angleToAim = this.currentNightmare.nmAngle;
            if(!this.beenPlayed){
                this.beenPlayed = true;
                new Sound("", "sons/beep.mp3", this.scene, null, { volume: 0.5, autoplay: true, loop: false });
            }
            if(this.angle.toFixed(1) === this.angleToAim.toFixed(1)){
                this.frequencyPos = this.frequency;
                this.isDistorted = false;
            } else {
                this.isDistorted = true;
            }
        }
        else {
            this.beenPlayed = false;
            this.angleToAim = undefined;
            this.isDistorted = true;
        }
        this.updateBoussoleScreen();
    }












    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                            //                                  
    //                                         GESTION DES HOSTILITE                                              //
    //                                                                                                            //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    setupHostile(shutdownTimer: number){
        if(this.nightMareIndex>0){
            this.setUpShutDownEvents(shutdownTimer);
            this.setUpKnockingEvents();
        }
    }

    setUpShutDownEvents(shutdownTimer: number){
        const randomDelay = shutdownTimer*1000 - Math.random() * 0.3*shutdownTimer*1000;
        setTimeout(() => {
            console.log("Événement de shutdown activé");
            this.shutDownEngine();
        }, randomDelay);
    }
    
    setUpKnockingEvents(){
        const randomDelay = Math.random() * 5000; 
        setTimeout(() => {
            console.log("Événement de frappe à la porte activé");

        }, randomDelay);
    }

    
    private initialMeshesPositions: Map<AbstractMesh, number> = new Map();

    openDoors(): void {
        this.doorList.forEach((door) => {
            if (door.mesh && !door.isOpen) {
                this.openDoor(door, this.enableDoor);
            }
        });
    }

    closeDoors(): void {
        this.doorList.forEach((door) => {
            if (door.mesh && door.isOpen) {
                this.closeDoor(door, this.enableDoor);
            }
        });
    }

    toggleDoor(door: Door): void {
        if (door) {
            if (door.isOpen) {
                this.closeDoor(door, this.enableDoor);
            } else {
                this.openDoor(door, this.enableDoor);
            }
        }
    }

    openDoor(door: Door, enable:boolean): void {
        if (!this.initialMeshesPositions.has(door.mesh)) {
            this.initialMeshesPositions.set(door.mesh, door.mesh.position.y);
        }
        const initialY = this.initialMeshesPositions.get(door.mesh);
        if (initialY !== undefined) {
            const maxY = initialY + 12.5;
            const offset = maxY - door.mesh.position.y;
            door.isOpen=true;
            if(enable){
                this.playSound("sons/door.mp3",0.25);
                this.updateMeshPositionY(door.mesh, offset, 30);
            }
        }        
    }

    closeDoor(door: Door, enable:boolean): void {
        if (door && this.initialMeshesPositions.has(door.mesh)) {
            const initialY = this.initialMeshesPositions.get(door.mesh);
            if (initialY !== undefined) {
                const offset = initialY - door.mesh.position.y;
                door.isOpen=false;
                if(enable){
                    this.playSound("sons/door.mp3",0.25);
                    this.updateMeshPositionY(door.mesh, offset, 30);
                }
            } 
        }
    }
        
    deathInitiated() {
        this.deathTimeOut = setTimeout(() => {
            this.engineRestartAllowed = false;
            this.runningDeathSound = this.playSound("sons/runningdeath.mp3", 1);
            this.runningDeathSound.onEndedObservable.add(() => {
                this.kill();
            });
        }, 7000);
    }

    kill() {
        const blackScreen = document.createElement("div");
        blackScreen.style.position = "fixed";
        blackScreen.style.top = "0";
        blackScreen.style.left = "0";
        blackScreen.style.width = "100vw";
        blackScreen.style.height = "100vh";
        blackScreen.style.backgroundColor = "black";
        blackScreen.style.zIndex = "9999";
        document.body.appendChild(blackScreen);
    
        const beepSound = this.playSound("sons/kill.mp3", 2);
    
        beepSound.onEndedObservable.add(() => {
            location.reload();
        });
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

        if(!this.engineState){
            [this.screenTextureSelecteur, this.screenTextureNav].forEach((screenTexture) => {
                if (!screenTexture) return;
                const ctx = screenTexture.getContext();
                if (!ctx) return;
    
                ctx.fillStyle = "black"; 
                ctx.fillRect(0, 0, 512, 512);
                screenTexture.update();
            });
    
            return;
        }
    
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
            
            drawSineWave(ctx, this.amplitudePos, this.frequencyPos, "#90EE90", true); // Vert clair (light green)
            this.screenTextureNav.update();
            
        }

        this.isStartOfGame = false; // Ppour le premier affichage
    }
    

    updateDataScreen(): void {
        if(!this.engineState){
            this.screenTextureAmp.clear();
            this.screenTextureAmp.update();
            this.screenTextureFreq.clear();
            this.screenTextureFreq.update();
            return;
        }
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
                    context.fillStyle = "lime"; 
                }
                else{
                    context.fillStyle = color; 
                }
                context.fill();
            }
            console.log(this.angle_points);
            console.log("currentangle = "+ this.angle + "angle to aim = "+ this.angleToAim);
        
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
        
        if(!this.engineState){
            if (!this.screenTextureBoussole) return;
            const ctx = this.screenTextureBoussole.getContext();
            if (!ctx) return;

            ctx.fillStyle = "black"; 
            ctx.fillRect(0, 0, 512, 512);
            this.screenTextureBoussole.update();
    
            return;
        }

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






    ////////////////////////////////////////////////////////
    //  Gestion des events listeners                                                                                                                                                                                   


    setupEvents(): void {
        this.canvas.addEventListener("pointerdown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("pointerup", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("pointerleave", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("wheel", this.handleScroll.bind(this));

        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    private wasHovering = false;

    isHoveringSomeButtonForNavigation(): boolean {
        return this.isHoveringAmplitude || this.isHoveringFrequency || this.isHoveringUp || this.isHoveringDown || this.isHoveringLeft || this.isHoveringRight;
    }

    isHoveringSomeButtonForNavDoor(): boolean {
        return this.isHoveringbuttonDoorNav1 || this.isHoveringbuttonDoorNav2;
    }
    isHoveringSomeButtonForMotorDoor(): boolean {
        return this.isHoveringbuttonDoorMotor1 || this.isHoveringbuttonDoorMotor2;
    }

    handleMouseDown(): void {
        if (this.isHoveringSomeButtonForNavigation()) {
            this.startIncrementing();
        } else if (this.isHoveringPhoto) {
            this.takePhoto();
        } else if (this.isHoveringPaperSheet) { 
            console.log("L'interface s'affiche"); //mets ta methode ici tom
        } else if (this.isHoveringMotor) {
            this.toggleEngine();
        }
        else if (this.isHoveringSomeButtonForNavDoor()) {
            this.toggleDoor(this.doorList.find(door => door.name === "nav")!);
        }
        else if (this.isHoveringSomeButtonForMotorDoor()) {
            this.toggleDoor(this.doorList.find(door => door.name === "motor")!);
        }
        else if (this.isHoveringTelephone){
            this.answerPhone();
        }
        this.lastButton = this.getCurrentButton();
        if (this.lastButton) {
            this.wasHovering = true;
            if (!this.initialMeshesPositions.has(this.lastButton)) {
                this.initialMeshesPositions.set(this.lastButton, this.lastButton.position.y);
            }
            if (this.lastButton && this.initialMeshesPositions.has(this.lastButton)) {
                const initialY = this.initialMeshesPositions.get(this.lastButton)!;
                const minY = initialY -0.15;
                const offset = minY - this.lastButton.position.y;
                this.playSound("sons/pressdown.mp3", 0.5);
                this.updateMeshPositionY(this.lastButton, offset, 120);
            }
        }

        
    }

    handleMouseUp(): void {
        if (this.wasHovering) {
            this.wasHovering = false;
            this.playSound("sons/pressup.mp3", 0.5);
        }
        if (this.lastButton && this.initialMeshesPositions.has(this.lastButton)) {
            const initialY = this.initialMeshesPositions.get(this.lastButton)!;
            const offset = initialY - this.lastButton.position.y;
    
            this.updateMeshPositionY(this.lastButton, offset, 120);
        }
        this.stopIncrementing();
    }

    handleScroll(event: WheelEvent): void {
        this.scrollIncrements(event);
    }

    private pressedKeys: Set<string> = new Set();

    handleKeyDown(event: KeyboardEvent): void {
        const key = event.code; // Utilisation de event.code pour garantir la compatibilité AZERTY/QWERTY
        if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(key)) {
            this.pressedKeys.add(key);
            if (this.metalfootstep && !this.metalfootstep.isPlaying) {
                this.metalfootstep.play();
            }
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        const key = event.code;
        if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(key)) {
            this.pressedKeys.delete(key);
            if (this.pressedKeys.size === 0 && this.metalfootstep && this.metalfootstep.isPlaying) {
                this.metalfootstep.stop();
            }
        }
    }





    ////////////////////////////////////////////////////////
    //  Gestion des changements de valeurs     
    //


    private isIncrementing = false;

    startIncrementing(): void {
        if (this.isIncrementing) return; 
        this.isIncrementing = true;

        const updateLoop = () => {
            if (!this.isIncrementing) return;

            if (this.isHoveringUp) this.amplitudePos = Math.min(this.amplitudePos + 0.0025, this.MAX_AMPLITUDE);
            else if (this.isHoveringDown) this.amplitudePos = Math.max(this.amplitudePos - 0.0025, this.MIN_AMPLITUDE);
            else if (this.isHoveringRight) {
                this.angle = (this.angle - Math.PI / 500) % (2 * Math.PI);
            }
            else if (this.isHoveringLeft) {
                this.angle = (this.angle + Math.PI / 500) % (2 * Math.PI);
            }
            if (this.angle < 0) {
                this.angle += 2 * Math.PI;
            }
            this.updateObjectives();
            this.updateSineWave();
            this.updateBoussoleScreen();

            requestAnimationFrame(updateLoop);
        };

        requestAnimationFrame(updateLoop);
    }

    stopIncrementing(): void {
        this.isIncrementing = false;
    }

    scrollIncrements(event: WheelEvent): void {
        if (this.isHoveringAmplitude) {
            this.amplitude += event.deltaY < 0 ? 0.01 : -0.01;
        } else if (this.isHoveringFrequency) {
            this.frequency += event.deltaY < 0 ? 0.01 : -0.01;
        }

        this.amplitude = Math.min(this.MAX_AMPLITUDE, Math.max(this.MIN_AMPLITUDE, this.amplitude));
        this.frequency = Math.min(this.MAX_FREQUENCY, Math.max(this.MIN_FREQUENCY, this.frequency));

        if (this.isHoveringAmplitude || this.isHoveringFrequency) {
            this.updateSineWave();
            this.updateDataScreen();
            this.updateObjectives();
        }
    }
    





    ////////////////////////////////////////////////////////
    //  Gestion des actions du joueur lié à la progression de l'objectif  
    //


    takePhoto(): void {
        if (this.isOverlap()) {
            console.log("Cauchemar photographié !");
            this.playPhotoSounds();
            setTimeout(() => {
                this.setupHostile(60);
                this.photos[this.nightMareIndex].visibility = 1;
                if (this.nightMareIndex < this.nightmares.length - 1) {
                    this.nightMareIndex++;
                    this.currentNightmare = this.nightmares[this.nightMareIndex];
                    this.updateObjectives();
                }
            }, 4000);
        } else {
            console.log("Rêve photographié !");
            this.playDreamPhotoSounds();
            this.setupHostile(10);
        }
    }

    isOverlap() {
        return Math.abs(this.amplitudePos - this.currentNightmare.nmAmplitude) < 0.01 && Math.abs(this.frequencyPos - this.currentNightmare.nmFrequency) < 0.01;
    }

    enableDoor = true;

    toggleEngine(): void {
        if (this.engineState) {
            this.shutDownEngine();
        } else {
            this.powerEngine();
        }
    }

    private deathSound!: Sound;
    private runningDeathSound!: Sound; 
    private deathTimeOut: any;
    private engineRestartAllowed = true; 

    powerEngine() {
        if (!this.engineRestartAllowed) {
            console.log("Le moteur ne peut plus être rallumé !");
            return;
        }

        this.engineState = true;
        this.buzzingSound?.play();
        this.motorSound?.play();
        this.enableDoor= true;
        this.closeDoor(this.doorList.find(door => door.name === "exterior")!, this.enableDoor);

        if (this.motorMaterial) {
            this.motorMaterial.diffuseTexture = this.motorTextureOn;
        }
        this.lightList.forEach((light) => {
            light.diffuse = new Color3(106, 143, 63);
            light.intensity = 3;
        });

        this.horrorSound?.stop();
        this.setupHostile(120);

        this.deathSound?.stop();
        this.runningDeathSound?.stop();
        clearTimeout(this.deathTimeOut);
        this.updateDataScreen();
        this.updateSineWave();
        this.updateBoussoleScreen();
    }

    shutDownEngine() {
        this.engineState = false;
        this.engineRestartAllowed = true;
        this.buzzingSound?.stop();
        this.motorSound?.stop();

        this.deathSound = this.playSound("sons/deathsound.mp3", 0.5);

        this.openDoors();
        this.enableDoor = false;
        if (this.motorMaterial) {
            this.motorMaterial.diffuseTexture = this.motorTextureOff;
        }
        this.lightList.forEach((light) => {
            light.diffuse = new Color3(175, 0, 0);
            light.intensity = 2;
        });

        this.horrorSound?.play();

        this.deathInitiated();
        this.updateDataScreen();
        this.updateSineWave();
        this.updateBoussoleScreen();
    }
    






    ////////////////////////////////////////////////////////
    //  Gestion du son    
    //


    playSound(url: string, volume: number, autoplay= true): Sound {
        return new Sound("", url, this.scene, null, { volume: volume, autoplay: autoplay, loop: false });
    }

    playPhotoSounds(): void {
        new Sound("", "sons/photo.mp3", this.scene, null, { volume: 0.5, autoplay: true, loop: false });
        setTimeout(() => {
            new Sound("", "sons/thumb-tack.mp3", this.scene, null, { volume: 1, autoplay: true, loop: false });
        }, 2000);
    }

    playDreamPhotoSounds(): void {
        new Sound("", "sons/photo.mp3", this.scene, null, { volume: 0.5, autoplay: true, loop: false });
        setTimeout(() => {
            new Sound("", "sons/paper-ripping.mp3", this.scene, null, { volume: 1.5, autoplay: true, loop: false });
        }, 3000);
    }






    ////////////////////////////////////////////////////////
    //  Gestion des de la surbrillance des objets     
    //


    setupButtonHoverDetection(): void {
        this.scene.onPointerMove = () => {
            const hit = this.scene.pick(this.scene.getEngine().getRenderWidth() / 2, this.scene.getEngine().getRenderHeight() / 2);
    
            this.isHoveringAmplitude = hit?.pickedMesh === this.buttonAmplitude;
            this.isHoveringFrequency = hit?.pickedMesh === this.buttonFrequency;
            this.isHoveringUp = hit?.pickedMesh === this.buttonUp;
            this.isHoveringDown = hit?.pickedMesh === this.buttonDown;
            this.isHoveringLeft = hit?.pickedMesh === this.buttonLeft;
            this.isHoveringRight = hit?.pickedMesh === this.buttonRight;
            this.isHoveringPhoto = hit?.pickedMesh === this.buttonPhoto;
            this.isHoveringMotor = hit?.pickedMesh === this.buttonMotor;
            this.isHoveringTelephone = hit?.pickedMesh === this.telephone;
            this.isHoveringPaperSheet = hit?.pickedMesh === this.paperSheet;
            this.isHoveringbuttonDoorMotor1 = hit?.pickedMesh=== this.buttonDoorMotor1;
            this.isHoveringbuttonDoorMotor2 = hit?.pickedMesh=== this.buttonDoorMotor2;
            this.isHoveringbuttonDoorNav1 = hit?.pickedMesh=== this.buttonDoorNav1;
            this.isHoveringbuttonDoorNav2 = hit?.pickedMesh=== this.buttonDoorNav2;
        };
        
        this.setupButtonMaterials();

    }

    setupButtonMaterials(): void {
        if (!this.scene) return;
            
        const highlightLayer = new HighlightLayer("hl1", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 


        this.scene.onBeforeRenderObservable.add(() => {
            const elements = [
                { mesh: this.buttonAmplitude, isHovering: this.isHoveringAmplitude },
                { mesh: this.buttonFrequency, isHovering: this.isHoveringFrequency },
                { mesh: this.buttonUp, isHovering: this.isHoveringUp },
                { mesh: this.buttonDown, isHovering: this.isHoveringDown },
                { mesh: this.buttonLeft, isHovering: this.isHoveringLeft },
                { mesh: this.buttonRight, isHovering: this.isHoveringRight },
                { mesh: this.buttonPhoto, isHovering: this.isHoveringPhoto },
                { mesh: this.buttonMotor, isHovering: this.isHoveringMotor },
                { mesh: this.paperSheet, isHovering: this.isHoveringPaperSheet },
                { mesh: this.telephone, isHovering: this.isHoveringTelephone },
                { mesh: this.buttonDoorMotor1, isHovering: this.isHoveringbuttonDoorMotor1},
                { mesh: this.buttonDoorMotor2, isHovering: this.isHoveringbuttonDoorMotor2},
                { mesh: this.buttonDoorNav1, isHovering: this.isHoveringbuttonDoorNav1},
                { mesh: this.buttonDoorNav1, isHovering: this.isHoveringbuttonDoorNav2}
            ];
            
            elements.forEach(({ mesh, isHovering }) => {
                if (mesh) {
                    if (isHovering) {
                        if (!highlightLayer.hasMesh(mesh as Mesh)) {
                            highlightLayer.addMesh(mesh as Mesh, Color3.White());
                        }
                    } else {
                        highlightLayer.removeMesh(mesh as Mesh);
                    }
                }
            });
        });
    }


    ////////////////////////////////////////////////////////
    //  Gestion du narrateur     
    //

    private ringTone!: Sound;
    private answered = false;
    private isCalling = false;
    private narratorVoices!: Sound[];
    

    setupNarrator(){
        if(!this.answered){
            setTimeout(()=>{
                this.isCalling = true;
                this.ringTone = new Sound("", "sons/ringtone.mp3", this.scene, null, { volume: 0.5, autoplay: true, loop: true });
            },5000);
        }
        else {
            setTimeout(()=>{
                this.narratorVoices[0].play();
                this.narratorVoices[0].onEndedObservable.add(() => {
                    this.narratorVoices[1].play();
                });
                
            },1000);
            this.narratorVoices[1].onEndedObservable.add(() => {
                this.narratorVoices[2].play();
            });
            this.narratorVoices[2].onEndedObservable.add(() => {
                this.narratorVoices[3].play();
            });
            this.narratorVoices[3].onEndedObservable.add(() => {
                this.paperTutorial();
            });
            this.narratorVoices[4].onEndedObservable.add(() => {
                this.waveSelectorTutorial();
            });
            this.narratorVoices[5].onEndedObservable.add(() => {
                this.boussoleTutorial();
            });
            this.narratorVoices[6].onEndedObservable.add(() => {
                this.photoTutorial();
            });
            this.narratorVoices[7].onEndedObservable.add(() => {
                this.narratorVoices[8].play();
            });
        }
    }

    answerPhone(): void {
        console.log("décroché");
        if(!this.answered && this.isCalling){
            this.ringTone.stop();
            this.answered = true;
            this.setupNarrator();
        }

    }

    paperTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Left click on the paper";
        const text2 = "to see patient's info";
    
        const textPlane = this.createFloatingText(text1, text2, this.paperSheet as Mesh, { x: 4.1, y: 1, z: 0 });
    
        highlightLayer.addMesh(this.paperSheet as Mesh, Color3.Green());
        const handleClick = ()=>{
            if(this.isHoveringPaperSheet){
                highlightLayer.removeMesh(this.paperSheet as Mesh);
                textPlane.dispose();
                this.narratorVoices[4].play();
                removeEventListener("pointerdown", handleClick);
            }
        }
        addEventListener("pointerdown", handleClick);
    }

    waveSelectorTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Scroll on the buttons";
        const text2 = "to update wave's coord";
    
        const textPlane = this.createFloatingText(text1, text2, this.buttonAmplitude as Mesh, { x: 17, y: 11, z: 6 });
    
        highlightLayer.addMesh(this.buttonAmplitude as Mesh, Color3.Green());
        highlightLayer.addMesh(this.buttonFrequency as Mesh, Color3.Green());


        const checkValue = () => {
            if (this.currentNightmare.nmAmplitude.toFixed(2)===this.amplitude.toFixed(2) && this.currentNightmare.nmFrequency.toFixed(2) === this.frequency.toFixed(2)) {
                highlightLayer.removeMesh(this.buttonAmplitude as Mesh);
                highlightLayer.removeMesh(this.buttonFrequency as Mesh);
                textPlane.dispose();
                this.narratorVoices[5].play();

                clearInterval(valueWatcher);
                removeEventListener("wheel", checkValue);
            }
        };

        addEventListener("wheel", checkValue);

        const valueWatcher = setInterval(checkValue, 100);
    }

    boussoleTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Use the left/right arrows";
        const text2 = "to turn the ship towards the dot";
    
        const textPlane = this.createFloatingText(text1, text2, this.buttonAmplitude as Mesh, { x: 20, y: 11, z: 0 });
    
        highlightLayer.addMesh(this.buttonLeft as Mesh, Color3.Green());
        highlightLayer.addMesh(this.buttonRight as Mesh, Color3.Green());


        const checkValue = () => {
            if (this.angle.toFixed(1) === this.angleToAim!.toFixed(1)) {
                highlightLayer.removeMesh(this.buttonLeft as Mesh);
                highlightLayer.removeMesh(this.buttonRight as Mesh);
                textPlane.dispose();
                this.navigationTutorial();
                clearInterval(valueWatcher);
                removeEventListener("pointerdown", checkValue);
            }
        };
        addEventListener("pointerdown", checkValue);

        const valueWatcher = setInterval(checkValue, 100);
    }

    navigationTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Use the up/down arrows";
        const text2 = "to update your position's wave";
    
        const textPlane = this.createFloatingText(text1, text2, this.buttonAmplitude as Mesh, { x: 20, y: 11, z: 0 });
    
        highlightLayer.addMesh(this.buttonUp as Mesh, Color3.Green());
        highlightLayer.addMesh(this.buttonDown as Mesh, Color3.Green());


        const checkValue = () => {
            if (this.isOverlap()) {
                highlightLayer.removeMesh(this.buttonUp as Mesh);
                highlightLayer.removeMesh(this.buttonDown as Mesh);
                textPlane.dispose();
                this.narratorVoices[6].play();
                clearInterval(valueWatcher);
                removeEventListener("pointerdown", checkValue);
            }
        };

        addEventListener("pointerdown", checkValue);

        const valueWatcher = setInterval(checkValue, 100);
    }
    
    photoTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Left click on button";
        const text2 = "to take a photo";
    
        const textPlane = this.createFloatingText(text1, text2, this.buttonPhoto as Mesh, { x: 14, y: 3, z: -1 });
    
        highlightLayer.addMesh(this.buttonPhoto as Mesh, Color3.Green());

        const checkValue = () => {
            if (this.nightMareIndex != 0) {
                highlightLayer.removeMesh(this.buttonPhoto as Mesh);
                textPlane.dispose();
                this.narratorVoices[7].play();

                clearInterval(valueWatcher);
                removeEventListener("pointerdown", checkValue);
            }
        };

        addEventListener("pointerdown", checkValue);

        const valueWatcher = setInterval(checkValue, 100);
    }
    
    createFloatingText(text1: string, text2: string, targetMesh: Mesh, offset = { x: 0, y: 0, z: 0 }) {
        const plane = MeshBuilder.CreatePlane("TexturePlane", { width: 10, height: 3 }, this.scene);
        const planeMaterial = new StandardMaterial("AvatarPlaneMat", this.scene);
        
        const planeTexture = new DynamicTexture("planeTexture", { width: 512, height: 256 }, this.scene);
        planeTexture.hasAlpha = true;
    
        planeTexture.drawText(text1, 0, 40, "bold 40px Arial", "green", null, true, true);
        planeTexture.drawText(text2, 18, 75, "bold 40px Arial", "green", null, true, true);

        planeMaterial.backFaceCulling = true;
        planeMaterial.diffuseTexture = planeTexture;
        planeMaterial.emissiveColor = new Color3(1, 1, 1);  
        planeMaterial.specularColor = new Color3(0, 0, 0);
        plane.material = planeMaterial;
    
        plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    
        plane.position.x = targetMesh.position.x + offset.x;
        plane.position.y = targetMesh.position.y + offset.y;
        plane.position.z = targetMesh.position.z + offset.z;
    
        return plane;
    }















    ////////////////////////////////////////////////////////
    //  Gestion de l'enfoncement des touches     
    //


    private lastButton!: AbstractMesh | null;

    updateMeshPositionY(mesh: AbstractMesh, offset: number, fps: number): void {
        const animation = new Animation(
            "moveY",
            "position.y",
            fps,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    
        const keys = [
            { frame: 0, value: mesh.position.y },
            { frame: 30, value: mesh.position.y + offset }
        ];
    
        animation.setKeys(keys);
    
        mesh.animations = [animation];
        this.scene.beginAnimation(mesh, 0, 30, false);
        
    }

    getCurrentButton(): AbstractMesh | null {
        if (this.isHoveringUp) return this.buttonUp;
        if (this.isHoveringDown) return this.buttonDown;
        if (this.isHoveringRight) return this.buttonRight;
        if (this.isHoveringLeft) return this.buttonLeft;
        if (this.isHoveringPhoto) return this.buttonPhoto;
        if (this.isHoveringMotor) return this.buttonMotor;
        if (this.isHoveringbuttonDoorMotor1) return this.buttonDoorMotor1;
        if (this.isHoveringbuttonDoorMotor2) return this.buttonDoorMotor2;
        if (this.isHoveringbuttonDoorNav1) return this.buttonDoorNav1;
        if (this.isHoveringbuttonDoorNav2) return this.buttonDoorNav2;

        return null;
    }
}
