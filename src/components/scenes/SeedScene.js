import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        this.play = 0;
        this.timing = [];
        this.counter = 0;
        this.initialTime = 0;
        this.timeIndex = 0;
        this.sum = 0;

        // Set background to a nice color
        this.background = new Color("rgb(27, 27, 27)");

    //     // Add meshes to scene
    //     const land = new Land();
        // const flower = new Flower(this);
        // const lights = new BasicLights();
        // this.add(flower, lights);

        // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    // timeStamp = 1000/60
    // 1000 ms = 1 s
    // this.counter / 60 == a second
    // one count == 1/60 of a second
    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        const stamp = 1000 / 60;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
        
        if (this.play) {
            if (this.initialTime == 0) {
                // console.log("1");
                this.initialTime = timeStamp;
                this.changeBackgroundColor();
            }
            let diff = (timeStamp - this.initialTime) * 60 / 100;
            if (diff+10 >= this.sum) {
                // console.log("2 " + diff);
                this.initialTime = timeStamp;
                this.changeBackgroundColor();
                // this.counter = 0;
                this.timeIndex = 0;
            }
            else if (diff+10 >= this.timing[this.timeIndex]) {
                this.changeBackgroundColor();
                // console.log("3 " + diff);
                this.timeIndex++;
            }
        }
    }

    changeBackgroundColor() {
        let color = new Color( 0xffffff );
        color.setHex( Math.random() * 0xffffff );
        this.background = color;
    }

    changeColors(tempo, lengthList) {
        let timing = [];
        let time;
        // lengthList = [1];
        for (let i = 0; i < lengthList.length - 1; i++) {
            time = (1 / lengthList[i]) * (60 / tempo);
            time *= 2000;
            // time = Math.round(time);
            // time /= 100;
            // console.log(time);
            if (i == 0) {
                timing.push(time);
            }
            else {
                timing.push(timing[i - 1] + (time));
            }
        }
        this.counter = 0;
        this.play = 1;
        this.timing = timing;
        this.sum = 60 / tempo * 2000;
        // this.sum = timing[timing.length-1];
        console.log(tempo);
        console.log(this.sum);
        console.log(timing);
    }

    stopColors() {
        this.background = new Color("rgb(27, 27, 27)");
        this.counter = 0;
        this.play = 0;
        this.timing = [];
        this.timeIndex = 0;
        this.initialTime = 0;
    }
}

export default SeedScene;
