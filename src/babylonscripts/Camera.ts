
import { Scene, Vector3, UniversalCamera, ArcRotateCamera, BlurPostProcess } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Rectangle, Image } from "@babylonjs/gui";


export function createFPSCamera(scene: Scene, canvas: HTMLCanvasElement): UniversalCamera {
    const camera = new UniversalCamera("UniversalCamera", new Vector3(0, 11, 0), scene);
    camera.setTarget(new Vector3(0, 10, 10));
    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.attachControl(canvas, true);
    camera.ellipsoid = new Vector3(3, 5, 3);
    camera.inertia = 0.1;
    camera.speed = 5.5;
    camera.angularSensibility = 2000;
    camera.fov = 1.2;

    // **Clavier AZERTY**
    camera.keysUp.push(90); // Z
    camera.keysDown.push(83); // S
    camera.keysRight.push(68); // D
    camera.keysLeft.push(81); // Q

    // **Gestion de la souris**
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

    function mouseMove(event: MouseEvent) {
        const rotationSpeed = 0.002;
        camera.rotation.y += event.movementX * rotationSpeed;
        camera.rotation.x += event.movementY * rotationSpeed;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    }

    // **Zoom au clic droit**
    const defaultFov = camera.fov;
    const zoomedFov = 0.8; // Ajustable pour un zoom plus ou moins fort

    canvas.addEventListener("mousedown", (event) => {
        if (event.button === 2) { // Clic droit
            camera.fov = zoomedFov;
            event.preventDefault();
        }
    });

    canvas.addEventListener("mouseup", (event) => {
        if (event.button === 2) { // Relâchement clic droit
            camera.fov = defaultFov;
            event.preventDefault();
        }
    });

    // Désactiver le menu contextuel du clic droit
    canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });

    // **Création de l'interface UI**
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // **Ajout du curseur (réticule)**
    const crosshair = Button.CreateImageOnlyButton("crosshair", "/images/circle.svg");
    crosshair.width = "15px";
    crosshair.height = "15px";
    crosshair.color = "transparent";
    advancedTexture.addControl(crosshair);

    // **Ajout de l'image du casque**
    //const helmetOverlay = new Rectangle("helmetOverlay");
    //helmetOverlay.width = "100%";
    //helmetOverlay.height = "100%";
    //helmetOverlay.thickness = 0;
    //advancedTexture.addControl(helmetOverlay);

    //const helmetImage = new Image("helmetImage", "/images/casque.png");
    //helmetImage.stretch = Image.STRETCH_FILL;
    //helmetOverlay.addControl(helmetImage);


    return camera;
}




export function createMenuCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera {
    const camera = new ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 10, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    
    camera.setPosition(new Vector3(0, 0, -15)); 
    camera.setTarget(new Vector3(0, 0, 0));
    camera.inputs.clear(); 
    return camera;
}

