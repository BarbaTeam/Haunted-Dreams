import { Color3, DynamicTexture, HighlightLayer, Mesh, MeshBuilder, Scene, Sound, StandardMaterial } from '@babylonjs/core';
import { SubtitleSystem } from './SubtitleSystem'
import { Ship } from './Ship';
import { ObjectiveSystem } from './ObjectiveSystem';
import { NavigationSystem } from './NavigationSystem';
import { ShipControls } from './ShipControls';

export class NarrationSystem {
    private scene: Scene
    private ringTone: Sound;
    private answered = false;
    private isCalling = false;
    private narratorVoices: Sound[];
    private ship: Ship;
    private objectiveSystem!: ObjectiveSystem;
    private navigationSystem!:NavigationSystem;
    private shipControls!: ShipControls;

    constructor(scene : Scene, ship: Ship) {
        this.scene = scene;
        this.ship = ship;
        this.ringTone = new Sound("", "sons/ringtone.mp3", this.scene, null, { volume: 0.5, autoplay: false, loop: true });
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
    } 

    public setNavigationSystem(navigationSystem: NavigationSystem): void {
        this.navigationSystem = navigationSystem;
    }

    public setObjectiveSystem(objectiveSystem: ObjectiveSystem): void {
        this.objectiveSystem = objectiveSystem;
    }
    public setShipControls(shipControls: ShipControls): void {
        this.shipControls = shipControls;
    }

    setupNarrator(){
        const subtitles = new SubtitleSystem();

        if(!this.answered){
            setTimeout(()=>{
                this.isCalling = true;
                this.ringTone.play() 
            },5000);
            
        }
        else {
            setTimeout(()=>{
                this.narratorVoices[0].play();
                setTimeout(() => {
                    subtitles.showSubtitle("Hello ??");
                }, 1000);               
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
    
        const textPlane = this.createFloatingText(this.ship.getPaperSheet() as Mesh, { x: 4.5, y: 1, z: 0 }, text1, text2);
    
        highlightLayer.addMesh(this.ship.getPaperSheet() as Mesh, Green());
        const handleClick = ()=>{
            if(this.shipControls.isHoveringPaperSheet()){
                highlightLayer.removeMesh(this.ship.getPaperSheet() as Mesh);
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
    
        const textPlane = this.createFloatingText(this.ship.getButtonAmplitude() as Mesh, { x: 18, y: 11, z: 6 }, text1, text2);
    
        highlightLayer.addMesh(this.ship.getButtonAmplitude() as Mesh, Green());
        highlightLayer.addMesh(this.ship.getButtonFrequency() as Mesh, Green());


        const checkValue = () => {
            if (this.objectiveSystem.getCurrentNightmare().nmAmplitude.toFixed(2)===this.navigationSystem.getAmplitude().toFixed(2) && this.objectiveSystem.getCurrentNightmare().nmFrequency.toFixed(2) === this.navigationSystem.getFrequency().toFixed(2)) {
                highlightLayer.removeMesh(this.ship.getButtonAmplitude() as Mesh);
                highlightLayer.removeMesh(this.ship.getButtonFrequency() as Mesh);
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
        const text2 = "to turn the ship towards";
        const text3 = "the dot"
    
        const textPlane = this.createFloatingText(this.ship.getButtonAmplitude() as Mesh, { x: 23, y: 11, z: 0 }, text1, text2, text3);
    
        highlightLayer.addMesh(this.ship.getButtonLeft() as Mesh, Green());
        highlightLayer.addMesh(this.ship.getButtonRight() as Mesh, Green());


        const checkValue = () => {
            if (this.navigationSystem.getAngle().toFixed(1) === this.objectiveSystem.getAngleToAim()!.toFixed(1)) {
                highlightLayer.removeMesh(this.ship.getButtonLeft() as Mesh);
                highlightLayer.removeMesh(this.ship.getButtonRight() as Mesh);
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
    
        const text1 = "Use the up/down ";
        const text2 = "arrows to update";
        const text3 = "your position's wave";
    
        const textPlane = this.createFloatingText(this.ship.getButtonAmplitude() as Mesh, { x: 23, y: 11, z: 0 }, text1, text2, text3);
    
        highlightLayer.addMesh(this.ship.getButtonUp() as Mesh, Green());
        highlightLayer.addMesh(this.ship.getButtonDown() as Mesh, Green());


        const checkValue = () => {
            if (this.navigationSystem.isOverlap()) {
                highlightLayer.removeMesh(this.ship.getButtonUp() as Mesh);
                highlightLayer.removeMesh(this.ship.getButtonDown() as Mesh);
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
    
        const textPlane = this.createFloatingText(this.ship.getButtonPhoto() as Mesh, { x: 14, y: 3, z: -1 }, text1, text2 );
    
        highlightLayer.addMesh(this.ship.getButtonPhoto() as Mesh, Green());

        const checkValue = () => {
            if (this.objectiveSystem.getNightmareIndex() != 0) {
                highlightLayer.removeMesh(this.ship.getButtonPhoto() as Mesh);
                textPlane.dispose();
                this.narratorVoices[7].play();

                clearInterval(valueWatcher);
                removeEventListener("pointerdown", checkValue);
            }
        };

        addEventListener("pointerdown", checkValue);

        const valueWatcher = setInterval(checkValue, 100);
    }
    
    createFloatingText(targetMesh: Mesh, offset = { x: 0, y: 0, z: 0 }, text1: string, text2: string, text3?: string,) {
        const plane = MeshBuilder.CreatePlane("TexturePlane", { width: 15, height: 4 }, this.scene);
        const planeMaterial = new StandardMaterial("AvatarPlaneMat", this.scene);
        
        const planeTexture = new DynamicTexture("planeTexture", { width: 512, height: 256 }, this.scene);
        planeTexture.hasAlpha = true;
    
        planeTexture.drawText(text1, 0, 40, "bold 40px Arial", "green", null, true, true);
        planeTexture.drawText(text2, 0, 75, "bold 40px Arial", "green", null, true, true);
        if(text3) planeTexture.drawText(text3, 0, 110, "bold 40px Arial", "green", null, true, true);

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

}
function Green(): import("@babylonjs/core").Color3 {
    throw new Error('Function not implemented.');
}

