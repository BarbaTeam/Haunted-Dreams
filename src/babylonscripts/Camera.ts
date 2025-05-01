import {
    Scene,
    Vector3,
    UniversalCamera,
    ArcRotateCamera,
    Effect,
    PostProcess,
    BlackAndWhitePostProcess
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Button,
    Image,
    Grid
} from "@babylonjs/gui";

import { ShipControls } from "./ShipControls";
import { ShipSounds } from "./ShipSounds";
import { HostilitySystem } from "./HostilitySystem";
import { Ship } from "./Ship";
import { ObjectiveSystem } from "./ObjectiveSystem";

let affichePage = true;
let advancedTexture: AdvancedDynamicTexture | null = null;
let contenuePage: Image | null = null;
let index = 0;
let diariesIndex = 0;
let camera: UniversalCamera | null = null;
let pageZoom = false;

export function createFPSCamera(
    scene: Scene,
    canvas: HTMLCanvasElement,
    controls: ShipControls,
    shipControls: ShipControls,
    shipSounds: ShipSounds,
    ship: Ship,
    hostilitySystem: HostilitySystem,
    objectiveSystem: ObjectiveSystem
): UniversalCamera {
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

    // Post-processing
    const bw = new BlackAndWhitePostProcess("bw", 1.0, camera);
    bw.degree = 0.3;

    const grain = new PostProcess("grain", "grain", ["intensity", "grainy"], null, 1.0, camera);
    grain.onApply = (effect: Effect) => {
        effect.setFloat("intensity", 30);
        effect.setFloat("grainy", 1.0);
    };

    // Pointer lock control
    canvas.addEventListener("click", () => {
        affichePage ? canvas.requestPointerLock() : document.exitPointerLock();
    });

    document.addEventListener("pointerlockchange", () => {
        if (affichePage) {
            document.addEventListener("mousemove", mouseMove);
        } else {
            document.removeEventListener("mousemove", mouseMove);
        }
    });

    // Zoom with right click
    const defaultFov = camera.fov;
    const zoomedFov = 0.8;

    canvas.addEventListener("mousedown", (event) => {
        if (event.button === 2) {
            camera!.fov = zoomedFov;
            event.preventDefault();
        }
    });

    canvas.addEventListener("mouseup", (event) => {
        if (event.button === 2) {
            camera!.fov = defaultFov;
            event.preventDefault();
        }
    });

    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    // Handle document navigation
    window.addEventListener("keydown", (event: KeyboardEvent) => {
        if (!contenuePage) return;

        if (event.key === "ArrowRight" && !affichePage) {
            if (index < 8 && contenuePage.source!.includes("doc")) {
                contenuePage.source = `images/doc${++index}.jpg`;
            }
            if (diariesIndex < objectiveSystem.getNightmareIndex() && contenuePage.source!.includes("diaries")) {
                contenuePage.source = `images/diaries${++diariesIndex}.png`;
            }
        } else if (event.key === "ArrowLeft" && !affichePage) {
            if (index > 0 && contenuePage.source!.includes("doc")) {
                contenuePage.source = `images/doc${--index}.jpg`;
            }
            if (diariesIndex > 0 && contenuePage.source!.includes("diaries")) {
                contenuePage.source = `images/diaries${--diariesIndex}.png`;
            }
        } else if (event.code === "Space" && !affichePage) {
            displayDocument(canvas, controls);
        }
    });

    // Ship exit trigger
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

    displayedItem(canvas, controls);
    return camera;
}

function mouseMove(event: MouseEvent) {
    if (!camera || !affichePage) return;

    const rotationSpeed = 0.002;
    camera.rotation.y += event.movementX * rotationSpeed;
    camera.rotation.x += event.movementY * rotationSpeed;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
}

export function displayedItem(
    canvas: HTMLCanvasElement,
    controls: ShipControls,
    objectiveSystem?: ObjectiveSystem,
    type?: string
): void {
    if (!advancedTexture || !camera) return;

    advancedTexture.clear();

    if (contenuePage?.parent) {
        contenuePage.parent.removeControl(contenuePage);
    }

    contenuePage = null;

    if (affichePage) {
        // Gameplay mode
        controls.enableEvents();
        camera.keysUp = [90, 87]; // Z, W
        camera.keysDown = [83];   // S
        camera.keysRight = [68];  // D
        camera.keysLeft = [81, 65]; // Q, A

        const crosshair = Button.CreateImageOnlyButton("crosshair", "images/circle.svg");
        crosshair.width = "15px";
        crosshair.height = "15px";
        crosshair.thickness = 0;
        advancedTexture.addControl(crosshair);

        camera.attachControl(canvas, true);
        canvas.requestPointerLock();
    } else {
        // Document display mode
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
                if (objectiveSystem) {
                    diariesIndex = objectiveSystem.getNightmareIndex();
                    contenuePage.source = `images/diaries${diariesIndex}.png`;
                }
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

        contenuePage.onPointerClickObservable.add((event) => {
            pageZoom = !pageZoom;
            const zoomFactor = 2;

            if (pageZoom) {
                const offsetX = event.x - canvas.clientWidth / 2;
                const offsetY = event.y - canvas.clientHeight / 2;

                page.left = `${-offsetX}px`;
                page.top = `${-offsetY}px`;
                page.width = `${zoomFactor * 100}%`;
                page.height = `${zoomFactor * 100}%`;
            } else {
                page.top = "0";
                page.left = "0";
                page.width = "100%";
                page.height = "100%";
            }
        });
    }
}

export function displayDocument(
    canvas: HTMLCanvasElement,
    controls: ShipControls,
    objectiveSystem?: ObjectiveSystem,
    type?: string
): void {
    affichePage = !affichePage;
    displayedItem(canvas, controls, objectiveSystem, type);
}

export function getAffichePage(): boolean {
    return affichePage;
}

export function createMenuCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera {
    const camera = new ArcRotateCamera("menuCamera", Math.PI / 2, Math.PI / 4, 10, Vector3.Zero(), scene);
    camera.setPosition(new Vector3(0, 0, -15));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // Disable user control for menu
    return camera;
}
