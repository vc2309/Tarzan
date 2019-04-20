import { Component, OnInit } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{
	input_x : number;
	input_y : number;
	constructor(private bluetoothSerial: BluetoothSerial){}
	
	async ngOnInit() {
		await this.sendCommand('c');
	}

	async startCoord(){
		console.log(this.input_x,this.input_y);
		await this.sendCommand("1."+this.input_x+"."+this.input_y);
	}

	async startLight(){
		console.log("LIGHT");
		await this.sendCommand("2.");
	}



async sendCommand(dir){
	// console.log("SENDING",dir);
    var ctrl = this;
    await this.bluetoothSerial.write(dir).then(function (success) {
      console.log("SENDING",dir);
      console.log(success);

    }, function (failure) {
      console.log(failure);
    });
  }
}
