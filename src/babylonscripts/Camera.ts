
import { Scene, Vector3, UniversalCamera, ArcRotateCamera } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Rectangle, Image, Grid } from "@babylonjs/gui";

let affichePage = true;
let advancedTexture: AdvancedDynamicTexture | null = null;
let contenuePage: Image | null = null;
let index = 0;
let camera: UniversalCamera | null = null;


export function createFPSCamera(scene: Scene, canvas: HTMLCanvasElement): UniversalCamera {
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
    

    canvas.addEventListener("click", () => {
        canvas.requestPointerLock();
    });


    document.addEventListener("pointerlockchange", () => {
        if (document.pointerLockElement === canvas) {
            document.addEventListener("mousemove", mouseMove);
        } else {
            document.removeEventListener("mousemove", mouseMove);
        }
    });

    window.addEventListener("keydown", (event: KeyboardEvent) => {
        if (!contenuePage) return;
    
        if (event.key === "ArrowRight" && !affichePage) {
            if (index < 8) {
                index++;
                contenuePage.source = "images/doc" + index + ".png";
            }
        } else if (event.key === "ArrowLeft" && !affichePage) {
            if (index > 0) {
                index--;
                contenuePage.source = "images/doc" + index + ".png";
            }
        } else if (event.code === "Space" && !affichePage) {
            displayDocument(canvas, scene);
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

    displayedItem(canvas, scene);

    return camera;
}

export function displayedItem(canvas: HTMLCanvasElement, scene: Scene) {
    if (!advancedTexture || !camera) return;

    advancedTexture.clear();

    if (contenuePage && contenuePage.parent) {
        contenuePage.parent.removeControl(contenuePage);
    }

    contenuePage = null;

    if (affichePage) {
        // Rebind clavier AZERTY
        camera.keysUp = [90];    // Z
        camera.keysDown = [83];  // S
        camera.keysRight = [68]; // D
        camera.keysLeft = [81];  // Q

        const crosshair = Button.CreateImageOnlyButton("crosshair", "images/circle.svg");
        crosshair.width = "15px";
        crosshair.height = "15px";
        crosshair.color = "transparent";
        crosshair.thickness = 0;

        advancedTexture.addControl(crosshair);
        canvas.requestPointerLock();
    } else {
        camera.keysUp = [];
        camera.keysDown = [];
        camera.keysRight = [];
        camera.keysLeft = [];

        document.exitPointerLock();

        const page = new Grid();
        page.addColumnDefinition(0.3);
        page.addColumnDefinition(0.3);
        page.addColumnDefinition(0.3);

        contenuePage = new Image("pageTest", "images/doc0.png");
        contenuePage.width = "100%";
        contenuePage.height = "100%";
        contenuePage.stretch = Image.STRETCH_UNIFORM;

        page.addControl(contenuePage, 0, 1);
        advancedTexture.addControl(page);
        document.exitPointerLock();

    }
}


export function displayDocument(canvas: HTMLCanvasElement, scene: Scene) {
    affichePage = !affichePage;
    displayedItem(canvas, scene);

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

