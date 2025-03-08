
import { Scene, Vector3, UniversalCamera, ArcRotateCamera } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";


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
        const rotationSpeed = 0.002; // Ajustable pour la sensibilité
        camera.rotation.y += event.movementX * rotationSpeed; // Axe X (horizontal) reste normal
        camera.rotation.x += event.movementY * rotationSpeed; // Axe Y (vertical) inversé
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x)); // Limite pour éviter un retournement total
    }
    
    // **Ajout d'un curseur (réticule)**
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const crosshair = Button.CreateImageOnlyButton("crosshair", "/images/circle.svg");
    crosshair.width = "15px";
    crosshair.height = "15px";
    crosshair.color = "transparent";
    advancedTexture.addControl(crosshair);

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

