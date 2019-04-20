#include <SoftwareSerial.h> 
#include <Servo.h> 

Servo servo1; 
Servo servo2;
int TX = 9; 
int RX = 11; 
String mode = "remote";

SoftwareSerial HC_06(TX, RX);  //Bluetooth TX to 10 and Bluetooth RX to 11.

void setup()
{
  Serial.begin(9600);
  HC_06.begin(9600);
}


void parseCoord(String args){
  int x = args[2]-'0';
  int y = args[4]-'0';
  Serial.print("COORDS ");
  Serial.print(x);
  Serial.print(",");
  Serial.println(y);
}

void followLight(){
  Serial.print("COORDS ");
  //light code
}

void makeMove(char val) {
  Serial.print(val);
//  remote control
}

void loop()
{
if(HC_06.available()> 0 ) 
  {
    if(mode=="remote")
    {
      char value = HC_06.read();
      Serial.println(value);
      if(value=='c'){
        mode = "command";
      }
      else{
        makeMove(value);
      }
    }
    
    else if(mode=="command"){
      String value = HC_06.readString();
      Serial.println(value);
      if(value=="remote")
        {
          mode = "remote";
        }
      else{
        switch(value[0]){
          case '1' : parseCoord(value);
          break;
          case '2' : followLight();
          break;
          default : followLight();
        }
      }
      
    }
  }
//    Serial.println(value); 
  }
  
//}
