import { Scene, Sound } from "@babylonjs/core";
import { Ship } from "./Ship";
import { NavigationSystem } from "./NavigationSystem";
import { ShipSounds } from "./ShipSounds";
import { HostilitySystem } from "./HostilitySystem";


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
            console.log("Cauchemar photographié !");
            this.shipSounds.playPhotoSounds();
            setTimeout(() => {
                this.hostilitySystem.setupHostile(60);
                this.ship.getPhotoByIndex(this.nightMareIndex).visibility = 1;
                if (this.nightMareIndex < this.nightmares.length - 1) {
                    this.nightMareIndex++;
                    this.updateObjectives();
                    this.isTakingPhoto = false;
                }
            }, 4000);
        } else if (!this.isTakingPhoto) {
            this.isTakingPhoto = true;
            console.log("Rêve photographié !");
            this.shipSounds.playDreamPhotoSounds();
            this.hostilitySystem.setupHostile(10);
            this.isTakingPhoto=false;
        }
    }

    
}