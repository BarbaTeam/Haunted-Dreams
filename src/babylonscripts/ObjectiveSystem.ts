import { Scene, Sound } from "@babylonjs/core";
import { Ship } from "./Ship";
import { NavigationSystem } from "./NavigationSystem";
import { ShipSounds } from "./ShipSounds";
import { HostilitySystem } from "./HostilitySystem";
import * as GUI from '@babylonjs/gui'


type Nightmare = {
    nmAmplitude: number;
    nmFrequency: number;
    nmAngle: number;
}

export class ObjectiveSystem {
    private scene: Scene;
    private ship : Ship;
    private shipSounds : ShipSounds;

    private navigationSystem! : NavigationSystem;
    private hostilitySystem!: HostilitySystem;

    private nightmares: Nightmare[] = [
        {
            nmAmplitude : 1.50,
            nmFrequency : 3.60,
            nmAngle : 5.10
        },
        {
            nmAmplitude : 0.51,
            nmFrequency : 2.60,
            nmAngle : 3.30
        },
        {
            nmAmplitude : 1.10,
            nmFrequency : 5.98,
            nmAngle : 1.20
        },
        {
            nmAmplitude : 0.40,
            nmFrequency : 7.50,
            nmAngle : 5.70
        },
        {
            nmAmplitude : 1.36,
            nmFrequency : 6.45,
            nmAngle : 2.70
        },
        {
            nmAmplitude : 0.90,
            nmFrequency : 5.23,
            nmAngle : 1.50
        },
        {
            nmAmplitude : 1.27,
            nmFrequency : 4.72,
            nmAngle : 5.80
        },
        {
            nmAmplitude : 0.19,
            nmFrequency : 3.45,
            nmAngle : 2.30
        },
        { //faux cauchemar
            nmAmplitude : 10,
            nmFrequency : 50,
            nmAngle : 6.00
        }
    ]
    private nightMareIndex = 0;
    private angleToAim: number | undefined;

    constructor(scene: Scene, ship: Ship, shipSounds: ShipSounds) {
        this.scene = scene;
        this.ship = ship;
        this.shipSounds = shipSounds;
    }
    
    public setNavigationSystem(navigationSystem: NavigationSystem): void {
        this.navigationSystem = navigationSystem;
    }
    public setHostilitySystem(hostilitySystem: HostilitySystem): void {
        this.hostilitySystem = hostilitySystem;
    }


    public getAngleToAim(): number | undefined{
        return this.angleToAim;
    }

    public getNightmares(): Nightmare[] {
            return this.nightmares;
    }

    public getNightmareIndex(): number {
        return this.nightMareIndex;
    }

    public getCurrentNightmare(): Nightmare {
        return this.nightmares[this.nightMareIndex];
    }

    public incrNightmare(): void {
        this.nightMareIndex++;
    }

    private beenPlayed = false;
    updateObjectives(){
        if(this.getCurrentNightmare().nmAmplitude.toFixed(2)===this.navigationSystem.getAmplitude().toFixed(2) && this.getCurrentNightmare().nmFrequency.toFixed(2) === this.navigationSystem.getFrequency().toFixed(2)){
            this.angleToAim = this.getCurrentNightmare().nmAngle;
            if(!this.beenPlayed){
                this.beenPlayed = true;
                new Sound("", "sons/beep.mp3", this.scene, null, { volume: 1, autoplay: true, loop: false });
            }
            if(this.navigationSystem.getAngle().toFixed(1) === this.angleToAim.toFixed(1)){
                this.navigationSystem.setFrequencyPos(this.navigationSystem.getFrequency());
                this.navigationSystem.setIsDistorted(false);
            } else {
                this.navigationSystem.setIsDistorted(true);
            }
        }
        else {
            this.beenPlayed = false;
            this.angleToAim = undefined;
            this.navigationSystem.setIsDistorted(true);
        }
        this.navigationSystem.updateBoussoleScreen();
    }

    private isTakingPhoto = false;
    takePhoto(): void {
        if (this.navigationSystem.isOverlap() && !this.isTakingPhoto) {
            this.isTakingPhoto = true;
            this.shipSounds.playPhotoSounds();
            setTimeout(() => {
                this.hostilitySystem.setupHostile(190);
                this.ship.getPhotoByIndex(this.nightMareIndex).visibility = 1;
                if (this.nightMareIndex < this.nightmares.length - 1) {
                    this.nightMareIndex++;
                    this.updateObjectives();
                    this.isTakingPhoto = false;
                }
            }, 4000);
        } else if (!this.isTakingPhoto) {
            this.isTakingPhoto = true;
            this.shipSounds.playDreamPhotoSounds();
            this.hostilitySystem.setupHostile(10);
            this.isTakingPhoto=false;
        }
    }

    showPaper(): void {
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        const image = new GUI.Image('but', 'src/assets/nightmares/nightmare1-processed.png');
        image.width = 0.2;
        image.height = "100%";
        image.width = "25%";
        advancedTexture.addControl(image);    
    }

}