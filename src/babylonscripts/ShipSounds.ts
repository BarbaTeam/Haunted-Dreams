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


        window.addEventListener('tutoEnd', (e) => {
            this.playLittleSound(this.scene);            
        });

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

    playLittleSound(scene : Scene): void {
        const soundPaths = [
        "sons/pleure.mp3",
        "sons/rire.mp3",
        "sons/chuchote.mp3",
        ];

        // Chargement des sons
        const sounds = soundPaths.map(path => new Sound("sound", path, scene, null, { volume: 0.5, autoplay: true, loop: false }));

        // Fonction pour jouer un son aléatoire
        const playRandomSound = () => {
            const randomIndex = Math.floor(Math.random() * sounds.length);
            const sound = sounds[randomIndex];
            if (sound.isPlaying) sound.stop();
            sound.play();
        };

        // Joue un son immédiatement puis toutes les 5 à 10 minutes
        setInterval(playRandomSound, 5 * 60 * 1000 + (Math.random() * 5 * 60 *1000));
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
    playOpenDocument(): void{
        return;
    }
    playCloseDocument(): void{
        return;
    }
}