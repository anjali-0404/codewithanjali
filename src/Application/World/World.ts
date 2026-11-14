import Application from '../Application';
import Resources from '../Utils/Resources';
import MonitorScreen from './MonitorScreen';
import GameRoom from './GameRoom';
import CoffeeSteam from './CoffeeSteam';
import AudioManager from '../Audio/AudioManager';
import RobotCompanion from './RobotCompanion';

export default class World {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;

    // Scene objects
    gameRoom: GameRoom;
    monitorScreen: MonitorScreen;
    coffeeSteam: CoffeeSteam;
    audioManager: AudioManager;
    robotCompanion: RobotCompanion;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.resources.on('ready', () => {
            this.gameRoom       = new GameRoom();
            this.monitorScreen   = new MonitorScreen();
            this.coffeeSteam    = new CoffeeSteam();
            this.audioManager   = new AudioManager();
            this.robotCompanion = new RobotCompanion();
        });
    }

    update() {
        if (this.gameRoom)       this.gameRoom.update();
        if (this.monitorScreen)  this.monitorScreen.update();
        if (this.coffeeSteam)    this.coffeeSteam.update();
        if (this.audioManager)   this.audioManager.update();
        if (this.robotCompanion) this.robotCompanion.update();
    }
}
