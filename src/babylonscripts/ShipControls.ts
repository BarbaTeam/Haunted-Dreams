import { AbstractMesh, Animation, Camera, Color3, DefaultRenderingPipeline, DepthOfFieldEffectBlurLevel, HighlightLayer, Mesh, Scene, TGATools } from "@babylonjs/core";
import { Ship } from "./Ship";
import { ShipSounds } from "./ShipSounds";
import { ShipLight } from "./ShipLight";
import { NavigationSystem } from "./NavigationSystem";
import { ObjectiveSystem } from "./ObjectiveSystem";
import { NarrationSystem } from "./NarrationSystem";
import { HostilitySystem } from "./HostilitySystem";
import {createFPSCamera, displayDocument, displayedItem, getAffichePage } from './Camera';

export type Door = {
    name: string;
    mesh: AbstractMesh;
    isOpen: boolean;
}

export class ShipControls{
    private engineState = true;
    private ship: Ship;
    private shipSounds: ShipSounds;
    private scene: Scene;
    private initialMeshesPositions: Map<AbstractMesh, number> = new Map();
    private shipLight: ShipLight;
    private narrationSystem: NarrationSystem;
    private navigationSystem!: NavigationSystem;
    private objectiveSystem!: ObjectiveSystem;
    private hostilitySystem!: HostilitySystem;
    private engineRestartAllowed = true; 

    private hoveringAmplitude = false;
    private hoveringFrequency = false;
    private hoveringbuttonDoorNav1= false;
    private hoveringbuttonDoorNav2= false;
    private hoveringbuttonDoorMotor1= false;
    private hoveringbuttonDoorMotor2= false;
    private hoveringTelephone = false;
    private hoveringPhoto = false;
    private hoveringPaperSheet = false;
    private hoveringExplorerSheet = false;
    private hoveringDiaries = false;
    private hoveringMotor = false
    private hoveringUp = false;
    private hoveringDown = false;
    private hoveringLeft = false;
    private hoveringRight = false;

    private handleMouseDownBound = this.handleMouseDown.bind(this);
    private handleMouseUpBound = this.handleMouseUp.bind(this);
    private handleScrollBound = this.handleScroll.bind(this);
    private handleKeyDownBound = this.handleKeyDown.bind(this);
    private handleKeyUpBound = this.handleKeyUp.bind(this);

    private canvas: HTMLCanvasElement;

    constructor(ship: Ship, shipSounds: ShipSounds, scene: Scene, shipLight: ShipLight, narrationSystem: NarrationSystem, canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.narrationSystem = narrationSystem;
        this.ship = ship;
        this.shipSounds = shipSounds;
        this.scene = scene;
        this.shipLight= shipLight;
        this.setupButtonHoverDetection();
        this.enableEvents();
    }

    public setUpCamera(){
        const camera = createFPSCamera(this.scene, this.canvas, this, this, this.shipSounds, this.ship, this.hostilitySystem, this.objectiveSystem);
        camera.metadata = { isFPSCamera: true }; // Marque la caméra comme FPS pour le Raycast
        this.scene.activeCamera = camera;

        // POST-PROCESSING 

        // profondeur de champ
        const pipeline = new DefaultRenderingPipeline("pipeline", true, this.scene, [camera]);
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Low;
        pipeline.depthOfField.focalLength = 1; 
        pipeline.depthOfField.fStop = 2; 
        pipeline.depthOfField.focusDistance = 1000;  
    }
    
    public setNavigationSystem(navigationSystem: NavigationSystem): void {
        this.navigationSystem = navigationSystem;
    }
    public setHostilitySystem(hostilitySystem: HostilitySystem): void {
        this.hostilitySystem = hostilitySystem;
    }
    public setObjectiveSystem(objectiveSystem: ObjectiveSystem): void {
        this.objectiveSystem = objectiveSystem;
    }
    public isEngineRestartAllowed(): boolean {
        return this.engineRestartAllowed;
    }
    public setEngineRestartAllowed(bool: boolean){
        this.engineRestartAllowed = bool;
    }
    public getEngineState(){
        return this.engineState;
    }
    
    public isHoveringAmplitude(): boolean {
        return this.hoveringAmplitude;
    }
    
    public isHoveringFrequency(): boolean {
        return this.hoveringFrequency;
    }
    
    public isHoveringButtonDoorNav1(): boolean {
        return this.hoveringbuttonDoorNav1;
    }
    
    public isHoveringButtonDoorNav2(): boolean {
        return this.hoveringbuttonDoorNav2;
    }
    
    public isHoveringButtonDoorMotor1(): boolean {
        return this.hoveringbuttonDoorMotor1;
    }
    
    public sHoveringButtonDoorMotor2(): boolean {
        return this.hoveringbuttonDoorMotor2;
    }
    
    public isHoveringTelephone(): boolean {
        return this.hoveringTelephone;
    }
    
    public isHoveringPhoto(): boolean {
        return this.hoveringPhoto;
    }
    
    public isHoveringPaperSheet(): boolean {
        return this.hoveringPaperSheet;
    }

    public isHoveringExplorerSheet(): boolean {
        return this.hoveringExplorerSheet;
    }

    public isHoveringDiaries(): boolean {
        return this.hoveringDiaries;
    }
    
    public isHoveringMotor(): boolean {
        return this.hoveringMotor;
    }
    
    public isHoveringUp(): boolean {
        return this.hoveringUp;
    }
    
    public isHoveringDown(): boolean {
        return this.hoveringDown;
    }
    
    public isHoveringLeft(): boolean {
        return this.hoveringLeft;
    }
    
    public isHoveringRight(): boolean {
        return this.hoveringRight;
    }
    
    openDoors(): void {
        this.ship.getDoors().forEach((door) => {
            if (door.mesh && !door.isOpen) {
                this.openDoor(door, this.enableDoor);
            }
        });
    }

    closeDoors(): void {
        this.ship.getDoors().forEach((door) => {
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
                this.shipSounds.playSound("sons/door.mp3",0.25);
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
                    this.shipSounds.playSound("sons/door.mp3",0.25);
                    this.updateMeshPositionY(door.mesh, offset, 30);
                }
            } 
        }
    }

    
    
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
    

    enableDoor = true;

    toggleEngine(): void {
        if (this.engineState) {
            this.shutDownEngine();
        } else {
            this.powerEngine();
        }
    }


    powerEngine() {
        if (!this.engineRestartAllowed) {
            console.log("Le moteur ne peut plus être rallumé !");
            return;
        }

        this.engineState = true;
        this.shipSounds.getBuzzingSound().play();
        this.shipSounds.getMotorSound().play();
        this.enableDoor= true;
        this.closeDoor(this.ship.getDoorByName("exterior")!, this.enableDoor);

        this.ship.diffuseTextureOn();
        this.shipLight.getLights().forEach((light) => {
            light.diffuse = new Color3(106, 143, 63);
            light.intensity = 5;
        });

        this.shipSounds.getHorrorSound().stop();
        this.hostilitySystem.setupHostile(120);

        this.shipSounds.getDeathSound().stop();
        this.shipSounds.getRunningDeathSound().stop();
        clearTimeout(this.hostilitySystem.getDeathTimeOut());
        this.navigationSystem.updateDataScreen();
        this.navigationSystem.updateSineWave();
        this.navigationSystem.updateBoussoleScreen();
    }

    shutDownEngine() {
        this.engineState = false;
        this.engineRestartAllowed = true;
        this.shipSounds.getBuzzingSound().stop();
        this.shipSounds.getMotorSound().stop();

        this.shipSounds.getDeathSound().play();

        this.openDoors();
        this.enableDoor = false;
        this.ship.diffuseTextureOff();
        this.shipLight.getLights().forEach((light) => {
            light.diffuse = new Color3(175, 0, 0);
            light.intensity = 2;
        });

        this.shipSounds.getHorrorSound().play();

        this.hostilitySystem.deathInitiated();
        this.navigationSystem.updateDataScreen();
        this.navigationSystem.updateSineWave();
        this.navigationSystem.updateBoussoleScreen();
    }
  

    public enableEvents(): void {
        this.canvas.addEventListener("pointerdown", this.handleMouseDownBound);
        this.canvas.addEventListener("pointerup", this.handleMouseUpBound);
        this.canvas.addEventListener("pointerleave", this.handleMouseUpBound);
        this.canvas.addEventListener("wheel", this.handleScrollBound);

        window.addEventListener("keydown", this.handleKeyDownBound);
        window.addEventListener("keyup", this.handleKeyUpBound);
    }

    public disableEvents(): void {
        this.canvas.removeEventListener("pointerdown", this.handleMouseDownBound);
        this.canvas.removeEventListener("pointerup", this.handleMouseUpBound);
        this.canvas.removeEventListener("pointerleave", this.handleMouseUpBound);
        this.canvas.removeEventListener("wheel", this.handleScrollBound);

        window.removeEventListener("keydown", this.handleKeyDownBound);
        window.removeEventListener("keyup", this.handleKeyUpBound);
    }

    private wasHovering = false;

    isHoveringSomeButtonForNavigation(): boolean {
        return this.hoveringAmplitude || this.hoveringFrequency || this.hoveringUp || this.hoveringDown || this.hoveringLeft || this.hoveringRight;
    }

    isHoveringSomeButtonForNavDoor(): boolean {
        return this.hoveringbuttonDoorNav1 || this.hoveringbuttonDoorNav2;
    }
    isHoveringSomeButtonForMotorDoor(): boolean {
        return this.hoveringbuttonDoorMotor1 || this.hoveringbuttonDoorMotor2;
    }

    handleMouseDown(event: PointerEvent): void {
        if(event.button !== 0) return;
        if (this.isHoveringSomeButtonForNavigation()) {
            this.navigationSystem.startIncrementing();
        } else if (this.hoveringPhoto) {
            this.objectiveSystem.takePhoto();
        } else if (this.hoveringMotor) {
            this.toggleEngine();
        } else if (this.hoveringPaperSheet) {
            displayDocument(this.canvas, this, this.ship.languageValue, this.objectiveSystem, "doc");
        } else if (this.hoveringDiaries) {
            displayDocument(this.canvas, this,this.ship.languageValue, this.objectiveSystem, "diaries");
        } else if(this.hoveringExplorerSheet) {
            displayDocument(this.canvas, this,this.ship.languageValue, this.objectiveSystem, "explorer");
        }
        else if (this.isHoveringSomeButtonForNavDoor()) {
            this.toggleDoor(this.ship.getDoorByName("nav")!);
        }
        else if (this.isHoveringSomeButtonForMotorDoor()) {
            this.toggleDoor(this.ship.getDoorByName("motor")!);
        }
        else if (this.hoveringTelephone){
            this.narrationSystem.answerPhone();
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
                this.shipSounds.playSound("sons/pressdown.mp3", 0.5);
                this.updateMeshPositionY(this.lastButton, offset, 120);
            }
        }

        
    }

    handleMouseUp(): void {
        if (this.wasHovering) {
            this.wasHovering = false;
            this.shipSounds.playSound("sons/pressup.mp3", 0.5);
        }
        if (this.lastButton && this.initialMeshesPositions.has(this.lastButton)) {
            const initialY = this.initialMeshesPositions.get(this.lastButton)!;
            const offset = initialY - this.lastButton.position.y;
    
            this.updateMeshPositionY(this.lastButton, offset, 120);
        }
        this.navigationSystem.stopIncrementing();
    }

    handleScroll(event: WheelEvent): void {
        this.navigationSystem.scrollIncrements(event);
    }

    private pressedKeys: Set<string> = new Set();

    handleKeyDown(event: KeyboardEvent): void {
        
        const key = event.code; // Utilisation de event.code pour garantir la compatibilité AZERTY/QWERTY
        if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(key) && getAffichePage()) {
            this.pressedKeys.add(key);
            if (this.shipSounds.getMetalFootSteps() && !this.shipSounds.getMetalFootSteps().isPlaying && !this.shipSounds.leftSpaceShip()) {
                this.shipSounds.getMetalFootSteps().play();
            } 
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        const key = event.code;
        if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(key) && getAffichePage()) {
            this.pressedKeys.delete(key);
            if (this.pressedKeys.size === 0 && this.shipSounds.getMetalFootSteps()  && this.shipSounds.getMetalFootSteps().isPlaying) {
                this.shipSounds.getMetalFootSteps().stop();
            }
        }
    }


    setupButtonHoverDetection(): void {
        this.scene.onPointerMove = () => {
            const hit = this.scene.pick(this.scene.getEngine().getRenderWidth() / 2, this.scene.getEngine().getRenderHeight() / 2);
    
            this.hoveringAmplitude = hit?.pickedMesh === this.ship.getButtonAmplitude();
            this.hoveringFrequency = hit?.pickedMesh === this.ship.getButtonFrequency();
            this.hoveringUp = hit?.pickedMesh === this.ship.getButtonUp();
            this.hoveringDown = hit?.pickedMesh === this.ship.getButtonDown();
            this.hoveringLeft = hit?.pickedMesh === this.ship.getButtonLeft();
            this.hoveringRight = hit?.pickedMesh === this.ship.getButtonRight();
            this.hoveringPhoto = hit?.pickedMesh === this.ship.getButtonPhoto();
            this.hoveringMotor = hit?.pickedMesh === this.ship.getButtonMotor();
            this.hoveringTelephone = hit?.pickedMesh === this.ship.getTelephone();
            this.hoveringPaperSheet = hit?.pickedMesh === this.ship.getPaperSheet();
            this.hoveringExplorerSheet = hit?.pickedMesh === this.ship.getExplorerSheet();
            this.hoveringDiaries = hit?.pickedMesh === this.ship.getDiaries();
            this.hoveringbuttonDoorMotor1 = hit?.pickedMesh=== this.ship.getButtonDoorMotor()[0];
            this.hoveringbuttonDoorMotor2 = hit?.pickedMesh=== this.ship.getButtonDoorMotor()[1];
            this.hoveringbuttonDoorNav1 = hit?.pickedMesh=== this.ship.getButtonDoorNav()[0];
            this.hoveringbuttonDoorNav2 = hit?.pickedMesh=== this.ship.getButtonDoorNav()[1];
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
                { mesh: this.ship.getButtonAmplitude(), hovering: this.hoveringAmplitude },
                { mesh: this.ship.getButtonFrequency(), hovering: this.hoveringFrequency },
                { mesh: this.ship.getButtonUp(), hovering: this.hoveringUp },
                { mesh: this.ship.getButtonDown(), hovering: this.hoveringDown },
                { mesh: this.ship.getButtonLeft(), hovering: this.hoveringLeft },
                { mesh: this.ship.getButtonRight(), hovering: this.hoveringRight },
                { mesh: this.ship.getButtonPhoto(), hovering: this.hoveringPhoto },
                { mesh: this.ship.getButtonMotor(), hovering: this.hoveringMotor },
                { mesh: this.ship.getPaperSheet(), hovering: this.hoveringPaperSheet },
                { mesh: this.ship.getDiaries(), hovering: this.hoveringDiaries },
                {mesh : this.ship.getExplorerSheet(), hovering: this.hoveringPaperSheet},
                { mesh: this.ship.getTelephone(), hovering: this.hoveringTelephone },
                { mesh: this.ship.getButtonDoorMotor()[0], hovering: this.hoveringbuttonDoorMotor1},
                { mesh: this.ship.getButtonDoorMotor()[1], hovering: this.hoveringbuttonDoorMotor2},
                { mesh: this.ship.getButtonDoorNav()[0], hovering: this.hoveringbuttonDoorNav1},
                { mesh: this.ship.getButtonDoorNav()[1], hovering: this.hoveringbuttonDoorNav2}
            ];
            
            elements.forEach(({ mesh, hovering }) => {
                if (mesh) {
                    if (hovering) {
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
    //  Gestion de l'enfoncement des touches     
    //


    private lastButton!: AbstractMesh | null;


    getCurrentButton(): AbstractMesh | null {
        if (this.hoveringUp) return this.ship.getButtonUp();
        if (this.hoveringDown) return this.ship.getButtonDown();
        if (this.hoveringRight) return this.ship.getButtonRight();
        if (this.hoveringLeft) return this.ship.getButtonLeft();
        if (this.hoveringPhoto) return this.ship.getButtonPhoto();
        if (this.hoveringMotor) return this.ship.getButtonMotor();
        if (this.hoveringbuttonDoorMotor1) return this.ship.getButtonDoorMotor()[0];
        if (this.hoveringbuttonDoorMotor2) return this.ship.getButtonDoorMotor()[1];
        if (this.hoveringbuttonDoorNav1) return this.ship.getButtonDoorNav()[0];
        if (this.hoveringbuttonDoorNav2) return this.ship.getButtonDoorNav()[1];

        return null;
    }
}
