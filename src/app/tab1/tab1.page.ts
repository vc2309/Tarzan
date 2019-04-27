import { Component, OnInit } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{

car1 : "98:D3:31:FC:15:E1";
car2 : any;
connected : boolean;
model: {};

public progress: number = 0;

// Interval function
protected interval: any;

async ionSelected(){
	await this.sendCommand("remote");
}

async ngOnInit() {
	await this.sendCommand("remote");
}

async onPress(dir) {
    console.log("onPress");
    // this.pressState = 'pressing';
    // this.startInterval();
    const self = this;
    this.interval = setInterval(async () => {
        await self.sendCommand(dir);
    }, 200);

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

constructor(private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController) {
    	this.model = {};
   	}

async connectCar1(){
	console.log("Connecting to car 1");
	await this.selectDevice(this.car1);
}

async connectCar2(){
	await this.selectDevice(this.car2);
}

async selectDevice(address: any) {
	    let alert = await this.alertCtrl.create({
	      header: 'Connect',
	      message: 'Do you want to connect with?'+address,
	      buttons: [
	        {
	          text: 'Cancel',
	          role: 'cancel',
	          handler: () => {
	            console.log('Cancel clicked');
	          }
	        },
	        {
	          text: 'Connect',
	          handler: async () => {
	            console.log(address);
	            await this.bluetoothSerial.connect(address).subscribe(this.success, this.fail);
	          	
	          }
	        }
	      ]
	    });
	    await alert.present();

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

}
