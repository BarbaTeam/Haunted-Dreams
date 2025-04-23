import { 
    Scene, Engine, Vector3, MeshBuilder, SceneLoader, Color4, StandardMaterial, 
    Color3, DynamicTexture, AbstractMesh,
    Texture,
    DefaultRenderingPipeline,
    DepthOfFieldEffectBlurLevel
} from '@babylonjs/core';
import { NarrationSystem } from './NarrationSystem';
import { createFPSCamera, displayedItem } from './Camera';
import "@babylonjs/loaders";
import { ShipLight } from './ShipLight';
import { ObjectiveSystem } from './ObjectiveSystem';
import { NavigationSystem } from './NavigationSystem';
import { ShipControls } from './ShipControls';
import { ShipSounds } from './ShipSounds';
import { Door } from './ShipControls';
import { HostilitySystem } from './HostilitySystem';
import * as GUI from '@babylonjs/gui';




export class Ship {
    
    scene: Scene;
    engine: Engine;


 
    private buttonAmplitude!: AbstractMesh;
    private buttonFrequency!: AbstractMesh;
    private buttonUp!: AbstractMesh;
    private buttonDown!: AbstractMesh;
    private buttonLeft!: AbstractMesh;
    private buttonRight!: AbstractMesh;
    private buttonPhoto!: AbstractMesh;
    private paperSheet!: AbstractMesh;
    private diaries!: AbstractMesh;
    private buttonDoorNav1!: AbstractMesh
    private buttonDoorNav2!: AbstractMesh
    private buttonDoorMotor1!: AbstractMesh
    private buttonDoorMotor2!: AbstractMesh
    private telephone!:AbstractMesh;
    private buttonMotor!: AbstractMesh;
    private doorExterior!: AbstractMesh;
    private doorNav!: AbstractMesh;
    private doorMotor!: AbstractMesh;
    private doorList: Door[] = []
    private photos : AbstractMesh[] = []

    private screenTextureSelecteur!: DynamicTexture;
    private screenTextureNav!: DynamicTexture;
    private screenTextureAmp!: DynamicTexture;
    private screenTextureFreq!: DynamicTexture;
    private screenTextureCompass!: DynamicTexture;
    private motorTextureOn!: Texture;
    private motorTextureOff!: Texture;
    private motorMaterial!: StandardMaterial;

    private narrationSystem: NarrationSystem;
    private shiplight: ShipLight;
    private objectiveSystem : ObjectiveSystem;
    private navigationSystem: NavigationSystem;
    private shipControls: ShipControls;
    private shipSounds: ShipSounds;
    private hostilitySystem: HostilitySystem;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.createScene();
        this.createSpaceShip();
        this.createGround();
        
        this.shipSounds = new ShipSounds(this.scene);
        this.shiplight = new ShipLight(this.scene);
        this.narrationSystem = new NarrationSystem(this.scene, this);
        this.navigationSystem = new NavigationSystem(this.scene, this);
        this.objectiveSystem = new ObjectiveSystem(this.scene, this, this.shipSounds);
        this.shipControls = new ShipControls(this, this.shipSounds,this.scene, this.shiplight, this.narrationSystem, canvas);
        this.hostilitySystem = new HostilitySystem(this.shipSounds);

        this.narrationSystem.setNavigationSystem(this.navigationSystem);
        this.narrationSystem.setObjectiveSystem(this.objectiveSystem);4
        this.narrationSystem.setShipControls(this.shipControls);
        this.shipControls.setNavigationSystem(this.navigationSystem);
        this.shipControls.setObjectiveSystem(this.objectiveSystem);
        this.shipControls.setHostilitySystem(this.hostilitySystem);
        this.objectiveSystem.setNavigationSystem(this.navigationSystem);
        this.objectiveSystem.setHostilitySystem(this.hostilitySystem);
        this.navigationSystem.setObjectiveSystem(this.objectiveSystem);
        this.navigationSystem.setShipControls(this.shipControls);
        this.hostilitySystem.setObjectiveSystem(this.objectiveSystem);
        this.hostilitySystem.setShipControls(this.shipControls);

        
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
                this.navigationSystem.updateSineWave();
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
                    case "diaries":
                        this.diaries = mesh;
                        break;
            
            
                    case "motor_controle.boutton":
                        this.buttonMotor = mesh;
                        break;
            
                    case "motor_controle.screen":
                        //this.motor_control_screen = mesh;
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
                        this.screenTextureCompass = this.createScreenMaterial(mesh);
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
            this.narrationSystem.setupNarrator();  
            this.navigationSystem.updateSineWave();   
            this.navigationSystem.updateDataScreen(); 
            this.navigationSystem.updateBoussoleScreen();
            
        });
    }

    createGround(): void {
        const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this.scene);
        ground.position.y = 1; 
        ground.isVisible = false; 
        ground.checkCollisions = true; 
    }


    public getButtonUp(): AbstractMesh{
        return this.buttonUp;
    }
    public getButtonDown(): AbstractMesh{
        return this.buttonDown;
    }
    public getButtonLeft(): AbstractMesh{
        return this.buttonLeft;
    }
    public getButtonRight(): AbstractMesh{
        return this.buttonRight;
    }
    public getButtonAmplitude(): AbstractMesh{
        return this.buttonAmplitude;
    }
    public getButtonFrequency(): AbstractMesh{
        return this.buttonFrequency;
    }
    public getButtonPhoto(): AbstractMesh{
        return this.buttonPhoto;
    }
    public getButtonMotor(): AbstractMesh{
        return this.buttonMotor
    }
    public getButtonDoorNav(): AbstractMesh[] {
        return [this.buttonDoorNav1, this.buttonDoorNav2];
    }
    public getButtonDoorMotor(): AbstractMesh[] {
        return [this.buttonDoorMotor1, this.buttonDoorMotor2];
    }
    public getTelephone(): AbstractMesh {
        return this.telephone;
    }
    public getPaperSheet(): AbstractMesh {
        return this.paperSheet;
    }
    public getDiaries(): AbstractMesh {
        return this.diaries;
    }
    public getPhotos(): AbstractMesh[] {
        return this.photos;
    }
    public getPhotoByIndex(index: number): AbstractMesh {
        return this.getPhotos()[index];
    }
    public getDoors(): Door[] {
        return this.doorList;
    }
    public getDoorByName(name: string): Door | undefined{
        return this.doorList.find(door => door.name === name);
    }
    public getCompassScreen(): DynamicTexture {
        return this.screenTextureCompass;
    }
    public getSelectorScreen(): DynamicTexture {
        return this.screenTextureSelecteur;
    }
    public getNavScreen(): DynamicTexture {
        return this.screenTextureNav;
    }
    public getMetricScreen(): DynamicTexture[] {
        return [this.screenTextureAmp, this.screenTextureFreq];
    }
    public getMotorMaterial(): StandardMaterial {
        return this.motorMaterial;
    }
    public diffuseTextureOn(): void {
        this.motorMaterial.diffuseTexture = this.motorTextureOn;
    }
    public diffuseTextureOff(): void {
        this.motorMaterial.diffuseTexture = this.motorTextureOff;
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
}
    
 
