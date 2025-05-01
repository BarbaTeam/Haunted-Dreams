import { Scene, Sound } from "@babylonjs/core";

export class ShipSounds {
    private scene: Scene;
    private deathSound: Sound;
    private runningDeathSound: Sound; 
    private metalfootstep: Sound;
    private buzzingSound: Sound;
    private motorSound: Sound;
    private horrorSound: Sound;
    private hasLeftSpaceShip = false;

    constructor(scene: Scene){
        this.scene = scene;
        this.deathSound = this.playSound("sons/deathsound.mp3", 1, false);
        this.runningDeathSound = this.playSound("sons/runningdeath.mp3", 1, false);
        this.metalfootstep = this.playSound("sons/metal-footsteps.mp3", 1, false, true);
        this.motorSound = this.playSound("sons/horror-ambience-01-66708.mp3", 0.15, true, true);
        this.horrorSound = this.playSound("sons/dark-horror-ambience-296781.mp3", 1, false, true);
        this.buzzingSound = this.playSound("sons/buzzing-sound.wav", 0.1, true, true);

    }

    playSound(url: string, volume: number, autoplay= true, loop=false): Sound {
        return new Sound("", url, this.scene, null, { volume: volume, autoplay: autoplay, loop: loop });
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

    getBuzzingSound(): Sound{
        return this.buzzingSound;
    }
    getMotorSound(): Sound{
        return this.motorSound;
    }
    getHorrorSound(): Sound{
        return this.horrorSound;
    }
    getDeathSound(): Sound{
        return this.deathSound;
    }
    getRunningDeathSound(): Sound{
        return this.runningDeathSound;
    }
    getMetalFootSteps(): Sound {
        return this.metalfootstep;
    }

    clearSounds(): void {
        this.deathSound.stop();
        this.runningDeathSound.stop();
        this.metalfootstep.stop();
        this.motorSound.stop();
        this.horrorSound.stop();
        this.buzzingSound.stop();
    }
    leaveSpaceShip(): void {
        this.hasLeftSpaceShip = true;
    }
    leftSpaceShip(): boolean {
        return this.hasLeftSpaceShip;
    }
}