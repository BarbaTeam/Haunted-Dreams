// Imports nécessaires
import {
    Scene,
    Vector3,
    UniversalCamera,
    ArcRotateCamera,
    Effect,
    PostProcess,
    BlackAndWhitePostProcess,
    FreeCameraKeyboardMoveInput
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
                contenuePage.source = `images/doc/doc${++docIndex}_${ship.languageValue}.jpg`;
                caption.text = `${indication} \n${docIndex+1}/${maxDocIndex+1}`
            }
            if (contenuePage.source!.includes("diaries") && diariesIndex < maxDiariesIndex) {
                contenuePage.source = `images/diaries/diaries${++diariesIndex}_${ship.languageValue}.jpg`;
                caption.text = `${indication} \n${diariesIndex+1}/${maxDiariesIndex+1}`
            }
            if (contenuePage.source!.includes("explorers") && explorersIndex < maxExplorersIndex) {
                contenuePage.source = `images/explorers/explorers${++explorersIndex}_${ship.languageValue}.jpg`;
                caption.text = `${indication} \n${explorersIndex+1}/${maxExplorersIndex+1}`
            }
        } else if (event.key.toLowerCase() === keyBindings["Left"].toLowerCase() && affichePage) {
            if (contenuePage.source!.includes("doc") && docIndex > 0) {
                contenuePage.source = `images/doc/doc${--docIndex}_${ship.languageValue}.jpg`;
                caption.text = `${indication} \n${docIndex+1}/${maxDocIndex+1}`
            }
            if (contenuePage.source!.includes("diaries") && diariesIndex > 0) {
                contenuePage.source = `images/diaries/diaries${--diariesIndex}_${ship.languageValue}.jpg`;
                caption.text = `${indication} \n${diariesIndex+1}/${maxDiariesIndex+1}`
            }
            if (contenuePage.source!.includes("explorers") && explorersIndex > 0) {
                contenuePage.source = `images/explorers/explorers${--explorersIndex}_${ship.languageValue}.jpg`;
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
        case 0: maxDocIndex = 0; maxDiariesIndex = 1; maxExplorersIndex = 4; break; //la famille
        case 1: maxDocIndex = 3; maxDiariesIndex = 7; maxExplorersIndex = 10; break; //les escaliers
        case 2: maxDocIndex = 5; maxDiariesIndex = 12; maxExplorersIndex = 18; break; //la chose rampante
        case 3: maxDocIndex = 6; maxDiariesIndex = 22; maxExplorersIndex = 24; break; //sally
        case 4: maxDocIndex = 11; maxDiariesIndex = 33; maxExplorersIndex = 30; break; //la bosse
        case 5: maxDocIndex = 13; maxDiariesIndex = 37; maxExplorersIndex = 38; break; //les scientifiques
        case 6: maxDocIndex = 14; maxDiariesIndex = 45; maxExplorersIndex = 48; break; //le couloir
        case 7: maxDocIndex = 14; maxDiariesIndex = 55; maxExplorersIndex = 60; break; //le labo
        case 8: maxDocIndex = 14; maxDiariesIndex = 57; maxExplorersIndex = 60; break; //fin
        default:
             maxDocIndex = 14; maxDiariesIndex = 57; maxExplorersIndex = 60;
    }
}

function mouseMove(event: MouseEvent): void {
    if (!camera || affichePage) return;
    const rotationSpeed = 0.002;
    camera.rotation.y += event.movementX * rotationSpeed;
    camera.rotation.x += event.movementY * rotationSpeed;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
}

let hasEnded = false;
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
        camera.inputs.addKeyboard();
        camera.inputs.addMouse();
        camera.attachControl(canvas);
        camera.inertia = 0.1;
        camera.speed = 5.5;
        camera.angularSensibility = 4000;
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
        canvas.requestPointerLock();


        if(maxDiariesIndex === 57 && !hasEnded) {
            const event = new CustomEvent('endReached');
            hasEnded = true
            window.dispatchEvent(event);
        }

    } else {
        controls.stopStepSound();
        camera.inputs.clear(); 
        camera.keysUp = [];
        camera.keysDown = [];
        camera.keysLeft = [];
        camera.keysRight = [];
        controls.disableEvents();
        document.exitPointerLock();
        
        if(objectiveSystem)
            updateIndex(objectiveSystem.getNightmareIndex());

        const page = new Grid();
        page.addRowDefinition(0.9);
        page.addRowDefinition(0.1);
        page.addColumnDefinition(0.33);
        page.addColumnDefinition(0.34);
        page.addColumnDefinition(0.33);

        contenuePage = new Image("contenueImage", "");
        contenuePage.width = "100%";
        contenuePage.height = "100%";
        contenuePage.stretch = Image.STRETCH_UNIFORM;

        caption = new TextBlock("captionText", "");
        caption.color = "white";
        caption.fontSize = "18px";
        caption.textWrapping = true;
        caption.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        caption.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        switch (type) {
            case "doc":
                contenuePage.source = `images/doc/doc${docIndex}_${language}.jpg`;
                caption.text = `${indication} \n${docIndex + 1}/${maxDocIndex + 1}`;
                break;
            case "diaries":
                if (objectiveSystem) {
                    contenuePage.source = `images/diaries/diaries${diariesIndex}_${language}.jpg`;
                    caption.text = `${indication} \n${diariesIndex + 1}/${maxDiariesIndex + 1}`;
                }
                break;
            case "explorer":
                contenuePage.source = `images/explorers/explorers${explorersIndex}_${language}.jpg`;
                caption.text = `${indication} \n${explorersIndex + 1}/${maxExplorersIndex + 1}`;
                break;
            default:
                contenuePage.source = "";
        }

        page.addControl(contenuePage, 0, 1); 
        page.addControl(caption, 1, 1);

        advancedTexture.addControl(page);
        page.alpha = 0;

        camera.getScene().onBeforeRenderObservable.add(function fadeIn() {
            page.alpha = Math.min(1, page.alpha + 0.05);
            if (page.alpha >= 1) {
                camera!.getScene().onBeforeRenderObservable.removeCallback(fadeIn);
            }
        });

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
