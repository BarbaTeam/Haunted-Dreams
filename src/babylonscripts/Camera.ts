
import { Scene, Vector3, UniversalCamera, ArcRotateCamera, Effect, PostProcess, Color4, BlackAndWhitePostProcess, ImageProcessingConfiguration, DefaultRenderingPipeline, Sound } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Rectangle, Image, Grid } from "@babylonjs/gui";
import { ShipControls } from "./ShipControls";
import { ShipSounds } from "./ShipSounds";
import { HostilitySystem } from "./HostilitySystem";
import { Ship } from "./Ship";
import { ObjectiveSystem } from "./ObjectiveSystem";

let affichePage = true;
let advancedTexture: AdvancedDynamicTexture | null = null;
let contenuePage: Image | null = null;
let index = 0;
let camera: UniversalCamera | null = null;
let pageZoom = false


export function createFPSCamera(scene: Scene, canvas: HTMLCanvasElement, controls: ShipControls, shipControls: ShipControls, shipSounds : ShipSounds, ship: Ship, hostilitySystem: HostilitySystem): UniversalCamera {
    camera = new UniversalCamera("UniversalCamera", new Vector3(0, 11, 0), scene);
    camera.setTarget(new Vector3(0, 10, 10));
    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.attachControl(canvas, true);
    camera.ellipsoid = new Vector3(3, 5, 3);
    camera.inertia = 0.1;
    camera.speed = 5.5;
    camera.angularSensibility = 4000;
    camera.fov = 1.2;
    advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
    
    // PostProcess: Desaturation, Vignette, Grain
    
    const bw = new BlackAndWhitePostProcess("bw", 1.0, camera);
    bw.degree = 0.3;
    
    const grain = new PostProcess("grain", "grain", ["intensity", "grainy"], null, 1.0, camera);
    grain.onApply = (effect: Effect) => {
        effect.setFloat("intensity", 30);
        effect.setFloat("grainy", 1.0);
    };
    

    canvas.addEventListener("click", () => {
        if (affichePage) {
            canvas.requestPointerLock();
        } 
        else {
            document.exitPointerLock();
        }
    });


    document.addEventListener("pointerlockchange", () => {
        if (affichePage){
            document.addEventListener("mousemove", mouseMove);
        } else {
            document.removeEventListener("mousemove", mouseMove);
        }
    });

    
    window.addEventListener("keydown", (event: KeyboardEvent) => {
        if (!contenuePage) return;
    
        if (event.key === "ArrowRight" && !affichePage) {
            if (index < 8 && contenuePage.source!.includes("doc")) {
                index++;
                contenuePage.source = "images/doc" + index + ".jpg";
            }
        } else if (event.key === "ArrowLeft" && !affichePage) {
            if (index > 0 && contenuePage.source!.includes("doc")) {
                index--;
                contenuePage.source = "images/doc" + index + ".jpg";
            }
        } else if (event.code === "Space" && !affichePage) {
            displayDocument(canvas, controls);
        }
    });

    function mouseMove(event: MouseEvent) {
        if (!camera) return;
        if(affichePage) {
            const rotationSpeed = 0.002;
            camera.rotation.y += event.movementX * rotationSpeed;
            camera.rotation.x += event.movementY * rotationSpeed;
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        } 
    }

    const defaultFov = camera.fov;
    const zoomedFov = 0.8; 

    canvas.addEventListener("mousedown", (event) => {
        if (!camera) return;
        if (event.button === 2) { // Clic droit
            camera.fov = zoomedFov;
            event.preventDefault();
        }
    });

    canvas.addEventListener("mouseup", (event) => {
        if (!camera) return;
        if (event.button === 2) { 
            camera.fov = defaultFov;
            event.preventDefault();
        }
    });

    // Désactiver le menu contextuel du clic droit
    canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });

    displayedItem(canvas, controls);

    let hasLeftSpaceShip = false;
    scene.onBeforeRenderObservable.add(() => {
        const camPos = camera!.position;
    
        if (camPos.z < -20 && !hasLeftSpaceShip) { 
            hasLeftSpaceShip = true; 
            shipControls.closeDoor(ship.getDoorByName("exterior")!, true);
            shipSounds.clearSounds();
            shipSounds.leaveSpaceShip();
            setTimeout(() => {
                hostilitySystem.kill();
            }, 1000);
        }
    });

    return camera;
}


export function displayedItem(canvas: HTMLCanvasElement, controls: ShipControls, objectiveSystem?: ObjectiveSystem, type?: string) {
    if (!advancedTexture || !camera) return;

    advancedTexture.clear();

    if (contenuePage && contenuePage.parent) {
        contenuePage.parent.removeControl(contenuePage);
    }

    contenuePage = null;

    if (affichePage) {
        // Rebind clavier AZERTY
        controls.enableEvents();
        camera.keysUp = [90,87];    // Z, W
        camera.keysDown = [83];  // S
        camera.keysRight = [68]; // D
        camera.keysLeft = [81,65];  // Q

        const crosshair = Button.CreateImageOnlyButton("crosshair", "images/circle.svg");
        crosshair.width = "15px";
        crosshair.height = "15px";
        crosshair.color = "transparent";
        crosshair.thickness = 0;

        advancedTexture.addControl(crosshair);
        camera.attachControl(canvas, true);
        canvas.requestPointerLock();
    } else {
        controls.disableEvents();
        camera.keysUp = [];
        camera.keysDown = [];
        camera.keysRight = [];
        camera.keysLeft = [];

        document.exitPointerLock();

        const page = new Grid();
        page.addColumnDefinition(0.3);
        page.addColumnDefinition(0.3);
        page.addColumnDefinition(0.3);
        switch (type) {
            case "doc":
                contenuePage = new Image("", "images/doc0.jpg");
                break;
            case "diaries":
                contenuePage = new Image("", "");
                if(objectiveSystem)
                    contenuePage.source = "images/diaries" + objectiveSystem.getNightmareIndex() + ".png";
                break;
            default:
                contenuePage = new Image("", "");
        }
        contenuePage.width = "100%";
        contenuePage.height = "100%";
        contenuePage.stretch = Image.STRETCH_UNIFORM;

        page.addControl(contenuePage, 0, 1);
        advancedTexture.addControl(page);
        camera.detachControl();
        document.exitPointerLock();

        contenuePage.onPointerClickObservable.add((event) => {
            pageZoom = !pageZoom;
            if (pageZoom) {
                const zoomFactor = 2;

                const parentWidth = canvas.clientWidth;
                const parentHeight = canvas.clientHeight;

                const offsetX = event.x - parentWidth / 2;
                const offsetY = event.y - parentHeight / 2;

                page.left = -offsetX + "px";
                page.top = -offsetY + "px";

                page.width = (zoomFactor * 100) + "%";
                page.height = (zoomFactor * 100) + "%";
            }
            else {
                page.top = 0;
                page.left = 0;
                page.width = "100%";
                page.height = "100%";
            }
        });
    }
}


export function displayDocument(canvas: HTMLCanvasElement, controls: ShipControls, objectiveSystem?: ObjectiveSystem, type?: string) {
    affichePage = !affichePage;
    displayedItem(canvas, controls, objectiveSystem, type);

    console.log("displayDocument : " + affichePage);
}

export function getAffichePage() {
    return affichePage;
}


export function createMenuCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera {
    const camera = new ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 10, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    
    camera.setPosition(new Vector3(0, 0, -15)); 
    camera.setTarget(new Vector3(0, 0, 0));
    camera.inputs.clear(); 
    return camera;
}

