// Imports nécessaires
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
    Grid,
    StackPanel,
    TextBlock,
    Control
} from "@babylonjs/gui";

import { ShipControls } from "./ShipControls";
import { ShipSounds } from "./ShipSounds";
import { HostilitySystem } from "./HostilitySystem";
import { Ship } from "./Ship";
import { ObjectiveSystem } from "./ObjectiveSystem";

let affichePage = false;
let advancedTexture: AdvancedDynamicTexture | null = null;
let contenuePage: Image | null = null;
let caption : TextBlock;
let indication : string;
let docIndex = 0;
let maxDocIndex = 0;
let maxDiariesIndex = 0;
let maxExplorersIndex = 0;
let diariesIndex = 0;
let explorersIndex = 0;
let camera: UniversalCamera | null = null;
let pageZoom = false;
let isZooming = false;

export function createFPSCamera(
    scene: Scene,
    canvas: HTMLCanvasElement,
    controls: ShipControls,
    shipControls: ShipControls,
    shipSounds: ShipSounds,
    ship: Ship,
    hostilitySystem: HostilitySystem,
    objectiveSystem: ObjectiveSystem,
    keyBindings: { [action: string]: string }
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

    indication = `${ship.languageValue === "fr" ? "Appuyez <Espace> pour quitter" : "Press <Space> to quit"}`

    advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    // Post-processing
    const bw = new BlackAndWhitePostProcess("bw", 1.0, camera);
    bw.degree = 0.3;

    const grain = new PostProcess("grain", "grain", ["intensity", "grainy"], null, 1.0, camera);
    grain.onApply = (effect: Effect) => {
        effect.setFloat("intensity", 30);
        effect.setFloat("grainy", 1.0);
    };

    // Zoom animation
    const defaultFov = camera.fov;
    const zoomedFov = 0.8;

    function animateFov(from: number, to: number, duration: number): void {
        if (!camera) return;
        const start = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            camera!.fov = from + (to - from) * progress;
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    canvas.addEventListener("mousedown", (event) => {
        if (event.button === 2 && !isZooming) {
            isZooming = true;
            animateFov(camera!.fov, zoomedFov, 150);
            event.preventDefault();
        }
    });

    canvas.addEventListener("mouseup", (event) => {
        if (event.button === 2) {
            animateFov(camera!.fov, defaultFov, 150);
            setTimeout(() => { isZooming = false; }, 150);
            event.preventDefault();
        }
    });

    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    // Pointer lock
    canvas.addEventListener("click", () => {
        !affichePage ? canvas.requestPointerLock() : document.exitPointerLock();
    });

    document.addEventListener("pointerlockchange", () => {
        if (!affichePage) {
            document.addEventListener("mousemove", mouseMove);
        } else {
            document.removeEventListener("mousemove", mouseMove);
        }
    });

    // Clavier
    window.addEventListener("keydown", (event: KeyboardEvent) => {
        if (!contenuePage || !contenuePage.isLoaded) return;
        updateIndex(objectiveSystem.getNightmareIndex());

        if (event.key.toLowerCase() === keyBindings["Right"].toLowerCase() && affichePage) {
            if (contenuePage.source!.includes("doc") && docIndex < maxDocIndex) {
                contenuePage.source = `images/doc${++docIndex}_${ship.languageValue}.jpg`;
                caption.text = `${indication} \n${docIndex+1}/${maxDocIndex+1}`
            }
            if (contenuePage.source!.includes("diaries") && diariesIndex < maxDiariesIndex) {
                contenuePage.source = `images/diaries${++diariesIndex}_${ship.languageValue}.png`;
                caption.text = `${indication} \n${diariesIndex+1}/${maxDiariesIndex+1}`
            }
            if (contenuePage.source!.includes("explorers") && explorersIndex < maxExplorersIndex) {
                contenuePage.source = `images/explorers${++explorersIndex}_${ship.languageValue}.png`;
                caption.text = `${indication} \n${explorersIndex+1}/${maxExplorersIndex+1}`
            }
        } else if (event.key.toLowerCase() === keyBindings["Left"].toLowerCase() && affichePage) {
            if (contenuePage.source!.includes("doc") && docIndex > 0) {
                contenuePage.source = `images/doc${--docIndex}_${ship.languageValue}.jpg`;
                caption.text = `${indication} \n${docIndex+1}/${maxDocIndex+1}`
            }
            if (contenuePage.source!.includes("diaries") && diariesIndex > 0) {
                contenuePage.source = `images/diaries${--diariesIndex}_${ship.languageValue}.png`;
                caption.text = `${indication} \n${diariesIndex+1}/${maxDiariesIndex+1}`
            }
            if (contenuePage.source!.includes("explorers") && explorersIndex > 0) {
                contenuePage.source = `images/explorers${--explorersIndex}_${ship.languageValue}.png`;
                caption.text = `${indication} \n${explorersIndex+1}/${maxExplorersIndex+1}`
            }
        } else if (event.code === "Space" && affichePage) {
            displayDocument(canvas, controls, ship.languageValue, keyBindings, objectiveSystem);
        }
    });

    // Sortie du vaisseau
    let hasLeftSpaceShip = false;
    scene.onBeforeRenderObservable.add(() => {
        if (!camera) return;
        const camPos = camera.position;

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

    displayedItem(canvas, controls, ship.languageValue, keyBindings);
    return camera;
}

function updateIndex(nightmareIndex: number): void {
    switch (nightmareIndex) {
        case 0: maxDocIndex = 0; maxDiariesIndex = 0; maxExplorersIndex = 1; break; //la famille
        case 1: maxDocIndex = 1; maxDiariesIndex = 6; maxExplorersIndex = 4; break; //les escaliers
        case 2: maxDocIndex = 2; maxDiariesIndex = 11; maxExplorersIndex = 7; break; //la chose rampante
        case 3: maxDocIndex = 3; maxDiariesIndex = 21; maxExplorersIndex = 7; break; //sally
        case 4: maxDocIndex = 3; maxDiariesIndex = 27; maxExplorersIndex = 10; break; 
        case 5: case 6: case 7:
            maxDocIndex = 3; maxDiariesIndex = 27; maxExplorersIndex = 13; break; 
        default:
            maxDocIndex = 3; maxDiariesIndex = 27; maxExplorersIndex = 13;
    }
}

function mouseMove(event: MouseEvent): void {
    if (!camera || affichePage) return;
    const rotationSpeed = 0.002;
    camera.rotation.y += event.movementX * rotationSpeed;
    camera.rotation.x += event.movementY * rotationSpeed;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
}

export function displayedItem(
    canvas: HTMLCanvasElement,
    controls: ShipControls,
    language: string,
    keyBindings: { [action: string]: string },
    objectiveSystem?: ObjectiveSystem,
    type?: string
): void {
    if (!advancedTexture || !camera) return;

    advancedTexture.clear();
    contenuePage?.parent?.removeControl(contenuePage);
    caption?.parent?.removeControl(caption);

    contenuePage = null;

    if (!affichePage) {
        controls.enableEvents();
        camera.keysUp = [keyBindings["Forward"].toUpperCase().charCodeAt(0)];
        camera.keysDown = [keyBindings["Backward"].toUpperCase().charCodeAt(0)];
        camera.keysLeft = [keyBindings["Left"].toUpperCase().charCodeAt(0)];
        camera.keysRight = [keyBindings["Right"].toUpperCase().charCodeAt(0)];

        const crosshair = Button.CreateImageOnlyButton("crosshair", "images/circle.svg");
        crosshair.isHitTestVisible = false;
        crosshair.isPointerBlocker = false;
        crosshair.width = "15px";
        crosshair.height = "15px";
        crosshair.thickness = 0;
        advancedTexture.addControl(crosshair);
        camera.attachControl(canvas, true);
        canvas.requestPointerLock();
    } else {
        controls.disableEvents();
        camera.keysUp = [];
        camera.keysDown = [];
        camera.keysLeft = [];
        camera.keysRight = [];

        document.exitPointerLock();

        const page = new Grid();
        page.addColumnDefinition(0.3);
        page.addColumnDefinition(0.3);
        page.addColumnDefinition(0.3);
        
        caption = new TextBlock();
        caption.text = ``;
        caption.color = "white";
        caption.fontSize = "18px";
        caption.height = "90%";
        caption.textWrapping = true;
        caption.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        caption.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        if(objectiveSystem)
            updateIndex(objectiveSystem.getNightmareIndex());

        // Crée l'image selon le type
        switch (type) {
            case "doc":
                contenuePage = new Image("", `images/doc${docIndex}_${language}.jpg`);
                caption.text = `${indication} \n${docIndex+1}/${maxDocIndex+1}`
                break;
            case "diaries":
                contenuePage = new Image("", "");
                if (objectiveSystem) {
                    contenuePage.source = `images/diaries${diariesIndex}_${language}.png`;
                    caption.text = `${indication} \n${diariesIndex+1}/${maxDiariesIndex+1}`
                }
                break;
            case "explorer":
                contenuePage = new Image("", `images/explorers${explorersIndex}_${language}.png`);
                console.log(explorersIndex);
                console.log(maxExplorersIndex);
                caption.text = `${indication} \n${explorersIndex+1}/${maxExplorersIndex+1}`
                break;
            default:
                contenuePage = new Image("", "");
        }

        contenuePage.width = "100%";
        contenuePage.height = "100%";
        contenuePage.stretch = Image.STRETCH_UNIFORM;

        const container = new StackPanel();
        container.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        container.width = "100%";
        container.height = "100%";

        contenuePage.stretch = Image.STRETCH_UNIFORM;
        contenuePage.height = "90%";
        contenuePage.width = "100%";
        container.addControl(contenuePage);
        container.addControl(caption);

        page.addControl(container, 0, 1);
        advancedTexture.addControl(page);

        page.alpha = 0;
        camera.getScene().onBeforeRenderObservable.add(function fadeIn() {
            page.alpha = Math.min(1, page.alpha + 0.05);
            if (page.alpha >= 1) {
                camera!.getScene().onBeforeRenderObservable.removeCallback(fadeIn);
            }
        });

        camera.detachControl();

        contenuePage.onPointerClickObservable.add((event) => {
            pageZoom = !pageZoom;
            const zoomFactor = 2.25;
            if (pageZoom) {
                const offsetX = event.x - canvas.clientWidth / 2;
                const offsetY = event.y - canvas.clientHeight / 2;
                page.left = `${-offsetX}px`;
                page.top = `${-offsetY}px`;
                page.width = `${zoomFactor * 100}%`;
                page.height = `${zoomFactor * 100}%`;
            } else {
                page.top = "0"; page.left = "0";
                page.width = "100%"; page.height = "100%";
            }
        });
    }
}

export function displayDocument(
    canvas: HTMLCanvasElement,
    controls: ShipControls,
    language: string,
    keyBindings: { [action: string]: string },
    objectiveSystem?: ObjectiveSystem,
    type?: string,
    shipSounds?: ShipSounds
): void {
    affichePage = !affichePage;
    if (shipSounds) {
        affichePage ? shipSounds.playOpenDocument() : shipSounds.playCloseDocument();
    }
    displayedItem(canvas, controls, language, keyBindings, objectiveSystem, type);
}

export function getAffichePage(): boolean {
    return affichePage;
}

export function createMenuCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera {
    const camera = new ArcRotateCamera("menuCamera", Math.PI / 2, Math.PI / 4, 10, Vector3.Zero(), scene);
    camera.setPosition(new Vector3(0, 0, -15));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.inputs.clear();
    return camera;
}
