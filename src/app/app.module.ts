import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { ChangeDetectorRef } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { IonicGestureConfig } from "./ionic-gesture-config";

export class CustomHammerConfig extends HammerGestureConfig {
    overrides = {
        'press': { time: 1000 }  //set press delay for 1 second
    }
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothSerial,
    SpeechRecognition,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: CustomHammerConfig
        }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  
}
