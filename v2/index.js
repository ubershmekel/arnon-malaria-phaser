// Code based off of: https://phaser.io/examples/v2/tilemaps/csv-map-collide

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.baseURL = './';
    game.load.tilemap('map', 'assets/catastrophi_level2.csv', null, Phaser.Tilemap.CSV);
    game.load.image('tiles', 'assets/catastrophi_tiles_16.png');
    game.load.spritesheet('player', 'assets/spaceman.png', 16, 16);

}

var map;
var layer;
var cursors;
var player;
var helpText;
var moneyLeft;

function create() {

    //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
    map = game.add.tilemap('map', 16, 16);

    //  Now add in the tileset
    map.addTilesetImage('tiles');
    
    //  Create our layer
    layer = map.createLayer(0);

    //  Resize the world
    layer.resizeWorld();

    //  This isn't totally accurate, but it'll do for now
    map.setCollisionBetween(54, 83);

    //  Un-comment this on to see the collision tiles
    // layer.debug = true;

    //  Player
    player = game.add.sprite(48, 48, 'player', 1);
    player.animations.add('left', [8,9], 10, true);
    player.animations.add('right', [1,2], 10, true);
    player.animations.add('up', [11,12,13], 10, true);
    player.animations.add('down', [4,5,6], 10, true);

    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.setSize(10, 14, 2, 1);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();

    helpText = game.add.text(16, 16, 'Look for puddles', { font: '24px Arial', fill: '#ffffff' });
    helpText.fixedToCamera = true;
    moneyLeft = 1000;

}

function update() {

    game.physics.arcade.collide(player, layer);

    player.body.velocity.set(0);

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -100;
        player.play('left');
    }
    if (cursors.right.isDown)
    {
        player.body.velocity.x = 100;
        player.play('right');
    }
    if (cursors.up.isDown)
    {
        player.body.velocity.y = -100;
        player.play('up');
    }
    if (cursors.down.isDown)
    {
        player.body.velocity.y = 100;
        player.play('down');
    }
    if (player.body.velocity.x === 0 && player.body.velocity.y === 0)
    {
        player.animations.stop();
    } else {
      moneyLeft = moneyLeft - 1;
    }

    helpText.text = "Money left: " + moneyLeft;
}

function render() {

    // game.debug.body(player);

}