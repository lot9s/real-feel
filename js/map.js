class Map {
  constructor(tag_tilemap) {
    this.clear = false;

    /* tilemap */
    this.tilemap = game.add.tilemap(tag_tilemap);

    this.tilemap.addTilesetImage('ld40-tiles', 'ld40-tiles', 21, 21, 2 ,2);
    this.tilemap.addTilesetImage('ld40-tiles-background',
                                 'ld40-tiles-background', 21, 21);

    this.tilemap.setCollision([64,103,124,132,153,163], true, 'foreground');

    /* tile layers */
    this.layers = {
      'background': this.tilemap.createLayer('background'),
      'foreground': this.tilemap.createLayer('foreground')
    }

    this.layers.background.resizeWorld();

    /* object layers */
    this.parseObjectLayer();

    /* vfx */
    this.emitter = game.add.emitter(0,0,10);
    this.emitter.makeParticles('star');
    this.emitter.setXSpeed(-50, 50);
    this.emitter.setYSpeed(-50, -200);
    this.emitter.setRotation();
  }

  cleanUp() {
    this.clear = false;
    this.goal = null;
    this.pcSpawn = null;

    /* lava */
    this.lava.destroy();

    /* monsters */
    this.monsters.forEach(function(monster, index) {
      monster.onDeath();
    });

    this.monsters = [];

    /* layers */
    this.layers['background'].destroy();
    this.layers['foreground'].destroy();
    this.layers = {};
  }

  emitStars() {
    this.emitter.at(map.goal);
    this.emitter.explode(2000, 10);
  }

  parseObjectLayer() {
    this.goal = null;

    this.pcSpawn = null;

    this.lava = game.add.group();

    this.monsters = [];

    /* parse each object layer */
    for (const layerKey in this.tilemap.objects) {
      let layer = this.tilemap.objects[layerKey];

      let self = this;
      layer.forEach(function(item, index) {
        /* generic object creation */
        let objectSprite = game.add.sprite(item.x, item.y);
        objectSprite.name = layerKey;
        objectSprite.width = item.width;
        objectSprite.height = item.height;

        /* goal object */
        if (layerKey == 'goal') {
          game.physics.enable(objectSprite, Phaser.Physics.ARCADE);
          objectSprite.body.collideWorldBounds = true;
          objectSprite.body.allowGravity = false;
          self.goal = objectSprite;
        }

        /* pc spawn point */
        if (layerKey == 'pc-spawn') {
          self.pcSpawn = objectSprite;
        }

        /* npc spawn points */
        if (layerKey == 'npc-spawn') {
          self.monsters.push(new Monster(item.x, item.y));
        }

        /* lava objects */
        if (layerKey == 'lava') {
          game.physics.enable(objectSprite, Phaser.Physics.ARCADE);
          objectSprite.body.collideWorldBounds = true;
          objectSprite.body.allowGravity = false;

          self.lava.add(objectSprite);
        }
      });
    }
  }
}
