import { Color3, DynamicTexture, HighlightLayer, Mesh, MeshBuilder, Scene, Sound, StandardMaterial, Vector3 } from '@babylonjs/core';
import { SubtitleSystem } from './SubtitleSystem'
import { Ship } from './Ship';
import { ObjectiveSystem } from './ObjectiveSystem';
import { NavigationSystem } from './NavigationSystem';
import { ShipControls } from './ShipControls';

export class NarrationSystem {
    private scene: Scene
    private ringTone: Sound;
    private answered = false;
    private isCalling = false;
    private narratorVoices: Sound[];
    private ship: Ship;
    private objectiveSystem!: ObjectiveSystem;
    private navigationSystem!:NavigationSystem;
    private shipControls!: ShipControls;
    private subtitles = new SubtitleSystem();

    constructor(scene : Scene, ship: Ship) {
        this.scene = scene;
        this.ship = ship;
        this.ringTone = new Sound("", "sons/ringtone.mp3", this.scene, null, { volume: 0.5, autoplay: false, loop: true, spatialSound: true, maxDistance: 40});
        this.ringTone.setPosition(new Vector3(10, 12, 22));


        this.narratorVoices = [
                    new Sound("", "sons/intro.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                    new Sound("", "sons/tuto1.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                    new Sound("", "sons/tuto2.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                    new Sound("", "sons/tuto3.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                    new Sound("", "sons/tuto4.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                    new Sound("", "sons/tuto5.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                    new Sound("", "sons/tuto6.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                    new Sound("", "sons/tuto7.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                    new Sound("", "sons/tuto8.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                    new Sound("", "sons/outro.mp3", this.scene, null, { volume: 2, autoplay: false, loop: false }),
                ]
    } 

    public setNavigationSystem(navigationSystem: NavigationSystem): void {
        this.navigationSystem = navigationSystem;
    }

    public setObjectiveSystem(objectiveSystem: ObjectiveSystem): void {
        this.objectiveSystem = objectiveSystem;
    }
    public setShipControls(shipControls: ShipControls): void {
        this.shipControls = shipControls;
    }

    setupNarrator(){

        if(!this.answered){
            setTimeout(()=>{
                this.isCalling = true;
                this.ringTone.play() 
            },5000);
            
        }
        else {
            setTimeout(()=>{
                this.narratorVoices[0].play();
                this.subtitles.showSubtitles([
                    { text: "Bonjour !", duration: 1000 },
                    { text: "Bienvenue à bord...", duration: 2000 },
                    { text: "Comment vous sentez vous ?", duration: 2000 },
                    { text: "Il fait assez sombre par ici...", duration: 2000 },
                    { text: "C'est normal ! Vous êtes désormais dans l'esprit de mon patient... ", duration: 3000 },
                    { text: "La lumière est un luxe rare.", duration: 2000 },
                    { text: "Mais ne vous inquiétez pas. Enfin... pas trop", duration: 3000 },
                    { text: "Ce n'est sûrement pas la première fois que vous frôlez la mort, n'est ce pas ?", duration: 4000 },
                    { text: "Désormais, vous avez une mission", duration: 2000},
                    { text: "Je veux que vous traquiez les cauchemars", duration: 2500},
                    { text: "Que vous les capturiez en image", duration: 1500},
                    { text: "Que vous les consigniez dans le dossier du patient", duration: 2500},
                    { text: "Et que vous m’aidiez à en comprendre l’origine. ", duration: 4500},
                    { text: "Compris ?", duration: 1000},
                    { text: "Le premier cauchemar ? Je vous guiderai.", duration: 5000},
                    { text: "Mais après… vous serez seul.", duration: 3500},
                    { text: "Oh, bien sûr, je vous observerai, d’une certaine manière…", duration: 5500},
                    { text: "Mais si quelque chose se produit", duration: 2500},
                    { text: "(Cela n’arrivera pas bien sûr)", duration: 2500},
                    { text: "Je ne serai pas là. D'accord ?", duration: 2500},
                    { text: "Commençons", duration: 1500}, 
                ]);           
                this.narratorVoices[0].onEndedObservable.add(() => {
                    this.narratorVoices[1].play();

                    this.subtitles.showSubtitles([
                        { text: "Tout d’abord...", duration: 1000},
                        { text: "Le poste de commande.", duration: 2000},
                        { text: "Il se situe à l'avant du vaisseau.", duration: 3000},
                        { text: "Et sera vos yeux dans cet environnement sombre, inhospitalier à l’esprit humain.", duration: 6000},
                        { text: "À gauche de la pièce, vous trouverez le sélecteur d’ondes.", duration: 5000},
                        { text: "Un appareil qui vous permettra d’entrer la fréquence et l'amplitude du cauchemar que vous souhaitez traquer.", duration: 8000},
                        { text: "Une fois détecté", duration: 2000},
                        { text: "La boussole émettra un son pour signaler sa présence.", duration: 4500}
                    ]);
                });
                
            },1000); 
            this.narratorVoices[1].onEndedObservable.add(() => {
                this.narratorVoices[2].play();

                this.subtitles.showSubtitles([
                    { text: "Dans la même pièce, face à la porte", duration: 3000}, 
                    { text: "Le poste de navigation. ", duration: 3000}, 
                    { text: "L’onde que vous aurez saisie y apparaîtra ", duration: 3000}, 
                    { text: "Ainsi que celle correspondant à la position du vaisseau.", duration: 4000}, 
                    { text: "Elle est brouillée, c'est normal.", duration: 3000}, //16
                    { text: "Vous devrez orienter le vaisseau correctement lorsque la boussole signalera la présence d’un cauchemar.", duration: 8000}
                ]);
            });
            this.narratorVoices[2].onEndedObservable.add(() => {
                this.narratorVoices[3].play();

                this.subtitles.showSubtitles([
                    { text: "À présent, consultez le dossier posé sur le bureau.", duration: 3000},
                    { text: "Il contient toutes les informations dont nous disposons…", duration: 4500},
                    { text: "Pour l’instant.", duration: 1500},
                    { text: "Ce sera à vous de le compléter au fil de votre voyage.", duration: 6000},
                    { text: "Nous savons peu de choses", duration: 1500},
                    { text: "Mais suffisamment pour trouver notre première cible.", duration: 3000},
                    { text: "Regardez bien, mémorisez les informations", duration: 4500}
                ]);
            });
            this.narratorVoices[3].onEndedObservable.add(() => {
                this.paperTutorial();
            });
            this.narratorVoices[4].onEndedObservable.add(() => {
                this.waveSelectorTutorial();
            });
            this.narratorVoices[5].onEndedObservable.add(() => {
                this.boussoleTutorial();
            });
            this.narratorVoices[6].onEndedObservable.add(() => {
                this.photoTutorial();
            });
            this.narratorVoices[7].onEndedObservable.add(() => {
                this.narratorVoices[8].play();
                this.subtitles.showSubtitles([
                    { text: "Les cauchemars contiennent bien plus d'informations sur nous que nous ne le pensons. ", duration: 5000},
                    { text: "Traquez-les et, en retour, ils vous révéleront vos véritables objectifs.", duration: 5000},
                    { text: "Oh, une dernière chose… ", duration: 3000},
                    { text: "Si le moteur s’éteint, rallumez-le immédiatement. ", duration: 4500},
                    { text: "À moins que vous ne vouliez rester coincé ici…", duration: 3500},
                    { text: "pour toujours.", duration: 1500}
                ])
            });
        }
    }

    answerPhone(): void {
        console.log("décroché");
        if(!this.answered && this.isCalling){
            this.ringTone.stop();
            this.answered = true;
            this.setupNarrator();
        }

    }

    paperTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Left click on the paper";
        const text2 = "to see patient's info";
    
        const textPlane = this.createFloatingText(this.ship.getPaperSheet() as Mesh, { x: 11, y: 3, z: 0 }, text1, text2);
    
        highlightLayer.addMesh(this.ship.getPaperSheet() as Mesh, Color3.Green());
        const handleClick = ()=>{
            if(this.shipControls.isHoveringPaperSheet()){
                highlightLayer.removeMesh(this.ship.getPaperSheet() as Mesh);
                textPlane.dispose();
                this.narratorVoices[4].play();
                this.subtitles.showSubtitles([
                    { text: "Retournez au poste de commande.", duration: 2000},
                    { text: "Et saisissez les coordonnées dans le sélecteur", duration: 4000}
                ]);
                removeEventListener("pointerdown", handleClick);
            }
        }
        addEventListener("pointerdown", handleClick);
    }

    waveSelectorTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Scroll on the buttons";
        const text2 = "to update wave's coord";
    
        const textPlane = this.createFloatingText(this.ship.getButtonAmplitude() as Mesh, { x: 18, y: 11, z: 6 }, text1, text2);
    
        highlightLayer.addMesh(this.ship.getButtonAmplitude() as Mesh, Color3.Green());
        highlightLayer.addMesh(this.ship.getButtonFrequency() as Mesh, Color3.Green());


        const checkValue = () => {
            if (this.objectiveSystem.getCurrentNightmare().nmAmplitude.toFixed(2)===this.navigationSystem.getAmplitude().toFixed(2) && this.objectiveSystem.getCurrentNightmare().nmFrequency.toFixed(2) === this.navigationSystem.getFrequency().toFixed(2)) {
                highlightLayer.removeMesh(this.ship.getButtonAmplitude() as Mesh);
                highlightLayer.removeMesh(this.ship.getButtonFrequency() as Mesh);
                textPlane.dispose();
                this.narratorVoices[5].play();
                this.subtitles.showSubtitles([
                    { text: "Et utilisez le panneau de contrôle pour nous diriger.", duration: 5000}
                ]);
                clearInterval(valueWatcher);
                removeEventListener("wheel", checkValue);
            }
        };

        addEventListener("wheel", checkValue);

        const valueWatcher = setInterval(checkValue, 100);
    }

    boussoleTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Use the left/right arrows";
        const text2 = "to turn the ship towards";
        const text3 = "the dot"
    
        const textPlane = this.createFloatingText(this.ship.getButtonAmplitude() as Mesh, { x: 23, y: 11, z: 0 }, text1, text2, text3);
    
        highlightLayer.addMesh(this.ship.getButtonLeft() as Mesh, Color3.Green());
        highlightLayer.addMesh(this.ship.getButtonRight() as Mesh, Color3.Green());


        const checkValue = () => {
            if (this.navigationSystem.getAngle().toFixed(1) === this.objectiveSystem.getAngleToAim()!.toFixed(1)) {
                highlightLayer.removeMesh(this.ship.getButtonLeft() as Mesh);
                highlightLayer.removeMesh(this.ship.getButtonRight() as Mesh);
                textPlane.dispose();
                this.navigationTutorial();
                clearInterval(valueWatcher);
                removeEventListener("pointerdown", checkValue);
            }
        };
        addEventListener("pointerdown", checkValue);

        const valueWatcher = setInterval(checkValue, 100);
    }

    navigationTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Use the up/down ";
        const text2 = "arrows to update";
        const text3 = "your position's wave";
    
        const textPlane = this.createFloatingText(this.ship.getButtonAmplitude() as Mesh, { x: 23, y: 11, z: 0 }, text1, text2, text3);
    
        highlightLayer.addMesh(this.ship.getButtonUp() as Mesh, Color3.Green());
        highlightLayer.addMesh(this.ship.getButtonDown() as Mesh, Color3.Green());


        const checkValue = () => {
            if (this.navigationSystem.isOverlap()) {
                highlightLayer.removeMesh(this.ship.getButtonUp() as Mesh);
                highlightLayer.removeMesh(this.ship.getButtonDown() as Mesh);
                textPlane.dispose();
                this.narratorVoices[6].play();
                this.subtitles.showSubtitles([
                    { text: "Bien, nous y sommes. Allez dans la deuxième salle et prenez une photo...", duration: 5000},
                    { text: "Mais faites bien attentions que les deux ondes soient parfaitement superposées.", duration: 5000}
                ])
                clearInterval(valueWatcher);
                removeEventListener("pointerdown", checkValue);
            }
        };

        addEventListener("pointerdown", checkValue);

        const valueWatcher = setInterval(checkValue, 100);
    }
    
    photoTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = "Left click on button";
        const text2 = "to take a photo";
    
        const textPlane = this.createFloatingText(this.ship.getButtonPhoto() as Mesh, { x: 14, y: 3, z: -1 }, text1, text2 );
    
        highlightLayer.addMesh(this.ship.getButtonPhoto() as Mesh, Color3.Green());

        const checkValue = () => {
            if (this.objectiveSystem.getNightmareIndex() != 0) {
                highlightLayer.removeMesh(this.ship.getButtonPhoto() as Mesh);
                textPlane.dispose();
                this.narratorVoices[7].play();
                this.subtitles.showSubtitles([
                    { text: "Ceci est votre première réussite", duration: 2500},
                    { text: "C'est incroyable comment vous apprenez vite !", duration: 3000},
                    { text: "Vous aurez bien mérité votre liberté après ce travail.", duration: 3500},
                    { text: "Vous êtes maintenant prêt à continuer seul.", duration: 2500},
                    { text: "Souvenez-vous bien des étapes :", duration: 3000},
                    { text: "Consulter le dossier du patient.", duration: 3000},
                    { text: "Voyager jusqu’au cauchemar.", duration: 3000},
                    { text: "Photographier.", duration: 2000},
                ])
                clearInterval(valueWatcher);
                removeEventListener("pointerdown", checkValue);
            }
        };

        addEventListener("pointerdown", checkValue);

        const valueWatcher = setInterval(checkValue, 100);
    }
    
    createFloatingText(targetMesh: Mesh, offset = { x: 0, y: 0, z: 0 }, text1: string, text2: string, text3?: string,) {
        const plane = MeshBuilder.CreatePlane("TexturePlane", { width: 15, height: 4 }, this.scene);
        const planeMaterial = new StandardMaterial("AvatarPlaneMat", this.scene);
        
        const planeTexture = new DynamicTexture("planeTexture", { width: 512, height: 256 }, this.scene);
        planeTexture.hasAlpha = true;
    
        planeTexture.drawText(text1, 0, 40, "bold 40px Arial", "green", null, true, true);
        planeTexture.drawText(text2, 0, 75, "bold 40px Arial", "green", null, true, true);
        if(text3) planeTexture.drawText(text3, 0, 110, "bold 40px Arial", "green", null, true, true);

        planeMaterial.backFaceCulling = true;
        planeMaterial.diffuseTexture = planeTexture;
        planeMaterial.emissiveColor = new Color3(1, 1, 1);  
        planeMaterial.specularColor = new Color3(0, 0, 0);
        plane.material = planeMaterial;
    
        plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    
        plane.position.x = targetMesh.position.x + offset.x;
        plane.position.y = targetMesh.position.y + offset.y;
        plane.position.z = targetMesh.position.z + offset.z;
    
        return plane;
    }

}

