class multiGame extends Phaser.Scene {
  constructor() {
    super({ key: 'multiGame' });
  }

  Questions = [];
  fileName = './content/Ques_Bank';
  nosPlayers;
  startBtn;
  question_Data;
  popUp_Container;
  option_holder;
  popup;
  ques_Holder;
  butns_Holder = [];
  btnXPos = [-395, 10];
  btnYPos = [0, 105];
  tweenIn;
  tweenOut;

  Url = {
    get get() {
      var vars = {};
      if (window.location.search.length !== 0)
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
          key = decodeURIComponent(key);
          if (typeof vars[key] === "undefined") { vars[key] = decodeURIComponent(value); }
          else { vars[key] = [].concat(vars[key], decodeURIComponent(value)); }
        });
      return vars;
    }
  };

  preload() {
    this.load.image('backgroundMenu', './assets/images/backgroundMenu.jpg');
    this.load.spritesheet('strt_Btn', './assets/images/Start_Btn.png', { frameWidth: 120, frameHeight: 39 });
    this.load.image('popUp', 'assets/images/PopUp.png');
  }

  create() {
    this.add.sprite(568, 320, 'backgroundMenu').setScale(1.25);
    var self = this;
    this.getJsonData();
    this.socket = io();
    this.otherPlayers = this.add.group();
    this.popUp_Container = this.add.container(568, 350).setInteractive();

    this.popup = this.add.sprite(0, 0, 'popUp').setInteractive();
    this.ques_Holder = this.add.text(-387, -120, 'Hello this is a test message. This message is for testing purpose only. Please check if you are able to see this message. Please check if you are able to see this message. Hello this is a test message. Please check if you are able to see this message.', { font: "22px Arial", fill: "#FFFFFF", align: "center", wordWrap: { width: this.popup.width - 50, useAdvancedWrap: true } });
    this.option_holder = this.add.container(568,370).setInteractive();

    this.popUp_Container.add([this.popup, this.ques_Holder]);

    for (var i = 0; i < 4; i++) {
      var xVal = i % 2 == 1 ? this.btnXPos[0] : this.btnXPos[1];
      var yVal = i < 2 ? this.btnYPos[0] : this.btnYPos[1];

      this.butns_Holder.push(this.create_Buttons(xVal, yVal,i));
      this.option_holder.add(this.butns_Holder[i]);
    }
    //this.popUp_Container.add([this.option_holder]);
    this.option_holder.setInteractive(new Phaser.Geom.Rectangle(0, 0, 500, 500), Phaser.Geom.Rectangle.Contains);  
    console.log();
    this.input.on('gameobjectover', function (pointer, gameObject) {

        console.log("hello");

    });
    this.popUp_Container.on("pointerup", function () {
            
        }, this)
    //this.popUp_Container.alpha = 0;
    //this.popUp_Container.x = 2000;

    this.nosPlayers = this.add.text(16, 16, '', { fontSize: '32px', fill: '#fff' });

    this.gameStartMessage = this.add.text(568, 320, 'Game Already in progress..', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    this.gameStartMessage.visible = false;

    this.waitingMessage = this.add.text(568, 320, 'Waiting for other players to join...', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    this.socket.on('gameStarted', function (gameStarted) {
      if (gameStarted) {
        self.gameStartMessage.visible = true;
      }
    });

    this.socket.on('renderGame', function () {
      self.clearScreen(self);
      self.startQuiz();
    })

    this.waitingMessage.visible = false;

    this.socket.on('currentPlayers', function (players, gameStarted) {
      self.nosPlayers.setText('No of Players: ' + Object.keys(players).length);
      if (gameStarted) {
        self.clearScreen(self);
        self.startQuiz();
      }
    });

    this.socket.on('disconnect', function (playerId, players) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
      self.nosPlayers.setText('No of Players: ' + Object.keys(players).length);
    });

    this.startBtn = this.add.sprite(568, 320, 'strt_Btn').setInteractive();
    this.startBtn.on('pointerover', function () { this.setFrame(1); });
    this.startBtn.on('pointerout', function () { this.setFrame(0); });
    this.startBtn.on('pointerdown', function () {
      this.setFrame(2);
      self.socket.emit('startClicked');
      self.waitingMessage.visible = true;
      self.startBtn.visible = false;
    });
    this.startBtn.visible = false;

    this.socket.on('showStartButton', function () {
      self.startBtn.visible = true;
    });
    this.socket.on('hideStartButton', function () {
      self.startBtn.visible = false;
    });

    this.socket.on('newPlayer', function (gameStarted, players) {
      self.nosPlayers.setText('No of Players: ' + Object.keys(players).length);
      if (!gameStarted) {
        self.startBtn.visible = true;
      }
    });


    //CREATE A SIMPLE RECT WITH BORDER

    /*
        //CREATE A BORDER ON TOP OF BUTTON
        let border = this.add.graphics();
        border.lineStyle(3, 0xffffff, 1);
        border.strokeRoundedRect(3, 3, 94, 94, 10);
        border.x = 100;
        border.y = 100;
        border.alpha = 0;
    
       //YOYO EFFECT ON BORDER
       let tween = this.tweens.add({
          targets: border,
          duration: 1000,
          delay: 500,
          alpha: 1,
          repeat: -1,
          yoyo: true
      });
    */
  }

  clearScreen(This) {
    This.nosPlayers.visible = false;
    This.waitingMessage.visible = false;
  }

  startQuiz() {
    console.log('Quiz Started')
  }

  update() {
  }

  create_Buttons(_x, _y, num) {
    let buttonContainer = this.add.container(_x, _y);
    let _width = 385;
    let _height = 85;
    let txt = this.add.text(10, 7, num, { font: "20px Arial", fill: "#FFF", align: "center", wordWrap: { width: 370, useAdvancedWrap: true } });

    let button = this.add.graphics(0, 0).setInteractive();
    button.fillStyle(0x453A34, 1); // color, alpha
    button.fillRoundedRect(0, 0, _width, _height, 10); // x, y, width, height, radius
    button.lineStyle(5, 0x460707, 1); // lineWidth, color, alpha
    button.strokeRoundedRect(0, 0, _width, _height, 10);// x, y, width, height, radius
    buttonContainer.add([button, txt]);

    return buttonContainer;
  }

  checkAnswer(){
    console.log('Clicked');
  }

  getJsonData() {
    var This = this;
    fetch("./content/JsonContent.json")
      .then(response => response.json())
      .then(json => {
        This.question_Data = json;
        console.log(json.Questions.Question[0].Text);
        //console.log(json.Questions.Question[i].Opt[j]["_data-ans"] + " --> " + json.Questions.Question[i].Opt[j]["__text"]);
      });
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
}