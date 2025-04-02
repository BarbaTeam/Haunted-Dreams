import { Color3, Scene, SpotLight, Vector3 } from "@babylonjs/core";

export class ShipLight {
    private scene: Scene;
    private lightList!: SpotLight[];
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.createLights();
    }
    
    createLights(): void {
        const entrance_light = new SpotLight("spotLight", new Vector3(0, 16, -6), new Vector3(0, -1, 0), Math.PI / 2, 10, this.scene);
        const entrance_light2 = new SpotLight("spotLight", new Vector3(0, 16, -6), new Vector3(0.5, -1, 0.5), Math.PI / 2, 10, this.scene);
        const entrance_light3 = new SpotLight("spotLight", new Vector3(0, 16, -6), new Vector3(-0.5, -1, 0.5), Math.PI / 2, 10, this.scene);
        const entrance_light4 = new SpotLight("spotLight", new Vector3(1, 20, 2), new Vector3(0.6, -1, 0), Math.PI / 2, 10, this.scene);

        
        const table_light = new SpotLight("spotLight", new Vector3(0, 16, 34), new Vector3(0, -1, 0), Math.PI / 2, 5, this.scene);
        const table_light2 = new SpotLight("spotLight", new Vector3(0, 16, 34), new Vector3(0.5, -1, -0.5), Math.PI / 2, 10, this.scene);
        const table_light3 = new SpotLight("spotLight", new Vector3(0, 16, 34), new Vector3(-0.5, -1, -0.5), Math.PI / 2, 10, this.scene);

        const nav_light = new SpotLight("spotLight", new Vector3(13, 16, 13.5), new Vector3(0.2, -1, 0), Math.PI * (2/3), 10, this.scene);
        const nav_light2 = new SpotLight("spotLight", new Vector3(41, 16, 13.5), new Vector3(-1, -1, 0), Math.PI * (2/3), 10, this.scene);

        const motor_light = new SpotLight("spotLight", new Vector3(-14, 16, 13.5), new Vector3(-1, -1, 0), Math.PI * (2/3), 10, this.scene);
        
        
        this.lightList = [
            entrance_light,
            entrance_light2,
            entrance_light3,
            entrance_light4,
            table_light,
            table_light2,
            table_light3,
            nav_light,
            nav_light2,
            motor_light
        ];

        this.lightList.forEach((light) => {
            light.intensity = 3;
            light.diffuse = new Color3(106, 143, 63);
            light.range = 2;
        });
    }

    public getLights(): SpotLight[] {
        return this.lightList;
    }
}