#include <Servo.h>
#include <SoftwareSerial.h> 
Servo left, right; 
int l_qti, m_qti, r_qti; // left, middle, right

int TX = 12; 
int RX = 13; 
String mode = "remote";

SoftwareSerial HC_06(TX, RX);  //Bluetooth TX to 10 and Bluetooth RX to 11.


unsigned long total_count = 0;
unsigned long count = 0;
double pos = 0; // car position

const int thre1 = 80; // qti threshold 1: white
const int thre2 = 300; // qti threshold 2
const int thre3 = 500; // qti threshold 3: black

// yash variables
int intersection = 0;

int y_current = 0;
int y_target = 0;

int x_current = 0;
int x_target = 0;

int y_count = 0;
int x_count = 0;
int x_new_target = 0;
int y_new_target = 0;
int direct = -1;

//ultrasonic
//#define echoPin 12 
long duration, distance_in_cm;
bool obstacle_x = false;
bool obstacle_y = false;
bool take_left = false;


// end variables

int get_qti(int pin){
  digitalWrite(pin, HIGH);
  return analogRead(pin);
}

//void backward(){
////  left.writeMicroseconds(1500);
////  right.writeMicroseconds(1560);
//    left.writeMicroseconds(1450);
//  right.writeMicroseconds(1610);
//}
//
//void forward(){
////  left.writeMicroseconds(1560);
////  right.writeMicroseconds(1500);
//  left.writeMicroseconds(1610);
//  right.writeMicroseconds(1450);
//}
//
//void stay(){
//  left.writeMicroseconds(1530);
//  right.writeMicroseconds(1530);
//}
//
//void spin_left(){
////  left.writeMicroseconds(1500);
////  right.writeMicroseconds(1500);
//  left.writeMicroseconds(1450);
//  right.writeMicroseconds(1450);
//}
//
//void spin_right(){
////  left.writeMicroseconds(1560);
////  right.writeMicroseconds(1560);
//  left.writeMicroseconds(1610);
//  right.writeMicroseconds(1610);
//}


//
//void spin_right90(){
//  // spin 90 degrees to right
//  spin_right();
//  delay(600);
//  while(get_qti(A1) < thre3){
//    delay(1);
//  }
//}
//
void spin_left90(){
  // spin 90 degrees to left
  spin_left();
  delay(450);
  while(get_qti(A1) < thre3){;
    delay(1);
  }
  delay(20);
}

void backward(){
  left.writeMicroseconds(1500);
  right.writeMicroseconds(1560);
}

void stay(){
  left.writeMicroseconds(1530);
  right.writeMicroseconds(1530);
}

void forward(){
  left.writeMicroseconds(1600); // 40
  right.writeMicroseconds(1460);
}


void spin_left(){
  left.writeMicroseconds(1460);
  right.writeMicroseconds(1460);
}

void spin_right(){
  left.writeMicroseconds(1600); // 40
  right.writeMicroseconds(1600);
}

void spin_right90(){
  // spin 90 degrees to right
  spin_right();
  delay(450); // to do
  while(get_qti(A1) < thre3){
    delay(1);
  }
  delay(20);
}

bool getpos(int l_qti, int m_qti, int r_qti, double &res){ 
  // return True if it detects the black line
  // return False if it loses track of the black line
  // res: result of predicting the position of the line
  // -1 < res < 1, which is the position of the black line
  // -ve res -> black line on the right
  // +ve res -> black line on the left 
  
  if(m_qti < thre1 && r_qti < thre1 && l_qti > thre2){
    // the line is closest to the left QTI sensor
    // map the value of l_qti from 0 ~ 1023 to -1 ~ -0.5
    res = l_qti/1023.0 /2.0 - 1;
    return true;
  }
  if(m_qti < thre1 && l_qti < thre1 && r_qti > thre2){
    // the line is closest to the right QTI sensor
    // map the value from 0 ~ 1023 to 0.5 ~ 1
    res = 1 - r_qti/1023.0 /2.0;
    return true;
  }
  if(l_qti < thre1 && m_qti < thre1 && r_qti < thre1){
    // All QTI sensors cannot find the line
    return false;
  }

  // Otherwise, the line is between the left and right QTI sensors
  res = (double)(r_qti - l_qti)/(l_qti + m_qti + r_qti);
  return true;
}

//void linefollow(double pos){
//  // difference in left/right wheel speed is proportional to
//  // the deviation of the line position
//  left.writeMicroseconds(1560 + (int)(pos*20));
//  right.writeMicroseconds(1500 + (int)(pos*20));
//}

void linefollow(double pos){
  // difference in left/right wheel speed is proportional to
  // the deviation of the line position
  left.writeMicroseconds(1600 + (int)(pos*80));
  right.writeMicroseconds(1460 + (int)(pos*80));
}

void setup() {
  delay(2000);
  Serial.begin(9600);
  HC_06.begin(9600);
  pinMode(9, OUTPUT); // left servo
  pinMode(10, OUTPUT); // right servo
  pinMode(A0, INPUT); // right QTI
  pinMode(A1, INPUT); // middle QTI
  pinMode(A2, INPUT); // left QTI
//  pinMode(echoPin, OUTPUT);
  
  left.attach(9);
  right.attach(10);
  Serial.println(y_new_target);
  Serial.println(x_new_target);
  
}

void setDirection(){
  if(y_target == y_current && x_target == x_current){
    direct = -1;
    return;
  }
  if(y_target == y_current){
    if(x_target > x_current)direct = 2;
    else direct = 6;
  }
  else if(y_target > y_current){
    if(x_target == x_current)direct = 0;
    else if(x_target > x_current)direct = 1;
    else direct = 7;
  }
  else{
    if(x_target == x_current)direct = 4;
    else if(x_target > x_current)direct = 3;
    else direct = 5;
  }
}

void first_turn(){
   if(direct == 3 || direct == 4 || direct == 5){
    forward();
    delay(50);
    spin_right90();
    spin_right90();
  }
    else if(direct == 2){
      forward();
      delay(50);
      spin_right90();
     }
     else if(direct == 6){
        forward();
        delay(50);
        spin_left90();
     }else{
      Serial.println("entered here 2");
      return;
     }
}

void second_turn(){
 if(direct == 0 || direct == 4){
    return;
 }
 else if(direct == 1 || direct == 5){
    forward();
    delay(50);
    spin_right90();
 }
 else if(direct == 3 || direct == 7){
    forward();
    delay(50);
    spin_left90();
 }
}

void turn_north(){
  if(direct == 0){
    return;
  }
  else if(direct == 1 || direct == 2 || direct == 3){
    forward();
    delay(50);
    spin_left90();
  }
  else if( direct == 4){
    forward();
    delay(50);
    spin_right90();
    spin_right90();
  }
  else if(direct == 5 || direct == 6 || direct == 7){
    forward();
    delay(50);
    spin_right90();
  }
}

bool ultrasonic(){
// pinMode(echoPin, OUTPUT);
// digitalWrite(echoPin, LOW); 
// delayMicroseconds(2); 
// digitalWrite(echoPin, HIGH);
// delayMicroseconds(10); 
// digitalWrite(echoPin, LOW);
// pinMode(echoPin, INPUT);
// digitalWrite(echoPin, HIGH);
// duration = pulseIn(echoPin, HIGH);
// distance_in_cm = (duration/2) / 29.1;
//
// Serial.println(distance_in_cm);
// if(distance_in_cm < 15){
//  return true;
// }return false;
}


void coord_loop(){
    stay(); 
  setDirection();
  forward();
  delay(50);
  spin_left90();
  first_turn();
  bool temp = false;
  while(true)
  { 
    r_qti = get_qti(A0);
    m_qti = get_qti(A1); 
    l_qti = get_qti(A2); 

    getpos(l_qti, m_qti, r_qti, pos);

    // count how many interceptions have been passed
    if(l_qti > thre3 && m_qti > thre3 && r_qti > thre3){
      count++;
    }else{
      total_count = count;
      count = 0;
    }

    if(total_count > 10){
      // turn right if more than 10 interceptions have been passed
      total_count = 0;
      count = 0;
      intersection += 1;
      if(take_left){
        forward();
        delay(50);
        spin_left90();
        if(obstacle_y){
          x_count += 1;
        }
        take_left = false;
        intersection = 0;
        linefollow(pos);
      }
    }else{
      // follow the line otherwise
      linefollow(pos);
    }

    if(y_count < y_new_target){
      if(intersection > 0){
        y_count += 1;
        intersection = 0;
        if(temp){
          forward();
          delay(50);
          spin_right90();
          take_left = true;
          obstacle_y = true;
        }
        if(y_count == y_new_target){
          second_turn();
        }
      }
    }
    else if(x_count < x_new_target){
      if(intersection > 0){
        x_count += 1;
        intersection = 0;
        if(temp){
          forward();
          delay(50);
          spin_right90();
          take_left = true;
          obstacle_x = true;
        }
        if(x_count == x_new_target){
            if(obstacle_x){
             forward();
             delay(50);
             spin_left90();
             y_count -= 1;
            }
        }
      }
    }
    else{
        stay();
        break;
    }
  }
}


void parseCoord(String args){
  int x = args[2]-'0';
  int y = args[4]-'0';
  Serial.print("COORDS ");
  Serial.print(x);
  Serial.print(",");
  Serial.println(y);
  x_target = x;
  y_target = y;
  y_new_target = abs(y_target - y_current);
  x_new_target = abs(x_target - x_current);
  Serial.print("going to ");
  Serial.print(x_new_target);
  Serial.print(",");
  Serial.println(y_new_target);
  coord_loop();
}

void followLight(){
  Serial.print("COORDS ");
  //light code
}

void makeMove(char val) {
  Serial.print("move");
  switch(val) {
    case 'f' : forward(); delay(200);
    break;
    case 'b' : backward(); delay(200);
    break;
    case 'l' : spin_left(); delay(200);
    break;
    case 'r' : spin_right(); delay(200);
    break;
    default : Serial.println("stay"); stay();
  }
}



void loop() {
//   Serial.println("looping");
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
  else{
//    Serial.println("stay");
    stay();
  }
//    Serial.println(value); 
  }
  
