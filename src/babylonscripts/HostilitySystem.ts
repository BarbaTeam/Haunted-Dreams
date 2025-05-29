import { ObjectiveSystem } from "./ObjectiveSystem";
import { ShipControls } from "./ShipControls";
import { ShipSounds } from "./ShipSounds";

export class HostilitySystem {
    private objectiveSystem!: ObjectiveSystem;
    private shipControls!: ShipControls;
    private shipSounds: ShipSounds;

    private deathTimeoutId: number | undefined;
    private shutdownTimeoutId: number | null = null;
    private knockingTimeoutId: number | null = null;

    private isShutdownScheduled = false;
    private isKnockingScheduled = false;
    private isDeathInitiated = false;

    public hasEnded = false;

    constructor(shipSounds: ShipSounds) {
        this.shipSounds = shipSounds;

        window.addEventListener('noGeneratorInteractions', () => {
            this.hasEnded = true;
        });
    }

    public setObjectiveSystem(objectiveSystem: ObjectiveSystem): void {
        this.objectiveSystem = objectiveSystem;
    }

    public setShipControls(shipControls: ShipControls): void {
        this.shipControls = shipControls;
    }

    public getDeathTimeOut(): number | undefined {
        return this.deathTimeoutId;
    }

    public setupHostile(shutdownTimer: number): void {
        if (this.objectiveSystem.getNightmareIndex() > 0) {
            this.scheduleShutdownEvent(shutdownTimer);
            this.scheduleKnockingEvent();
        }
    }

    private scheduleShutdownEvent(shutdownTimer: number): void {
        if (this.isShutdownScheduled) return;
        this.isShutdownScheduled = true;

        const delay = shutdownTimer * 1000 - Math.random() * 0.3 * shutdownTimer * 1000;

        this.shutdownTimeoutId = window.setTimeout(() => {
            this.shipControls.shutDownEngine();
        }, delay);
    }

    private scheduleKnockingEvent(): void {
        if (this.isKnockingScheduled) return;
        this.isKnockingScheduled = true;

        const delay = Math.random() * 5000;

        this.knockingTimeoutId = window.setTimeout(() => {
            console.log("Knocking event triggered");
        }, delay);
    }

    public deathInitiated(): void {
        if (this.isDeathInitiated) return;
        this.isDeathInitiated = true;

        this.deathTimeoutId = window.setTimeout(() => {
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
        Object.assign(blackScreen.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor: "black",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            zIndex: "9999"
        });
        document.body.appendChild(blackScreen);

        const killSound = this.shipSounds.playSound("sons/kill.mp3", 2);

        killSound.onEndedObservable.add(() => {
            if (this.hasEnded) {
                const text = document.createElement("div");
                text.innerText =
                    "HauntedDreams\n Merci d'avoir joué !\n\n\nDéveloppé par :\n\n Deyann KOPERECZ\n Tom BOUILLOT\n Lucie FAURE-BEAULANDE\n\n\n Remerciements :\n\n Mathias HELLAL (Musique du menu)\n Hector BENOIT (Trailer du jeu)\n\n\n Effets sonores libres de droits";
                Object.assign(text.style, {
                    whiteSpace: "pre-line",
                    textAlign: "center",
                    fontSize: "32px"
                });
                blackScreen.appendChild(text);

                setTimeout(() => location.reload(), 20000);
            } else {
                location.reload();
            }
        });
    }

    public clearAllTimeouts(): void {
        if (this.shutdownTimeoutId) clearTimeout(this.shutdownTimeoutId);
        if (this.knockingTimeoutId) clearTimeout(this.knockingTimeoutId);
        if (this.deathTimeoutId) clearTimeout(this.deathTimeoutId);
    }
}
