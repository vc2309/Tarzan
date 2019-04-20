import { Component, OnInit } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit{

    unpairedDevices: any;
    pairedDevices: any;
    gettingDevices: Boolean;
    model: any;
    HC05 : string = "HC-05";

  	constructor(private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController) {
    	this.model = {};
   
   	}

   	async ngOnInit() {
   		console.log("HERE");
	  	await this.bluetoothSerial.enable();
	  	await this.bluetoothSerial.list().then((successfulPairing) => {
	        this.pairedDevices = successfulPairing;
	        console.log(this.pairedDevices);
	      },
	      (err) => {
	        console.log(err);
	      });
	  	var address = "";
	  	for (var i = this.pairedDevices.length - 1; i >= 0; i--) {
	  		if(this.pairedDevices[i].name == this.HC05)
	  		{
	  			address = this.pairedDevices[i].address;
	  			break;
	  		}
	  	}
	  	await this.selectDevice(address);
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

  success = (data) => alert(data);
  fail = (error) => alert(error);

	
  	async remote(){
  		await this.sendCommand("remote");

  	}
  	async command(){
  		await this.sendCommand('c');
  	}
	async sendCommand(dir){

	/*
	format = "<commandtype>.<coordinate>.<coordinate>"
	commandtype = 1 -> coordinate
				  2 -> follow light
				  3 -> find colour
	*/


		
		var ctrl = this;
		await this.bluetoothSerial.write(dir).then(function (success) {
			console.log(success);
			console.log("SENDING",dir);
			}, function (failure) {
			console.log(failure);
			});
		}



	}
