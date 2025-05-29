import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from "@babylonjs/gui";
import { ObjectiveSystem } from "./ObjectiveSystem";
import { ShipControls } from "./ShipControls";
import { ShipSounds } from "./ShipSounds";

export class HostilitySystem {
    private objectiveSystem!: ObjectiveSystem;
    private shipControls!: ShipControls;
    private shipSounds: ShipSounds;
    private deathTimeOut!: number;
    private hostileSetupDone = false;

    hasEnded = false;

    constructor(shipSounds: ShipSounds) {
        this.shipSounds = shipSounds;
        window.addEventListener('noGeneratorInteractions', (e) => {
            this.hasEnded = true;
        })
    }

    public setObjectiveSystem(objectiveSystem: ObjectiveSystem): void {
        this.objectiveSystem = objectiveSystem;
    }

    public setShipControls(shipControls: ShipControls): void {
        this.shipControls = shipControls;
    }

    public getDeathTimeOut(): number {
        return this.deathTimeOut;
    }

    public setupHostile(shutdownTimer: number): void {
        if (this.hostileSetupDone) return;

        if (this.objectiveSystem.getNightmareIndex() > 0) {
            this.hostileSetupDone = true;
            this.setupShutdownEvent(shutdownTimer);
            this.setupKnockingEvent();
        }
    }

    public resetHostileSetup(): void {
        this.hostileSetupDone = false;
    }

    private setupShutdownEvent(shutdownTimer: number): void {
        const randomDelay = shutdownTimer * 1000 - Math.random() * 0.3 * shutdownTimer * 1000;

        setTimeout(() => {
            console.log("engine event triggered");
            this.shipControls.shutDownEngine();
        }, randomDelay);
    }

    private setupKnockingEvent(): void {
        const randomDelay = Math.random() * 5000;

        setTimeout(() => {
            console.log("Knocking event triggered");
        }, randomDelay);
    }

    public deathInitiated(): void {
        this.deathTimeOut = window.setTimeout(() => {
            this.shipControls.setEngineRestartAllowed(false);
            const deathSound = this.shipSounds.getRunningDeathSound();
            deathSound.play();

            deathSound.onEndedObservable.add(() => {
                this.kill();
            });
        }, 7000);
    }

    public kill(): void {
        const blackScreen = document.createElement("div");
        blackScreen.style.position = "fixed";
        blackScreen.style.top = "0";
        blackScreen.style.left = "0";
        blackScreen.style.width = "100vw";
        blackScreen.style.height = "100vh";
        blackScreen.style.backgroundColor = "black";
        blackScreen.style.color = "white";
        blackScreen.style.display = "flex";
        blackScreen.style.justifyContent = "center";
        blackScreen.style.alignItems = "center";
        blackScreen.style.flexDirection = "column";
        blackScreen.style.zIndex = "9999";
        document.body.appendChild(blackScreen);

        const killSound = this.shipSounds.playSound("sons/kill.mp3", 2);

        killSound.onEndedObservable.add(() => {
            if (this.hasEnded) {
                const text = document.createElement("div");
                text.innerText = "HauntedDreams\n Merci d'avoir joué !\n\n\nDéveloppé par :\n\n Deyann KOPERECZ\n Tom BOUILLOT\n Lucie FAURE-BEAULANDE\n\n\n Remerciements :\n\n Mathias HELLAL (Musique du menu)\n Hector BENOIT (Trailer du jeu)\n\n\n Effets sonores libres de droits";
                text.style.whiteSpace = "pre-line";
                text.style.textAlign = "center";
                text.style.fontSize = "32px";
                blackScreen.appendChild(text);
                setTimeout(() => {
                    location.reload();
                }, 20000);
            } else {
                location.reload();
            }
        });
    }


}
