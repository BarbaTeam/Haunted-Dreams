import { ObjectiveSystem } from "./ObjectiveSystem";
import { ShipControls } from "./ShipControls";
import { ShipSounds } from "./ShipSounds";

export class HostilitySystem {
    private objectiveSystem!: ObjectiveSystem;
    private shipControls!: ShipControls;
    private shipSounds: ShipSounds;
    private deathTimeOut!: number;

    constructor(shipSounds: ShipSounds) {
        this.shipSounds = shipSounds;
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
        if (this.objectiveSystem.getNightmareIndex() > 0) {
            this.setupShutdownEvent(shutdownTimer);
            this.setupKnockingEvent();
        }
    }

    private setupShutdownEvent(shutdownTimer: number): void {
        const randomDelay = shutdownTimer * 1000 - Math.random() * 0.3 * shutdownTimer * 1000;

        setTimeout(() => {
            console.log("Shutdown event triggered");
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
        blackScreen.style.zIndex = "9999";
        document.body.appendChild(blackScreen);

        const killSound = this.shipSounds.playSound("sons/kill.mp3", 2);

        killSound.onEndedObservable.add(() => {
            location.reload();
        });
    }
}
