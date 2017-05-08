(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(288, 505, Phaser.AUTO, 'flapbird');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":7,"./states/menu":8,"./states/play":9,"./states/preload":10}],2:[function(require,module,exports){
'use strict';

var Bird = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'bird', frame);

  // set the sprite's anchor to the center
  this.anchor.setTo(0.5, 0.5);

  // add and play animations
  this.animations.add('flap');
  this.animations.play('flap', 12, true);

  this.flapSound = this.game.add.audio('flap');

  this.alive = false;

  // enable physics on the bird
  // and disable gravity on the bird
  // until the game is started
  this.game.physics.arcade.enableBody(this);
  this.body.allowGravity = false;
};

Bird.prototype = Object.create(Phaser.Sprite.prototype);
Bird.prototype.constructor = Bird;

Bird.prototype.update = function() {
  // check to see if our angle is less than 90
  // if it is rotate the bird towards the ground by 2.5 degrees
  if(this.angle < 90 && this.alive) {
    this.angle += 2.5;
  }
};

Bird.prototype.flap = function() { 
  if(this.alive){
    this.flapSound.play();

    //cause our bird to "jump" upward
    this.body.velocity.y = -400;

    // rotate the bird to -40 degrees
    this.game.add.tween(this).to({angle: -40}, 100).start();
  }
};

module.exports = Bird;

},{}],3:[function(require,module,exports){
'use strict';

var Ground = function(game, x, y, width, height) {  
  Phaser.TileSprite.call(this, game, x, y, width, height, 'ground');

  // start scrolling our ground
  this.autoScroll(-200,0);

  // enable physics on the ground sprite
  // this is needed for collision detection
  this.game.physics.arcade.enableBody(this);

  // we don't want the ground's body
  // to be affected by gravity
  this.body.allowGravity = false;
  this.body.immovable = true;
};

Ground.prototype = Object.create(Phaser.TileSprite.prototype);
Ground.prototype.constructor = Ground;

Ground.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};

module.exports = Ground;

},{}],4:[function(require,module,exports){
'use strict';

var Pipe = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'pipe', frame);
  this.anchor.setTo(0.5, 0.5);
  this.game.physics.arcade.enableBody(this);

  this.body.allowGravity = false;
  this.body.immovable = true;
};

Pipe.prototype = Object.create(Phaser.Sprite.prototype);
Pipe.prototype.constructor = Pipe;

Pipe.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};

module.exports = Pipe;

},{}],5:[function(require,module,exports){
'use strict';

var Pipe = require('./pipe');

var PipeGroup = function(game, parent) {
  Phaser.Group.call(this, game, parent);

  this.topPipe = new Pipe(this.game, 0, 0, 0);
  this.add(this.topPipe);

  this.bottomPipe = new Pipe(this.game, 0, 440, 1);
  this.add(this.bottomPipe);

  this.hasScored = false;

  this.setAll('body.velocity.x', -200);
};

PipeGroup.prototype = Object.create(Phaser.Group.prototype);  
PipeGroup.prototype.constructor = PipeGroup;

PipeGroup.prototype.reset = function(x, y) {
  this.topPipe.reset(0,0); 

  this.bottomPipe.reset(0,440);

  this.x = x; 
  this.y = y;

  this.setAll('body.velocity.x', -200);

  this.hasScored = false;

  this.exists = true;
};

PipeGroup.prototype.checkWorldBounds = function() {  
  if(!this.topPipe.inWorld) {
    this.exists = false;
  }
};

PipeGroup.prototype.update = function() {  
  this.checkWorldBounds(); 
};

module.exports = PipeGroup;
},{"./pipe":4}],6:[function(require,module,exports){
'use strict';

var Scoreboard = function(game) {

  var gameover;

  Phaser.Group.call(this, game);
  gameover = this.create(this.game.width / 2, 100, 'gameover');
  gameover.anchor.setTo(0.5, 0.5);

  this.scoreboard = this.create(this.game.width / 2, 200, 'scoreboard');
  this.scoreboard.anchor.setTo(0.5, 0.5);

  this.scoreText = this.game.add.bitmapText(this.scoreboard.width, 180, 'flappyfont', '', 18);
  this.add(this.scoreText);

  this.bestScoreText = this.game.add.bitmapText(this.scoreboard.width, 230, 'flappyfont', '', 18);
  this.add(this.bestScoreText);

  // add our start button with a callback
  this.startButton = this.game.add.button(this.game.width/2, 300, 'startButton', this.startClick, this);
  this.startButton.anchor.setTo(0.5,0.5);

  this.add(this.startButton);

  this.y = this.game.height;
  this.x = 0;
};

Scoreboard.prototype = Object.create(Phaser.Group.prototype);  
Scoreboard.prototype.constructor = Scoreboard;

Scoreboard.prototype.show = function(score) {  
  var medal, bestScore;

  this.scoreText.setText(score.toString());

  if(!!localStorage) {
    bestScore = localStorage.getItem('bestScore');

    if(!bestScore || bestScore < score) {
      bestScore = score;
      localStorage.setItem('bestScore', bestScore);
    }
  } else {
    // Fallback. LocalStorage isn't available
    bestScore = 'N/A';
  }

  this.bestScoreText.setText(bestScore.toString());

  if(score >= 10 && score < 20)
  {
    medal = this.game.add.sprite(-65 , 7, 'medals', 1);
    medal.anchor.setTo(0.5, 0.5);
    this.scoreboard.addChild(medal);
  } else if(score >= 20) {
    medal = this.game.add.sprite(-65 , 7, 'medals', 0);
    medal.anchor.setTo(0.5, 0.5);
    this.scoreboard.addChild(medal);
  }

  if (medal) {    
    var emitter = this.game.add.emitter(medal.x, medal.y, 400);
    this.scoreboard.addChild(emitter);
    emitter.width = medal.width;
    emitter.height = medal.height;

    emitter.makeParticles('particle');

    emitter.setRotation(-100, 100);
    emitter.setXSpeed(0,0);
    emitter.setYSpeed(0,0);
    emitter.minParticleScale = 0.25;
    emitter.maxParticleScale = 0.5;
    emitter.setAll('body.allowGravity', false);

    emitter.start(false, 1000, 1000);
  }
  this.game.add.tween(this).to({y: 0}, 1000, Phaser.Easing.Bounce.Out, true);
};

Scoreboard.prototype.startClick = function() {  
  this.game.state.start('play');
};

module.exports = Scoreboard;
},{}],7:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],8:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {
    
  },
  create: function() {
    // add the background sprite
    this.background = this.game.add.sprite(0, 0, 'background');

    // add the ground sprite as a tile
    // and start scrolling in the negative x direction
    this.ground = this.game.add.tileSprite(0, 400, 335, 112, 'ground');
    this.ground.autoScroll(-200, 0);

    // create a group to put the title assets in 
    // so they can be manipulated as a whole
    this.titleGroup = this.game.add.group();

    // create the title sprite
    // and add it to the group
    this.title = this.game.add.sprite(0,0,'title');
    this.titleGroup.add(this.title);

    // create the bird sprite 
    // and add it to the title group
    this.bird = this.game.add.sprite(200,5,'bird');
    this.titleGroup.add(this.bird);

    // add an animation to the bird
    // and begin the animation
    this.bird.animations.add('flap');
    this.bird.animations.play('flap', 12, true);

    // Set the originating location of the group
    this.titleGroup.x = 30;
    this.titleGroup.y = 100;

    // create an oscillating animation tween for the group
    this.game.add.tween(this.titleGroup).to({y:115}, 350, Phaser.Easing.Linear.NONE, true, 0, 1000, true);

    // add our start button with a callback
    this.startButton = this.game.add.button(this.game.width/2, 300, 'startButton', this.startClick, this);
    this.startButton.anchor.setTo(0.5,0.5);
  },

  startClick: function() {  
    // start button click handler
    // start the 'play' state
    this.game.state.start('play');
  },

  update: function() {
    
  }
};

module.exports = Menu;

},{}],9:[function(require,module,exports){

  'use strict';
  var Bird = require('../prefabs/bird');
  var Ground = require('../prefabs/ground');
  var PipeGroup = require('../prefabs/pipeGroup');
  var Scoreboard = require('../prefabs/scoreboard');

  function Play() {}
  Play.prototype = {
    create: function() {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.game.physics.arcade.gravity.y = 1200;

      this.background = this.game.add.sprite(0,0,'background');

      // Create a new bird object
      this.bird = new Bird(this.game, 100, this.game.height/2);
      // and add it to the game
      this.game.add.existing(this.bird);

      // create and add a group to hold our pipeGroup prefabs
      this.pipes = this.game.add.group();

      // create and add a new Ground object
      this.ground = new Ground(this.game, 0, 400, 335, 112);
      this.game.add.existing(this.ground);

      // add keyboard controls
      this.flapKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.flapKey.onDown.addOnce(this.startGame, this);
      this.flapKey.onDown.add(this.bird.flap, this.bird);

      // add mouse/touch controls
      this.game.input.onDown.addOnce(this.startGame, this);
      this.game.input.onDown.add(this.bird.flap, this.bird);

      // keep the spacebar from propogating up to the browser     
      this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

      // add instructions
      this.instructionGroup = this.game.add.group();
      this.instructionGroup.add(this.game.add.sprite(this.game.width/2, 100,'getReady'));
      this.instructionGroup.add(this.game.add.sprite(this.game.width/2, 325,'instructions'));
      this.instructionGroup.setAll('anchor.x', 0.5);
      this.instructionGroup.setAll('anchor.y', 0.5);

      // score
      this.score = 0;
      this.scoreText = this.game.add.bitmapText(this.game.width/2, 10, 'flappyfont',this.score.toString(), 24);
      this.scoreText.visible = false;
      this.scoreSound = this.game.add.audio('score');

      this.groundHitSound = this.game.add.audio('groundHit');
      this.pipeHitSound = this.game.add.audio('pipeHit');
    },

    update: function() {
      // enable collisions between the bird and the ground
      this.game.physics.arcade.collide(this.bird, this.ground, this.deathHandler, null, this, 1);

      // enable collisions between the bird and each group in the pipes group
      this.pipes.forEach(function(pipeGroup) {
        this.checkScore(pipeGroup);
        this.game.physics.arcade.collide(this.bird, pipeGroup, this.deathHandler, null, this);
      }, this);
    },

    deathHandler: function(obj1, obj2) { 
      if(!this.scoreboard){
        if(obj2 instanceof Ground){
          this.groundHitSound.play();
        }
        else{
          this.pipeHitSound.play();
        }

        this.bird.alive = false;
        this.pipes.callAll('stop');
        this.pipeGenerator.timer.stop();
        this.ground.stopScroll();
        this.scoreboard = new Scoreboard(this.game);
        this.game.add.existing(this.scoreboard);
        this.scoreboard.show(this.score);  
      }
    },

    generatePipes: function() {
      var pipeY = this.game.rnd.integerInRange(-100, 100);
      var pipeGroup = this.pipes.getFirstExists(false);
      if(!pipeGroup) {
          pipeGroup = new PipeGroup(this.game, this.pipes);  
      }
      pipeGroup.reset(this.game.width, pipeY);
    },

    checkScore: function(pipeGroup) {  
      if(pipeGroup.exists && !pipeGroup.hasScored && pipeGroup.topPipe.world.x <= this.bird.world.x) {
        pipeGroup.hasScored = true;
        this.score++;
        this.scoreText.setText(this.score.toString());
        this.scoreSound.play();
      }
    },

    startGame: function() { 
      this.bird.body.allowGravity = true;
      this.bird.alive = true;

      // add a timer
      this.pipeGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.25, this.generatePipes, this);
      this.pipeGenerator.timer.start();

      this.scoreText.visible = true;
      this.scoreboard = null;
      this.instructionGroup.destroy();
    },

    shutdown: function() {  
      this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
      this.bird.destroy();
      this.pipes.destroy();
      if(this.scoreboard){
        this.scoreboard.destroy();      
      }
    }
  };
  
  module.exports = Play;
},{"../prefabs/bird":2,"../prefabs/ground":3,"../prefabs/pipeGroup":5,"../prefabs/scoreboard":6}],10:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.asset = this.add.sprite(this.width/2, this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(this.asset);

    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('title', 'assets/title.png');
    this.load.image('startButton', 'assets/start-button.png');
    this.load.image('instructions', 'assets/instructions.png');  
    this.load.image('getReady', 'assets/get-ready.png');
    this.load.image('scoreboard', 'assets/scoreboard.png');
    this.load.image('gameover', 'assets/gameover.png');
    this.load.spritesheet('medals', 'assets/medals.png', 44, 46, 2);
    this.load.image('particle', 'assets/particle.png');

    this.load.spritesheet('bird', 'assets/bird.png', 34, 24, 3);
    this.load.spritesheet('pipe', 'assets/pipes.png', 54,320,2);

    this.load.bitmapFont('flappyfont', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');

    this.load.audio('score', 'assets/score.wav');
    this.load.audio('flap', 'assets/flap.wav');
    this.load.audio('pipeHit', 'assets/pipe-hit.wav');
    this.load.audio('groundHit', 'assets/ground-hit.wav');

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.setScreenSize();
    this.game.scale.refresh();
  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[1])