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
    private subtitles : SubtitleSystem;

    constructor(scene : Scene, ship: Ship) {
        this.scene = scene;
        this.ship = ship;
        this.subtitles = new SubtitleSystem(this.ship.subtitlesEnabledValue)
        if(ship.introValue){
            this.ringTone = new Sound("", "sons/ringtone.mp3", this.scene, null, { volume: 0.5, autoplay: false, loop: true, spatialSound: true, maxDistance: 40});
            this.ringTone.setPosition(new Vector3(10, 12, 22));
        }
        else {
            this.ringTone = new Sound("", "", this.scene, null, { volume: 0.5, autoplay: false, loop: false});
        }
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
                if(this.ship.languageValue === "fr"){
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
                } else {
                    this.subtitles.showSubtitles([
                        { text: "Hello !", duration: 1000 },
                        { text: "Welcome to my ship...", duration: 2000 },
                        { text: "How are you feeling ?", duration: 2000 },
                        { text: "It's pretty dark out here huh ?", duration: 2000 },
                        { text: "Of course ! You are now in the mind of my patient... ", duration: 3000 },
                        { text: "It's always dark.", duration: 2000 },
                        { text: "But don't worry. You're as safe as you can be", duration: 3000 },
                        { text: "Surely this isn't the first time you've faced death.", duration: 4000 },
                        { text: "You have a mission", duration: 2000},
                        { text: "I need you to track the nightmares", duration: 2500},
                        { text: "Photograph them", duration: 1500},
                        { text: "Log them in the patient's file", duration: 2500},
                        { text: "And help me piece together the truth behind their suffering. Compris ? ", duration: 4500},
                        { text: "I already have the coordinates for the first nightmare so I'll help you with it...", duration: 5000},
                        { text: "But after that, you're on your own.", duration: 3500},
                        { text: "Not completely alone, of course, I'll be monitoring you from here...", duration: 5500},
                        { text: "But if anything happens", duration: 2500},
                        { text: "Not that anything will happen", duration: 2500},
                        { text: "I won't be there. Alright ?", duration: 2500},
                        { text: "Let's begin", duration: 1500}, 
                    ]);  
                }
                this.narratorVoices[0].onEndedObservable.add(() => {
                    this.narratorVoices[1].play();
                    if(this.ship.languageValue === "fr"){
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
                    } else {
                        this.subtitles.showSubtitles([
                            { text: "First of all...", duration: 1000},
                            { text: "The command post.", duration: 2000},
                            { text: "It is located at the front of the ship.", duration: 3000},
                            { text: "And will be your eyes in this dark environment, inhospitable to the human mind.", duration: 6000},
                            { text: "On the left side of the room, you will find the wave selector.", duration: 5000},
                            { text: "A device that allows you to enter the frequency and amplitude of the nightmare you wish to track.", duration: 8000},
                            { text: "Once detected", duration: 2000},
                            { text: "The compass will emit a sound to signal its presence.", duration: 4500}
                        ]);
                    }
                });
                
            },1000); 
            this.narratorVoices[1].onEndedObservable.add(() => {
                this.narratorVoices[2].play();

                if(this.ship.languageValue === "fr"){
                    this.subtitles.showSubtitles([
                        { text: "Dans la même pièce, face à la porte", duration: 3000}, 
                        { text: "Le poste de navigation. ", duration: 3000}, 
                        { text: "L’onde que vous aurez saisie y apparaîtra ", duration: 3000}, 
                        { text: "Ainsi que celle correspondant à la position du vaisseau.", duration: 4000}, 
                        { text: "Elle est brouillée, c'est normal.", duration: 3000}, //16
                        { text: "Vous devrez orienter le vaisseau correctement lorsque la boussole signalera la présence d’un cauchemar.", duration: 8000}
                    ]);
                } else {
                    this.subtitles.showSubtitles([
                        { text: "In the same room, facing the door", duration: 3000}, 
                        { text: "Is the navigation station. ", duration: 3000}, 
                        { text: "The wave you have entered will appear there ", duration: 3000}, 
                        { text: "Along with the one corresponding to the ship's position.", duration: 4000}, 
                        { text: "It is scrambled, this is normal.", duration: 3000}, //16
                        { text: "You will have to orient the ship correctly when the compass signals the presence of a nightmare.", duration: 8000}
                    ]);
                }
            });
            this.narratorVoices[2].onEndedObservable.add(() => {
                this.narratorVoices[3].play();

                if(this.ship.languageValue === "fr"){

                    this.subtitles.showSubtitles([
                        { text: "À présent, consultez le dossier posé sur le bureau.", duration: 3000},
                        { text: "Il contient toutes les informations dont nous disposons…", duration: 4500},
                        { text: "Pour l’instant.", duration: 1500},
                        { text: "Ce sera à vous de le compléter au fil de votre voyage.", duration: 6000},
                        { text: "Nous savons peu de choses", duration: 1500},
                        { text: "Mais suffisamment pour trouver notre première cible.", duration: 3000},
                        { text: "Regardez bien, mémorisez les informations", duration: 4500}
                    ]);
                } else {
                    this.subtitles.showSubtitles([
                        { text: "Now, check the file on the desk.", duration: 3000},
                        { text: "It contains all the information we currently have", duration: 4500},
                        { text: "For now.", duration: 1500},
                        { text: "It will be up to you to complete it as you progress through your journey.", duration: 6000},
                        { text: "We know little", duration: 1500},
                        { text: "But enough to find our first target.", duration: 3000},
                        { text: "Look carefully, memorize the information", duration: 4500}
                    ]);
                }
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
                if(this.ship.languageValue === "fr"){

                    this.subtitles.showSubtitles([
                        { text: "Les cauchemars contiennent bien plus d'informations sur nous que nous ne le pensons. ", duration: 5000},
                        { text: "Traquez-les et, en retour, ils vous révéleront vos véritables objectifs.", duration: 5000},
                        { text: "Oh, une dernière chose… ", duration: 3000},
                        { text: "Si le moteur s’éteint, rallumez-le immédiatement. ", duration: 4500},
                        { text: "À moins que vous ne vouliez rester coincé ici…", duration: 3500},
                        { text: "pour toujours.", duration: 1500}
                    ])
                } else {
                    this.subtitles.showSubtitles([
                        { text: "Nightmares hold far more information about us than we think. ", duration: 5000},
                        { text: "Track them and, in return, they will reveal your true objectives.", duration: 5000},
                        { text: "Oh, one last thing… ", duration: 3000},
                        { text: "If the engine shuts out, restart it immediately. ", duration: 4500},
                        { text: "Unless you want to be stuck here…", duration: 3500},
                        { text: "forever.", duration: 1500}
                    ])
                }
            });
        }
    }

    answerPhone(): void {
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
    
        const text1 = this.ship.languageValue === "fr" ? "Cliquez sur le livre" : "Click on the book";
        const text2 = this.ship.languageValue === "fr" ? "pour voir les informations" : "to see patient's info";
    
        const textPlane = this.createFloatingText(this.ship.getDiaries() as Mesh, { x: 4, y: 3, z: 0 }, text1, text2);
    
        highlightLayer.addMesh(this.ship.getDiaries() as Mesh, Color3.Green());
        const handleClick = ()=>{
            if(this.shipControls.isHoveringDiaries()){
                highlightLayer.removeMesh(this.ship.getDiaries() as Mesh);
                textPlane.dispose();
                this.narratorVoices[4].play();
                if(this.ship.languageValue === "fr"){
                    this.subtitles.showSubtitles([
                        { text: "Retournez au poste de commande.", duration: 2000},
                        { text: "Et saisissez les coordonnées dans le sélecteur", duration: 4000}
                    ]);
                } else {
                    this.subtitles.showSubtitles([
                        { text: "Return to the command post.", duration: 2000},
                        { text: "Enter the coordinates into the selector", duration: 4000}
                    ]);
                }
                removeEventListener("pointerdown", handleClick);
            }
        }
        addEventListener("pointerdown", handleClick);
    }

    waveSelectorTutorial() {
        const highlightLayer = new HighlightLayer("hl2", this.scene);
        highlightLayer.outerGlow = false; 
        highlightLayer.innerGlow = true; 
    
        const text1 = this.ship.languageValue === "fr" ? "Scrollez sur le boutton" : "Scroll on the buttons";
        const text2 = this.ship.languageValue === "fr" ? "pour mettre à jour" : "to update wave's coord";
        const text3 = this.ship.languageValue === "fr" ? "l'onde visée" : "";
        const textPlane = this.createFloatingText(this.ship.getButtonAmplitude() as Mesh, { x: 18, y: 11, z: 6 }, text1, text2, text3);
    
        highlightLayer.addMesh(this.ship.getButtonAmplitude() as Mesh, Color3.Green());
        highlightLayer.addMesh(this.ship.getButtonFrequency() as Mesh, Color3.Green());


        const checkValue = () => {
            if (this.objectiveSystem.getCurrentNightmare().nmAmplitude.toFixed(2)===this.navigationSystem.getAmplitude().toFixed(2) && this.objectiveSystem.getCurrentNightmare().nmFrequency.toFixed(2) === this.navigationSystem.getFrequency().toFixed(2)) {
                highlightLayer.removeMesh(this.ship.getButtonAmplitude() as Mesh);
                highlightLayer.removeMesh(this.ship.getButtonFrequency() as Mesh);
                textPlane.dispose();
                this.narratorVoices[5].play();
                if (this.ship.languageValue === "fr"){

                    this.subtitles.showSubtitles([
                        { text: "Et utilisez le panneau de contrôle pour nous diriger.", duration: 5000}
                    ]);
                } else {
                    this.subtitles.showSubtitles([
                        { text: "And use the control panel to guide us.", duration: 5000}
                    ]);
                }
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
    
        const text1 = this.ship.languageValue === "fr" ? "Utilisez les flèches" : "Use the left/right arrows";
        const text2 = this.ship.languageValue === "fr" ? "pour orienter le vaisseau" : "to turn the ship towards";
        const text3 = this.ship.languageValue === "fr" ? "vers le point lumineux" : "the dot"
    
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
    
        const text1 = this.ship.languageValue === "fr" ? "Cliquez sur les bouttons" : "Use the up/down ";
        const text2 = this.ship.languageValue === "fr" ? "pour faire avancer" : "arrows to update";
        const text3 = this.ship.languageValue === "fr" ? "votre vaisseau" : "your position's wave";
    
        const textPlane = this.createFloatingText(this.ship.getButtonAmplitude() as Mesh, { x: 23, y: 11, z: 0 }, text1, text2, text3);
    
        highlightLayer.addMesh(this.ship.getButtonUp() as Mesh, Color3.Green());
        highlightLayer.addMesh(this.ship.getButtonDown() as Mesh, Color3.Green());


        const checkValue = () => {
            if (this.navigationSystem.isOverlap()) {
                highlightLayer.removeMesh(this.ship.getButtonUp() as Mesh);
                highlightLayer.removeMesh(this.ship.getButtonDown() as Mesh);
                textPlane.dispose();
                this.narratorVoices[6].play();
                if(this.ship.languageValue === "fr"){
                    this.subtitles.showSubtitles([
                        { text: "Bien, nous y sommes. Allez dans la deuxième salle et prenez une photo...", duration: 5000},
                        { text: "Mais faites bien attentions que les deux ondes soient parfaitement superposées.", duration: 5000}
                    ])
                } else {
                    this.subtitles.showSubtitles([
                        { text: "Alright. Go to the second room and take a photo...", duration: 5000},
                        { text: "But make sure that both waves are perfectly aligned on top of each other.", duration: 5000}
                    ])
                }
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
    
        const text1 = this.ship.languageValue === "fr" ? "Cliquez sur le boutton" : "Click on the button";
        const text2 = this.ship.languageValue === "fr" ? "Pour prendre une photo" : "to take a photo";
    
        const textPlane = this.createFloatingText(this.ship.getButtonPhoto() as Mesh, { x: 14, y: 3, z: -1 }, text1, text2 );
    
        highlightLayer.addMesh(this.ship.getButtonPhoto() as Mesh, Color3.Green());

        const checkValue = () => {
            if (this.objectiveSystem.getNightmareIndex() != 0) {
                highlightLayer.removeMesh(this.ship.getButtonPhoto() as Mesh);
                textPlane.dispose();
                this.narratorVoices[7].play();
                if(this.ship.languageValue === "fr"){
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
                }
                else {
                    this.subtitles.showSubtitles([
                        { text: "Here is your first nightmare", duration: 2500},
                        { text: "Insane how fast you learn!", duration: 3000},
                        { text: "Your freedom after this will be well deserved.", duration: 3500},
                        { text: "You are now ready to continue alone.", duration: 2500},
                        { text: "Remember the steps well:", duration: 3000},
                        { text: "Consult the patient's file.", duration: 3000},
                        { text: "Travel to the nightmare.", duration: 3000},
                        { text: "Take a photograph.", duration: 2000},
                    ])
                }
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
    
        //plane.renderingGroupId = 1; 

        plane.position.x = targetMesh.position.x + offset.x;
        plane.position.y = targetMesh.position.y + offset.y;
        plane.position.z = targetMesh.position.z + offset.z;
    
        return plane;
    }
}   

