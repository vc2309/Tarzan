import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import { Router, ActivatedRoute} from '@angular/router';
import { AlertController, ToastController, Platform } from '@ionic/angular';
import { Tab1Page } from '../tab1/tab1.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
// import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage implements OnInit {

	video: any;

    // Bluetooth variables
    unpairedDevices: any;
    pairedDevices: any;
    gettingDevices: Boolean;
    model: any;
    interval: any;
    progress: number=0;
    connected: any;
    // orientation variables
    wrong_orientation_count: number = 0;
    correct_orientation: number = 0;
    wrong_position_count: number = 0;
    correct_position: number = 0;

    confidence_threshold: number = 0.6;
    side: string = "left";

     context: any;
     // t1: any;

  constructor(private plt: Platform, private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController) { 

  	// this.t1 = new Tab1Page(private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController);

  }

  ngOnInit() {

        this.loadVideo();

    }
    
    setUpCanvas(){
        var canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
        this.context = canvas.getContext("2d");
        var v = <HTMLVideoElement>document.getElementById('video');
        canvas.width = this.plt.width();
        canvas.height = this.plt.height();

    }

    setContext(ctx){
        var w = 400;
        var h = 800;

        ctx.clearRect(0, 0, w,h);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-w, 0);
        ctx.drawImage(this.video, 0, 0, w, h);
        ctx.restore();
        ctx.font = "50px Comic Sans MS";
        // ctx.fillText(this.rep.toString(), w*0.1, 50);
    }

    isMobile() {
      return /Android/i.test(navigator.userAgent) ||
      /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

	async setupCamera() {
        const videoWidth = this.plt.width();
        const videoHeight = this.plt.height();
        navigator.getUserMedia = navigator.getUserMedia;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                'Browser API navigator.mediaDevices.getUserMedia not available');
            }


        const video = <HTMLVideoElement>document.getElementById('video');
        video.width = 400;
        video.height = 800;

        const mobile = this.isMobile();
        const stream = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': {
                facingMode: 'user',
                width: mobile ? undefined : videoWidth,
                height: mobile ? undefined : videoHeight,
            },
        });
        video.srcObject = stream;

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
              resolve(video);
            };
        });
    }

    async loadVideo() {

      console.log('reached here loadVideo');
      this.video = await this.setupCamera();
      console.log('reached here loadVideo 1');
      this.setUpCanvas();
      this.poses(this.video);
    }

    async poses(video){
        let me = this;
        const net = await posenet.load(0.75);

        async function poseDetectionFrame() {
            const pose = await net.estimateSinglePose(video, 0.5, true, 16);
            let parts_to_check = ["Wrist"];

            let check = me.checkPositionOrientation(pose.keypoints, parts_to_check);
			me.setContext(me.context);

			// console.log(check);
         	if (check)
         	{
         		me.sendSignal(pose.keypoints);
         	}
            

            requestAnimationFrame(poseDetectionFrame);
        }
        poseDetectionFrame()
    }


    sendSignal(keypoints){
    	let right = this.checkRight(keypoints);
    	let left = this.checkLeft(keypoints);
    	// console.log(left,right);
    	if(right && left)
    	{
    	
	    		console.log("forwar");
	    		this.moveForward();
    		
    	}
    	else if(right){
    		console.log("right");
    		this.moveRight();
    	}
    	else if(left){
    		console.log("left");
    		this.moveLeft();
    	}
    }


    checkWristAboveElbow(side, keypoints){

    	let wrist = keypoints.find(obj => {
                    return obj.part === side + "Wrist";
                }).position.y;
    	let elbow = keypoints.find(obj => {
                    return obj.part === side + "Elbow";
                }).position.y;
    	console.log(wrist,elbow);
    	return wrist<elbow;

    }

    checkRight(keypoints){
    	return this.checkWristAboveElbow("right",keypoints);
    }

    checkLeft(keypoints){
    	return this.checkWristAboveElbow("left",keypoints);
    }

    checkCross(keypoints){

    	let r = keypoints.find(obj => {
                    return obj.part === "rightWrist";
                }).position.x;
    	let l = keypoints.find(obj => {
                    return obj.part === "leftWrist";
                }).position.x;
    	console.log(l,r);
    
    	return r>l;
    }



    checkPositionOrientation(keypoints, parts_to_check){

        if(!this.checkPosition(parts_to_check, keypoints)){
            this.wrong_position_count += 1;
            if (this.wrong_position_count > 10){
                this.correct_position = 0;
                this.wrong_position_count = 0
            }
            return false;
        }
        
        return true;
    }

    checkPosition(points, keypoints){
        let sides = ['left', 'right'];
        let sidePoints = {
            "left" : [], "right": []
        };
        for(let i = sides.length-1;i >= 0; i--){
            for(let j = points.length - 1; j >= 0; j--){
                let confidence = keypoints.find(obj => {
                    return obj.part === sides[i] + points[j];
                }).score;
                // console.log(sides[i] + points[j], confidence);
                sidePoints[sides[i]].push(confidence)
            }
        }
        let left = this.checkConfidence(sidePoints["left"]);
        let right = this.checkConfidence(sidePoints["right"]);
        if(left){
            this.side = "left";
        }else if(right){
            this.side = "right"
        }
        return left && right;

    }


        checkConfidence(sidePoints){
        for (var i = sidePoints.length - 1; i >= 0; i--){
            if (sidePoints[i] < this.confidence_threshold) return false;
        }
        return true;
    }

async onPress(dir) {
    console.log("onPress");
    // this.pressState = 'pressing';
    // this.startInterval();
    const self = this;
    // this.interval = setTimeout(async () => {
    //     await self.sendCommand(dir);
    // }, 600);
    console.log(this.progress);
    // if(this.progress>=2){
    	await self.sendCommand(dir);
    	// this.progress=0;
    // }
    // else{
    	this.progress++;
    // }

}

onPressUp($event) {
    console.log("onPressUp", $event);
    // this.pressState = 'released';
    this.stopInterval();
}

startInterval() {
    const self = this;
    this.interval = setInterval(function () {
        self.progress = self.progress + 1;
    }, 50);
}

stopInterval() {
    clearInterval(this.interval);
}
  success = (data) => {alert(data); this.connected = true;};
  fail = (error) => alert(error);

async moveLeft() {
	await this.onPress('l');
	// this.startInterval();

}

async moveRight(){
	await this.onPress('r');
	// this.startInterval();
}

async moveForward(){

	await this.onPress('f');
	// this.startInterval();
}

async moveBack(){
	 await this.onPress('b');
	// this.startInterval();
}

async sendCommand(dir){
	
    var ctrl = this;
    await this.bluetoothSerial.write(dir).then(function (success) {
      console.log("SENDING",dir);
      console.log(success);
    }, function (failure) {
      console.log(failure);
    });
  }



async remote(){
	await this.sendCommand("remote");

}


}
