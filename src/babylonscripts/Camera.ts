
import { Scene, Vector3, UniversalCamera, ArcRotateCamera } from "@babylonjs/core";


export function createFPSCamera(scene:Scene, canvas:HTMLCanvasElement): UniversalCamera {
    const camera = new UniversalCamera("UniversalCamera", new Vector3(0, 11, 0), scene);
        camera.setTarget(new Vector3(0, 11, 10));
        camera.applyGravity = true;
        camera.checkCollisions = true;
        camera.attachControl(canvas, true);
        camera.ellipsoid = new Vector3(3, 5, 3);
        camera.inertia = 0.8;
        camera.speed = 1.5;
        camera.fov = 1.2;
        //AZERTY (hexa)
        camera.keysUp.push(90);
        camera.keysDown.push(83);
        camera.keysRight.push(68);
        camera.keysLeft.push(81);

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

