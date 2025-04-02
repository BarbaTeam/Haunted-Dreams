import { ObjectiveSystem } from "./ObjectiveSystem";
import { ShipControls } from "./ShipControls";
import { ShipSounds } from "./ShipSounds";

export class HostilitySystem{
    
    private objectiveSystem!: ObjectiveSystem;
    private shipControls!: ShipControls;
    private shipSounds: ShipSounds;
    private deathTimeOut: any;

    constructor(shipSounds: ShipSounds){
        this.shipSounds = shipSounds;
    }

    public setObjectiveSystem(objectiveSystem: ObjectiveSystem): void {
        this.objectiveSystem = objectiveSystem;
    }
    public setShipControls(shipControls: ShipControls): void {
        this.shipControls = shipControls;
    }
    public getDeathTimeOut(): any{
        return this.deathTimeOut;
    }

    setupHostile(shutdownTimer: number){
        if(this.objectiveSystem.getNightmareIndex()>0){
            this.setUpShutDownEvents(shutdownTimer);
            this.setUpKnockingEvents();
        }
    }

    setUpShutDownEvents(shutdownTimer: number){
        const randomDelay = shutdownTimer*1000 - Math.random() * 0.3*shutdownTimer*1000;
        setTimeout(() => {
            console.log("Événement de shutdown activé");
            this.shipControls.shutDownEngine();
        }, randomDelay);
    }
    
    setUpKnockingEvents(){
        const randomDelay = Math.random() * 5000; 
        setTimeout(() => {
            console.log("Événement de frappe à la porte activé");

        }, randomDelay);
    }

    
    
        
    deathInitiated() {
        this.deathTimeOut = setTimeout(() => {
            this.shipControls.setEngineRestartAllowed(false);
            this.shipSounds.getRunningDeathSound().play();
            this.shipSounds.getRunningDeathSound().onEndedObservable.add(() => {
                this.kill();
            });
        }, 7000);
    }

    kill() {
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