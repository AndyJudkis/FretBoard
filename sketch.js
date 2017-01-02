var openStringNotes = [64, 69, 74, 79, 83, 88]; // midi notes
var fretboardWidth = 150;
var fretboardHeight = 800;
var nutHeight = 22;
var fretHeight = 3;
var numFrets = 18;
var strings = [];
var noteBalloonRadius = 12;
var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var keyList =        ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
var midiRootForKey = [60,   55,  62,  57,  52,  59,   54,   61,   56,   63,  58,   53];
var notesInCurrentKey = [];
var keySelector;
var seventhCheckbox, tenthCheckbox, showScaleNotesCheckbox;
var seventhOfThisNote, tenthOfThisNote;
var xOffset = fretboardWidth + 20;

function setup() {
  createCanvas(fretboardWidth + 200, fretboardHeight + 100);
  for (var num = 0; num <= 5; num++) {
    strings.push(new String(openStringNotes[num], num));
    
  }
  addControls();
  newKey(); // set initial scale
}

function addControls() {
  keySelector = createSelect();
  keySelector.position(xOffset, 25);
  for (var nxt = 0; nxt < keyList.length; nxt++) {
    keySelector.option(keyList[nxt]);
  }
  keySelector.changed(newKey);
  
  showScaleNotesCheckbox = createCheckbox("show notes in scale");
  showScaleNotesCheckbox.position(xOffset, 50);
  showScaleNotesCheckbox.changed(checkboxChanged);
  
  seventhCheckbox = createCheckbox("show 7ths");
  seventhCheckbox.position(xOffset, 75);
  tenthCheckbox = createCheckbox("show 10ths");
  tenthCheckbox.position(xOffset, 100);
  
}

function draw() {
  background(180);
  fill(100);
  stroke(0);
  rect(0, 0, fretboardWidth, fretboardHeight);
  noStroke();
  for (var nxt=0; nxt < 6; nxt++) {
    strings[nxt].drawAll();
  }
}

function numberToName(midiNote) {
  return noteNames[midiNote%12];
}


function String(midiNote, position) { // position is 0 for lowest, 5 for highest
  this.fretPosList = [];
  this.position = position;
  
  for (var nxt = midiNote; nxt <= midiNote + numFrets; nxt++) {
    this.fretPosList.push(new FretPos(this, nxt, nxt - openStringNotes[position], fretboardWidth/6, fretboardHeight/numFrets));
  }
  String.prototype.drawAll = function() {
    for (var nxt = 0; nxt <= numFrets; nxt++) {
      this.fretPosList[nxt].draw();
    }
  }
}

function FretPos(string, midiNote, fretNum, wd, ht) {
  this.midiNote = midiNote;
  this.fretNum = fretNum;
  this.string = string;
  this.hasMarker = false;
  
  if (fretNum == 0) {
    // open string -- based on the nut
    this.y = 0;
    this.x = string.position*wd;
    this.wd = wd;
    this.ht = nutHeight;
  } else {
    this.y = nutHeight + ((fretNum - 1) * ht);
    this.x = string.position*wd;
    this.wd = wd;
    this.ht = ht;
  }
  if (fretNum == 5 || fretNum == 7 || fretNum == 9 || fretNum == 12 || fretNum == 15 || fretNum == 17) {
    if (string.position == 2 ) {
      this.hasMarker = true;
      // exception for 12th fret -- 2 dots
      if (fretNum == 12) {
        this.markerXpos = this.x + this.wd/2 - 10;
      } else {
        this.markerXpos = this.x + this.wd;
      }
      
    } else if (string.position == 3) {
      this.hasMarker = true;
      // exception for 12th fret -- 2 dots
      if (fretNum == 12) {
        this.markerXpos = this.x + this.wd/2 + 8;
      } else {
        this.markerXpos = this.x;
      }
    }

  }

  
  FretPos.prototype.mouseOver = function() {
    return mouseX > this.x && mouseX < this.x + this.wd && mouseY > this.y && mouseY < this.y + this.ht;
  }
  
  FretPos.prototype.draw = function() {
    if (this.fretNum == 0){
      fill(64, 32, 16);
    } else {
      fill(192, 96, 48);
    }
    noStroke();
    rect(this.x, this.y, this.wd, this.ht);
    // now draw the fret:
    strokeWeight(2);
    stroke(0);
    var fretYpos = this.y + this.ht - 2;
    line(this.x, fretYpos, this.x + this.wd, fretYpos);
    // and draw the string
    stroke(255);
    var stringXpos = this.x - 1 + this.wd/2;
    line(stringXpos, this.y, stringXpos, this.y + this.ht);
    // draw fretboard markers
    if (this.hasMarker) {
      fill(128);
      ellipse(this.markerXpos, this.y + this.ht/2, 5, 5 );
    }
    var circleYpos = this.y + this.ht - noteBalloonRadius;
    if (showScaleNotesCheckbox.checked()) {
      if (notesInCurrentKey.indexOf(this.midiNote) != -1) {
        var diff = this.midiNote - notesInCurrentKey[0];
        if (diff % 12 == 0) {
          stroke(255);
          fill(255);
        } else {
          stroke(220, 220, 0);
          noFill();
        }
        
        //console.log("midi note " + this.midiNote + " is in the scale");
        
        ellipse(this.x + this.wd/2, circleYpos, noteBalloonRadius*2 - 8, noteBalloonRadius*2 - 8);
      }
    }
    if (this.midiNote == seventhOfThisNote || this.midiNote == tenthOfThisNote) {
      fill(0, 0, 255);
      ellipse(this.x + this.wd/2, circleYpos, noteBalloonRadius*2 - 8, noteBalloonRadius*2 - 8);
    }

    
    
    if (this.mouseOver()) {
      // the mouse is over this position - show the note name
      var scalePos = notesInCurrentKey.indexOf(this.midiNote);
      if (scalePos == -1) {
        // this note is not in the current scale
        fill(200, 200, 0);
      } else {
        fill(255, 255, 0);
      }
      
      
      var circleYpos = this.y + this.ht - noteBalloonRadius;
      ellipse(this.x + this.wd/2, circleYpos, noteBalloonRadius*2, noteBalloonRadius*2);
      fill(0);
      stroke(0);
      textSize(16);
      textStyle(NORMAL);
      text(numberToName(this.midiNote), this.x + 6, circleYpos + 5);
      
      // figure out if we can/should show the seventh and/or tenth of this note
      seventhOfThisNote = -1;
      tenthOfThisNote = -1;
      
      if ( scalePos != -1) {
        // this note is in the scale.
        if (seventhCheckbox.checked()) {
          if (notesInCurrentKey.length > scalePos + 6) {
            seventhOfThisNote = notesInCurrentKey[scalePos + 6];
            //console.log("the 7th of this note is " + seventhOfThisNote);
          }
        }
        if (tenthCheckbox.checked()) {
          if (notesInCurrentKey.length > scalePos + 9) {
            tenthOfThisNote = notesInCurrentKey[scalePos + 9];
            //console.log("the 10th of this note is " + tenthOfThisNote);
          }
        } 
      }
    }
  }
  
}

var newKey = function() {
  var newKey = keySelector.selected();
  var index = keyList.indexOf(newKey);
  var midiRoot = midiRootForKey[index];
  
  notesInCurrentKey = [];
  for (var octave = 0; octave < 5; octave++) { // 5 octaves worth. . . 
    var root = midiRoot + (octave * 12);
    notesInCurrentKey.push(root);
    notesInCurrentKey.push(root + 2);
    notesInCurrentKey.push(root + 4);
    notesInCurrentKey.push(root + 5);
    notesInCurrentKey.push(root + 7);
    notesInCurrentKey.push(root + 9);
    notesInCurrentKey.push(root + 11);
  }
  notesInCurrentKey.push(midiRoot + 6*12); 
  
}

var checkboxChanged = function() {
  console.log("Checkbox:" + showScaleNotesCheckbox.checked());
}