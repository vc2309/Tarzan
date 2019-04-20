import { Component, OnInit } from '@angular/core';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { ChangeDetectorRef } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
	matches: String[];
	isRecording = false;
	keyword = false;
	message = "";
	command = ""
	
	constructor(private speechRecognition: SpeechRecognition, private cd: ChangeDetectorRef, private bluetoothSerial: BluetoothSerial) { }
 
	async ngOnInit() {
		this.getPermission();
		await this.sendCommand('c');
	// this.loop();
	}


	loop(){
		// var keyword = "false";

		while(!this.keyword)
		{

	 	let options = {
	      language: 'en-US'
	    }
	    this.speechRecognition.startListening().subscribe(matches => {
	      this.matches = matches;
	      this.cd.detectChanges();
	      console.log(this.matches);
	      for (var i = this.matches.length - 1; i >= 0; i--) {
	    	if (this.matches[i].split(" ").indexOf("tarzan")>-1){
	    		this.keyword=true;
	    		break;
	    	}
	    }
	    });
	    
	}
	console.log("LISTENING");
	this.startListening();
	}

	getPermission() {
		this.speechRecognition.hasPermission()
		  .then((hasPermission: boolean) => {
		    if (!hasPermission) {
		      this.speechRecognition.requestPermission();
		    }
		  });
	}

	startListening() {
		let options = {
			language: 'en-US'
		}
		this.speechRecognition.startListening().subscribe(matches => {
			this.matches = matches;
			console.log(this.matches);
			this.cd.detectChanges();
			this.issueCommand();
		});
		this.isRecording = true;
	}

	async sendCoordinate() {
		console.log("i am here");
		var found= false;
		for (var i = this.matches.length - 1; i >= 0; i--) {
			var coords = [];
			var command = this.matches[i].split(' ');
			
				for (var j = command.length - 1; j >= 0; j--) {
					var item=command[j];
					var coord = parseInt(item);
					if (!isNaN(coord)){
						if(coord<10){coords.push(coord);}
						else{
							coords.push(parseInt(item[1])); 
							coords.push(parseInt(item[0]));
							}
						
					}
				}
			if (coords.length==2){
				this.message = "Moving to ("+coords[1]+","+coords[0]+")"
				found=true;
			}
			
			if(found){
				console.log("coordinate "+coords);
				this.cd.detectChanges();
				var com = "1."+coords[1]+"."+coords[0]
				await this.sendCommand(com);
				break;
			}
		}
		if(!found){
			this.message = "I did not understand";
		}
	}

	issueCommand() {
	var top_command = this.matches[0].split(' ');

	if(top_command.indexOf("go")>-1) {
		this.sendCoordinate();
	}
	else if (top_command.indexOf("light")>-1) {
		this.sendLight();

	}

	}

	async sendLight(){
		var com = "2.";
		this.message = "Following Light";
		this.cd.detectChanges();
		await this.sendCommand(com);
	}

	async sendCommand(dir){

	/*
	format = "<commandtype>.<coordinate>.<coordinate>"
	commandtype = 1 -> coordinate
				  2 -> follow light
				  3 -> find colour
	*/


		console.log("SENDING",dir);
		var ctrl = this;
		await this.bluetoothSerial.write(dir).then(function (success) {
			console.log(success);
			}, function (failure) {
			console.log(failure);
			});
		}

	}
