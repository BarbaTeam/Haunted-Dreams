import { ICanvasRenderingContext, Scene } from "@babylonjs/core";
import { Ship } from "./Ship";
import { ObjectiveSystem } from "./ObjectiveSystem";
import { ShipControls } from "./ShipControls";

export class NavigationSystem {
    private scene: Scene;
    private ship: Ship;
   
    private objectiveSystem!: ObjectiveSystem;
    private shipControls!: ShipControls;

    isStartOfGame = true;

    private readonly MAX_AMPLITUDE = 1.5;
    private readonly MIN_AMPLITUDE = 0.01;
    private readonly MAX_FREQUENCY = 10;
    private readonly MIN_FREQUENCY = 1;

    private amplitude = 0.01; 
    private frequency = 1; 

    private amplitudePos = 0.1; 
    private frequencyPos = 1; 

    private angle = Math.random() * Math.PI * 2;
    private points: { x: number, y: number }[] = [];
    private angle_points: number[] = [];
    private isDistorted = true;
    private isIncrementing = false;

    constructor(scene: Scene, ship: Ship){
        this.scene = scene;
        this.ship = ship;
    }

    public setObjectiveSystem(objectiveSystem: ObjectiveSystem): void {
        this.objectiveSystem = objectiveSystem;
    }

    public setShipControls(shipControls: ShipControls): void {
        this.shipControls = shipControls;
    }

    public getAmplitude(): number{
        return this.amplitude;
    }
    public getFrequency(): number{
        return this.frequency;
    }
    public getAngle(): number {
        return this.angle;
    }
    public setFrequencyPos(number: number): void {
        this.frequencyPos = number;
    }
    public setIsDistorted(bool: boolean): void {
        this.isDistorted = bool;
    }
    
    updateSineWave(): void {

        const centerY = 256;
        const waveHeight = 80;
        const waveLength = Math.PI * 4;
    
        const drawSineWave = (context: ICanvasRenderingContext, amplitude: number, frequency: number, color: string, allowDistorded: boolean): void => {
            context.strokeStyle = color;
            context.lineWidth = 3;
            context.beginPath();
            
            for (let i = 0; i < 512; i++) {
                const x = i;

                const y = this.isDistorted && allowDistorded
                    ? centerY + 
                        Math.sin(i * 0.1 + Math.random() * 50) * (Math.random() * 50) + 
                        Math.cos(i * 0.05 + Math.random() * 30) * (Math.random() * 30) +
                        (Math.random() - 0.5) * 10
                    : centerY - amplitude * Math.sin(frequency * (i / 512) * waveLength) * waveHeight;


                i === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
            }
    
            context.stroke();
        };

        if(this.shipControls.getEngineState() == false){
            [this.ship.getSelectorScreen(), this.ship.getNavScreen()].forEach((screenTexture) => {
                if (!screenTexture) return;
                const ctx = screenTexture.getContext();
                if (!ctx) return;
    
                ctx.fillStyle = "black"; 
                ctx.fillRect(0, 0, 512, 512);
                screenTexture.update();
            });
    
            return;
        }
    
        // Met à jour les textures
        [this.ship.getSelectorScreen(), this.ship.getNavScreen()].forEach((screenTexture) => {
            if (!screenTexture) return;
            const ctx = screenTexture.getContext();
            if (!ctx) return;
    
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, 512, 512);
           
            // Utilisation du vert normal pour `screenTextureSelecteur`
            drawSineWave(ctx, this.amplitude, this.frequency, "lime", false);
            
    
            screenTexture.update();
        });
    
        // Onde liée à la position du vaisseau (en vert clair)
        if (this.ship.getNavScreen()) {
            const ctx = this.ship.getNavScreen().getContext();
            
            drawSineWave(ctx, this.amplitudePos, this.frequencyPos, "#90EE90", true); // Vert clair (light green)
            this.ship.getNavScreen().update();
            
        }

        this.isStartOfGame = false; // Ppour le premier affichage
    }
    

    updateDataScreen(): void {
        if(this.shipControls.getEngineState() == false){
            this.ship.getMetricScreen()[0].clear();//amplitude
            this.ship.getMetricScreen()[0].update();
            this.ship.getMetricScreen()[1].clear();//freq
            this.ship.getMetricScreen()[1].update();
            return;
        }
        if (this.ship.getMetricScreen()[0]) {
            this.ship.getMetricScreen()[0].clear();
            this.ship.getMetricScreen()[0].drawText(
                `A : ${this.amplitude.toFixed(2)}`,
                70, 150, "80px Arial",
                "lime", "transparent", false, true
            );
        }
        
        if (this.ship.getMetricScreen()[1]) {
            this.ship.getMetricScreen()[1].clear();
            this.ship.getMetricScreen()[1].drawText(
                `f : ${this.frequency.toFixed(2)} Hz`,
                70, 150, "80px Arial",
                "lime", "transparent", false, true
            );
        }
    }

    updateBoussoleScreen(): void {

        const drawCircle = (context: ICanvasRenderingContext, color: string): void => {
            const centerX = 256;
            const centerY = 256;
            const radius = 220;
        
            for (let i = 0; i < 21; i++) {
                const angle = (i / 21) * 2 * Math.PI; // Diviser l'angle en 21 parts égales
                const x = centerX + radius * Math.cos(angle); // Calculer la position X
                const y = centerY + radius * Math.sin(angle); // Calculer la position Y
        
                this.points.push({ x, y }); // Stocker les coordonnées dans le tableau
                this.angle_points.push(angle);
                // Dessiner un petit cercle pour chaque point
                context.beginPath();
                
                context.arc(x, y, 20, 0, 2 * Math.PI);
                //console.log("angle point: " +this.angle_points[i].toFixed(1))
                //console.log("angle to aim: "+ this.angleToAim?.toFixed(1))
                if(this.objectiveSystem.getAngleToAim() && this.angle_points[i].toFixed(1) === this.objectiveSystem.getAngleToAim()!.toFixed(1)){
                    context.fillStyle = "lime"; 
                }
                else{
                    context.fillStyle = color; 
                }
                context.fill();
            }
            console.log(this.angle_points);
            console.log("currentangle = "+ this.angle + "angle to aim = "+ this.objectiveSystem.getAngleToAim());
        
        };

        const drawArrow = (context: ICanvasRenderingContext, angle: number): void => {
            const startX = 256; 
            const startY = 256; 
            const arrowHeadLength = 100; 
            const arrowHeadWidth = 70;
            const color = "#FF0000";
        
            // Sauvegarde l'état du contexte (pour ne pas affecter les autres dessins)
            context.save();

            // Déplacer le point de référence au centre de la flèche
            context.translate(startX, startY);
            // Appliquer la rotation en fonction de l'angle
            context.rotate(angle);

            context.beginPath();
            context.arc(0, 0, 150, 0, 2 * Math.PI);
            context.fillStyle = "#000000"; // Remplir avec la couleur
            context.fill();

            // Dessiner la tête de la flèche sous forme de triangle allongé
            context.strokeStyle = color;
            context.lineWidth = 3;
            context.beginPath();

            context.moveTo(130, 0); 
        
            // Point à gauche de la base du triangle (base de la flèche)
            context.lineTo(-arrowHeadLength, -arrowHeadWidth); 
        
            // Point à droite de la base du triangle
            context.lineTo(-arrowHeadLength, arrowHeadWidth); 
        
            // Retour au centre de la flèche
            context.closePath();
        
            // Dessiner le triangle
            context.stroke();
        
            // Remplir le triangle avec la couleur
            context.fillStyle = color;
            context.fill();
        
            // Restaure l'état du contexte (pour ne pas affecter d'autres dessins)
            context.restore();
        };
        
        if(this.shipControls.getEngineState() == false){
            if (!this.ship.getCompassScreen()) return;
            const ctx = this.ship.getCompassScreen().getContext();
            if (!ctx) return;

            ctx.fillStyle = "black"; 
            ctx.fillRect(0, 0, 512, 512);
            this.ship.getCompassScreen().update();
    
            return;
        }

        if (this.ship.getCompassScreen()) {
            const context = this.ship.getCompassScreen().getContext(); // Récupère le contexte de dessin 2D du canvas
            if (context) {
                drawCircle(context, "#013500",);
                drawArrow(context, this.angle);
            }
        }
        

        this.ship.getCompassScreen().update();
    }
    

    
    startIncrementing(): void {
        if (this.isIncrementing) return; 
        this.isIncrementing = true;

        const updateLoop = () => {
            if (!this.isIncrementing) return;
            
            if (this.shipControls.isHoveringUp()) this.amplitudePos = Math.min(this.amplitudePos + 0.0025, this.MAX_AMPLITUDE);
            else if (this.shipControls.isHoveringDown()) this.amplitudePos = Math.max(this.amplitudePos - 0.0025, this.MIN_AMPLITUDE);
            else if (this.shipControls.isHoveringRight()) {
                this.angle = (this.angle - Math.PI / 500) % (2 * Math.PI);
            }
            else if (this.shipControls.isHoveringLeft()) {
                this.angle = (this.angle + Math.PI / 500) % (2 * Math.PI);
            }
            if (this.angle < 0) {
                this.angle += 2 * Math.PI;
            }
            this.objectiveSystem.updateObjectives();
            this.updateSineWave();
            this.updateBoussoleScreen();

            requestAnimationFrame(updateLoop);
        };

        requestAnimationFrame(updateLoop);
    }

    stopIncrementing(): void {
        this.isIncrementing = false;
    }

    scrollIncrements(event: WheelEvent): void {
        if (this.shipControls.isHoveringAmplitude()) {
            this.amplitude += event.deltaY < 0 ? 0.01 : -0.01;
        } else if (this.shipControls.isHoveringFrequency()) {
            this.frequency += event.deltaY < 0 ? 0.01 : -0.01;
        }

        this.amplitude = Math.min(this.MAX_AMPLITUDE, Math.max(this.MIN_AMPLITUDE, this.amplitude));
        this.frequency = Math.min(this.MAX_FREQUENCY, Math.max(this.MIN_FREQUENCY, this.frequency));

        if (this.shipControls.isHoveringAmplitude() || this.shipControls.isHoveringFrequency()) {
            this.updateSineWave();
            this.updateDataScreen();
            this.objectiveSystem.updateObjectives();
        }
    }
    
    isOverlap() {
        return Math.abs(this.amplitudePos - this.objectiveSystem.getCurrentNightmare().nmAmplitude) < 0.01 && Math.abs(this.frequencyPos - this.objectiveSystem.getCurrentNightmare().nmFrequency) < 0.01;
    }
}