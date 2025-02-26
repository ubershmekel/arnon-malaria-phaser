// Code based on
// https://phaser.io/tutorials/coding-tips-005

var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');

var PhaserGame = function (game) {

  this.map = null;
  this.layer = null;
  this.car = null;
  this.statusText = null;

  this.safetile = 1;
  this.gridsize = 32;

  this.speed = 150;
  this.threshold = 3;
  this.turnSpeed = 150;

  this.marker = new Phaser.Point();
  this.lastMarker = new Phaser.Point();
  this.turnPoint = new Phaser.Point();

  this.directions = [null, null, null, null, null];
  this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];

  this.current = Phaser.UP;
  this.turning = Phaser.NONE;

};

PhaserGame.prototype = {

  init: function () {

    this.physics.startSystem(Phaser.Physics.ARCADE);

  },

  preload: function () {

    //  We need this because the assets are on Amazon S3
    //  Remove the next 2 lines if running locally
    // this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue005/';
    this.load.baseURL = './';
    this.load.crossOrigin = 'anonymous';

    // The walls
    this.load.tilemap('map', 'assets/maze.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tiles', 'assets/tiles.png');
    this.load.image('car', 'assets/car.png');

    //  Note: Graphics are Copyright 2015 Photon Storm Ltd.

  },

  create: function () {

    this.map = this.add.tilemap('map');
    this.map.addTilesetImage('tiles', 'tiles');

    this.layer = this.map.createLayer('Tile Layer 1');

    this.map.setCollision(20, true, this.layer);

    this.car = this.add.sprite(48, 48, 'car');
    this.car.anchor.set(0.5);

    this.physics.arcade.enable(this.car);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.statusText = this.add.text(400, 0, '', { fill: "#0f0", fontFamily: 'Arial' });

    this.move(Phaser.DOWN);

  },

  checkKeys: function () {

    if (this.cursors.left.isDown && this.current !== Phaser.LEFT) {
      this.checkDirection(Phaser.LEFT);
    }
    else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT) {
      this.checkDirection(Phaser.RIGHT);
    }
    else if (this.cursors.up.isDown && this.current !== Phaser.UP) {
      this.checkDirection(Phaser.UP);
    }
    else if (this.cursors.down.isDown && this.current !== Phaser.DOWN) {
      this.checkDirection(Phaser.DOWN);
    }
    else {
      //  This forces them to hold the key down to turn the corner
      this.turning = Phaser.NONE;
    }

  },

  checkDirection: function (turnTo) {
    console.log("Turnto", turnTo);
    if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile) {
      //  Invalid direction if they're already set to turn that way
      //  Or there is no tile there, or the tile isn't index a floor tile
      return;
    }

    //  Check if they want to turn around and can
    this.move(turnTo);
    if (this.current === this.opposites[turnTo]) {
      console.log("opposites");
      this.move(turnTo);
    }
    else {
      this.turning = turnTo;

      this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
      this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
    }

  },

  turn: function () {

    var cx = Math.floor(this.car.x);
    var cy = Math.floor(this.car.y);

    //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
      return false;
    }

    this.car.x = this.turnPoint.x;
    this.car.y = this.turnPoint.y;

    this.car.body.reset(this.turnPoint.x, this.turnPoint.y);

    this.move(this.turning);

    this.turning = Phaser.NONE;

    return true;

  },

  move: function (direction) {

    var speed = this.speed;

    if (direction === Phaser.LEFT || direction === Phaser.UP) {
      speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
      this.car.body.velocity.x = speed;
    }
    // else {
    if (direction === Phaser.UP || direction === Phaser.DOWN) {
      this.car.body.velocity.y = speed;
    }

    if (direction === Phaser.NONE) {
      this.car.body.velocity.y = 0;
      this.car.body.velocity.x = 0;
    }

    if (direction !== Phaser.NONE) {
      this.add.tween(this.car).to({ angle: this.getAngle(direction) }, this.turnSpeed, "Linear", true);
    }

    this.current = direction;

  },

  getAngle: function (to) {
    //  About-face?
    if (this.current === this.opposites[to]) {
      return "180";
    }

    if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
      (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
      (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
      (this.current === Phaser.RIGHT && to === Phaser.UP)) {
      return "-90";
    }

    return "90";

  },

  update: function () {

    this.physics.arcade.collide(this.car, this.layer);

    this.marker.x = this.math.snapToFloor(Math.floor(this.car.x), this.gridsize) / this.gridsize;
    this.marker.y = this.math.snapToFloor(Math.floor(this.car.y), this.gridsize) / this.gridsize;

    if (this.marker.x !== this.lastMarker.x || this.marker.y !== this.lastMarker.y) {
      this.move(Phaser.NONE);
      this.lastMarker.x = this.marker.x;
      this.lastMarker.y = this.marker.y;
    }

    //  Update our grid sensors
    this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
    this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
    this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
    this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);

    this.checkKeys();

    if (this.turning !== Phaser.NONE) {
      this.turn();
    }

  },

  render: function () {

    //  Un-comment this to see the debug drawing

    for (var t = 1; t < 5; t++) {
      // Color tiles around car
      if (this.directions[t] === null) {
        continue;
      }

      var color = 'rgba(0,255,0,0.3)';

      if (this.directions[t].index !== this.safetile) {
        color = 'rgba(255,0,0,0.3)';
      }

      if (t === this.current) {
        color = 'rgba(255,255,255,0.3)';
      }

      this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, 32, 32), color, true);
    }

    // Yellow turning point
    this.game.debug.geom(this.turnPoint, '#ffff00');
    this.statusText.text = "" + this.marker.x + " " + this.marker.y;

    // this.move(Phaser.NONE);
    // this.turning = Phaser.NONE;
    // this.current = Phaser.NONE;
  }

};

game.state.add('Game', PhaserGame, true);
