/* --- variables --- */
let avatar = null;
let slash = null;

let map = null;
let hud = null;

let state = {
  end: false,
  restartLevel: false,
};


/* --- game  --- */
/*game = new Phaser.Game(672, 378, Phaser.AUTO, null, {*/
game = new Phaser.Game(378, 378, Phaser.AUTO, 'game', {
  preload: preload,
  create: create,
  update: update,
  render: render
});


/* --- classes --- */
class Avatar {
  constructor() {
    this.bootsOnGround = false;
    this.bootsInWater = false;

    this.kills = 0;

    /* sprite */
    this.sprite = game.add.sprite(map.pcSpawn.x, map.pcSpawn.y, 
                                  'master-sheet', 110);

    /* animations */
    this.sprite.animations.add('idle', [110]);
    this.sprite.animations.add('walk', [110,111]);

    /* physics */
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.collideWorldBounds = true;

    /* vfx */
    this.textTerror = game.add.text(0, -12, "TERROR UP!");
    this.textTerror.fontSize = 12;
    this.textTerror.addColor('#ff7700', 0);

    /* camera */
    game.camera.follow(this.sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
  }

  onKill() {
    /* show terror up text */
    this.textTerror.reset(this.sprite.x - 25, this.sprite.y - 5);

    let terrorTween = game.add.tween(this.textTerror);

    terrorTween.onComplete.add(function() {
      this.textTerror.reset(0, -12);
    }, this);

    terrorTween.to({y: this.sprite.y - 18.5}, 500, "Linear", true);
  }

  onRestartLevel() {
    this.sprite.alpha = 1;
    this.sprite.bringToTop();
    this.sprite.reset(map.pcSpawn.x, map.pcSpawn.y);
    this.textTerror.bringToTop();
  }

  onStartNextLevel() {
    this.sprite.bringToTop();
    this.sprite.reset(map.pcSpawn.x, map.pcSpawn.y);

    this.textTerror.bringToTop();
  }
}

class Monster {
  constructor(spawnX, spawnY) {
    this.bootsOnGround = false;
    this.ghost = false;

    /* sprite */
    this.sprite = game.add.sprite(spawnX, spawnY, 'master-sheet', 171);

    /* animation */
    this.sprite.animations.add('ghost', [445]);

    /* physics */
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.collideWorldBounds = true;
  }

  onDeath() {
    this.sprite.alpha = 0;
    this.sprite.allowGravity = false;
    this.sprite.body.velocity.x = 0;
    this.sprite.reset(0, -21);
  }

  onKilled() {
    /* update state */
    this.ghost = true;

    /* update physics */
    this.sprite.y -= 42;
    this.sprite.body.allowGravity = false;

    /* sfx */
    game.sfxDeath3.play();

    /* vfx */
    this.sprite.animations.play('ghost');

    /* tween */
    let ghostTween = game.add.tween(this.sprite);
    ghostTween.to({y: this.sprite.y - 100}, 1000, "Linear", true);
  }

  update() {
    /* restarting level */
    if (map.clear || state.restartLevel) {
      this.sprite.body.velocity.x = 0;
      this.sprite.body.velocity.y = 0;
      return;
    }

    /* idle */
    if (this.sprite.body.blocked.down) {
      this.sprite.body.velocity.x = 0;
      this.sprite.body.velocity.y = 0;
      return;
    }

    /* movement */
    let xDirection = (avatar.sprite.x - this.sprite.x) < 0 ? -1 : 1;
    let yDirection = (avatar.sprite.y - this.sprite.y) < 0 ? -1 : 1;
    if (!this.ghost) {
      this.sprite.body.velocity.x = 10 * xDirection;

      if (this.bootsOnGround) {
        this.sprite.body.velocity.y = -50;
      }

    /* movement ghost */
    } else {
      if (Math.abs(avatar.sprite.x - this.sprite.x) <= 21) { xDirection = 0; }
      if (Math.abs(avatar.sprite.y - this.sprite.y) <= 21) { yDirection = 0; }

      this.sprite.body.velocity.x = (15 + (5 * avatar.kills)) * xDirection;
      this.sprite.body.velocity.y = (15 + (5 * avatar.kills)) * yDirection;
    }
  }
}

class Slash {
  constructor() {
    /* sprite */
    this.sprite = game.add.sprite(-32, -32, 'slash', 0);

    /* animations */
    this.sprite.animations.add('attack', [0,1,2,3]);

    /* physics */
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.allowGravity = false;

    game.spaceKey.onDown.add(this.onSpaceKey, this);
  }

  onRestartLevel() {
    slash.sprite.bringToTop();
  }

  onSpaceKey() {
    if (!state.restartLevel) {
      /* play sfx */
      game.sfxSlash.play();

      if (avatar.kills > 0) { game.sfxScream1.play(); }
      if (avatar.kills > 1) { game.sfxScream2.play(); }

      /* move slash sprite in front of player character */
      this.sprite.x = avatar.sprite.x + (avatar.sprite.width / 2);
      this.sprite.y = avatar.sprite.y - (avatar.sprite.width / 2);

      /* apply velocity to sprite */
      if (avatar.kills > 1) {
        this.sprite.body.velocity.x = 500;
      }

      /* play animation */
      this.sprite.animations.play('attack', 30);

      /* hide slash sprite at end of animation */
      this.sprite.animations.currentAnim.onComplete.add(function() {
        this.sprite.x = -32;
        this.sprite.y = -32;
        this.sprite.body.velocity.x = 0;
      }, this);
    }
  }
}

class HUD {
  constructor() {
    /* sprites */
    this.spriteHeart = game.add.sprite(21, 21, 'master-sheet', 373);
    this.spriteHeart.fixedToCamera = true;

    this.spriteX = game.add.sprite(47, 21, 'master-sheet', 467);
    this.spriteX.fixedToCamera = true;

    this.spriteTens = game.add.sprite(68, 21, 'master-sheet', 434);
    this.spriteTens.animations.add('0', [434]);
    this.spriteTens.animations.add('1', [435]);
    this.spriteTens.animations.add('2', [436]);
    this.spriteTens.animations.add('3', [437]);
    this.spriteTens.animations.add('4', [438]);
    this.spriteTens.animations.add('5', [439]);
    this.spriteTens.animations.add('6', [463]);
    this.spriteTens.animations.add('7', [464]);
    this.spriteTens.animations.add('8', [465]);
    this.spriteTens.animations.add('9', [466]);
    this.spriteTens.fixedToCamera = true;

    this.spriteDigits = game.add.sprite(89, 21, 'master-sheet', 434);
    this.spriteDigits.animations.add('0', [434]);
    this.spriteDigits.animations.add('1', [435]);
    this.spriteDigits.animations.add('2', [436]);
    this.spriteDigits.animations.add('3', [437]);
    this.spriteDigits.animations.add('4', [438]);
    this.spriteDigits.animations.add('5', [439]);
    this.spriteDigits.animations.add('6', [463]);
    this.spriteDigits.animations.add('7', [464]);
    this.spriteDigits.animations.add('8', [465]);
    this.spriteDigits.animations.add('9', [466]);
    this.spriteDigits.fixedToCamera = true;
  }

  onKill() {
    this.spriteTens.animations.play( String(avatar.kills / 10) );
    this.spriteDigits.animations.play( String(avatar.kills % 10) );
  }

  onRestartLevel() {
    this.spriteHeart.bringToTop();
    this.spriteX.bringToTop();

    this.spriteTens.bringToTop();
    this.spriteDigits.bringToTop();
  }
}

class Map {
  constructor(tag_tilemap) {
    this.clear = false;

    /* tilemap */
    this.tilemap = game.add.tilemap(tag_tilemap);
    this.tilemap.addTilesetImage('ld40-tiles', 'ld40-tiles', 21, 21, 2 ,2);
    this.tilemap.addTilesetImage('ld40-tiles-background',
                                 'ld40-tiles-background', 21, 21);

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
    
    this.ground = [];
    this.lava = [];
    
    this.monsters.forEach(function(monster, index) {
      monster.onDeath();
    });

    this.monsters = [];

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

    this.ground = [];
    this.lava = [];

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

        /* ground objects */
        if (layerKey == 'ground') {
          game.physics.enable(objectSprite, Phaser.Physics.ARCADE);
          objectSprite.body.collideWorldBounds = true;
          objectSprite.body.allowGravity = false;

          self.ground.push(objectSprite);
        }

        /* lava objects */
        if (layerKey == 'lava') {
          game.physics.enable(objectSprite, Phaser.Physics.ARCADE);
          objectSprite.body.collideWorldBounds = true;
          objectSprite.body.allowGravity = false;

          self.lava.push(objectSprite);
        }
      });
    }
  }
}


/* --- functions --- */
function handleCollisionsGoal() {
  let clear = game.physics.arcade.overlap(avatar.sprite, map.goal);

  /* start next level */
  if (clear && !map.clear) {
    /* sfx */
    game.sfxWin.play();

    /* vfx */
    map.emitStars();

    /* set flag */
    map.clear = true;

    startNextLevel();
  }
}

function handleCollisionsGround() {
  /* reset flags */
  avatar.bootsOnGround = false;
  map.monsters.forEach(function(monster, indexM) {
    monster.bootsOnGround = false;
  });

  /* do computation */
  map.ground.forEach(function(groundObj, indexG) {
    avatar.bootsOnGround = avatar.bootsOnGround ||
                           game.physics.arcade.collide(avatar.sprite,groundObj);

    /* monsters */
    map.monsters.forEach(function(monster, indexM) {
      monster.bootsOnGround = monster.bootsOnGround ||
                              game.physics.arcade.collide(monster.sprite,
                                                          groundObj);
    });
  });
}

function handleCollisionsLava() {
  /* do computation */
  map.lava.forEach(function(lavaObj, indexG) {
    if (!state.restartLevel && 
        game.physics.arcade.collide(avatar.sprite, lavaObj))
    {
      playerDeath();
    }

    map.monsters.forEach(function(monster, indexM) {
      if (game.physics.arcade.collide(monster.sprite, lavaObj)) {
        monster.onDeath();
      }
    });
  });
}

function handleCollisionsMonsters() {
  map.monsters.forEach(function(monsterM, indexM) {
    /* player */
    let monsterTouch =
      game.physics.arcade.collide(avatar.sprite, monsterM.sprite);
    if (!state.restartLevel && monsterM.ghost && monsterTouch) {
      playerDeath("ghost");
    }

    /* kill detection */
    if (game.physics.arcade.overlap(slash.sprite, monsterM.sprite)) {
      if (!monsterM.ghost) {
        monsterM.onKilled();

        avatar.onKill();
        avatar.kills += 1;

        hud.onKill();
      }
    }

    /* monster detection */
    map.monsters.forEach(function(monsterN, indexN) {
      game.physics.arcade.collide(monsterM.sprite, monsterN.sprite);
    });
  });
}

function handleCollisionsWorld() {
  if (!state.end && !state.restartLevel && avatar.sprite.body.blocked.down) {
    playerDeath();
  }
}

function handleInput() {
  let arrowKeysDown = game.cursorKeys.left.isDown ||
                      game.cursorKeys.right.isDown;

  /* ground */
  if (avatar.bootsOnGround) {
    /* left walk */
    if (game.cursorKeys.left.isDown) {
      avatar.sprite.body.velocity.x = -50 + (-5 * avatar.kills);
      avatar.sprite.animations.play('walk', 5);
    }

    /* right walk */
    if (game.cursorKeys.right.isDown) {
      avatar.sprite.body.velocity.x = 50 + (5 * avatar.kills);
      avatar.sprite.animations.play('walk', 5);
    }

    /* jump */
    if (game.cursorKeys.up.isDown) {
      avatar.sprite.body.velocity.y = -50 + (-5 * avatar.kills);
      game.sfxJump.play();
    }

    /* idle */
    if (!arrowKeysDown) {
      avatar.sprite.body.velocity.x = 0;
      avatar.sprite.animations.play('idle');
    }

  /* air */
  } else {
    if (game.cursorKeys.left.isDown) {
      avatar.sprite.body.velocity.x = -50 + (-5 * avatar.kills);
    }

    if (game.cursorKeys.right.isDown) {
      avatar.sprite.body.velocity.x = 50 + (5 * avatar.kills);
    }
  }
}

function playerDeath(type) {
  /* update state */
  state.restartLevel = true;

  /* player death */
  avatar.sprite.alpha = 0;
  if (type == "ghost") { game.sfxDeath4.play(); }
  else                 { game.sfxDeath1.play(); }

  restartLevel();
}

function restartLevel() {
  let timer = game.time.create(false);

  /* delay the creation of the next level by 3 sec. */
  timer.add(3000, function() {
    map.cleanUp();

    if (game.level < game.levelProgression.length) {
      /* display new map */
      map = new Map(game.levelProgression[game.level]);

      /* reset some game objects */
      hud.onRestartLevel();

      avatar.onRestartLevel();
      slash.onRestartLevel();

      /* update state */
      state.restartLevel = false;
    }
  });

  timer.start();
}

function startNextLevel() {
  let timer = game.time.create(false);

  /* delay the creation of the next level by 3 sec. */
  timer.add(3000, function() {
    map.cleanUp();
    game.level += 1;

    /* middle of game */
    if (game.level < game.levelProgression.length) {
      /* display new map */
      map = new Map(game.levelProgression[game.level]);

      /* reset some game objects */
      hud.onRestartLevel();
      avatar.onStartNextLevel();
      slash.onRestartLevel();

    /* end of game */
    } else {
      /* update state */
      state.end = true;

      /* display new map */
      map = new Map('end');

      /* reset some game objects */
      hud.onRestartLevel();
      avatar.onStartNextLevel();
      slash.onRestartLevel();
    }
  });

  timer.start();
}


/* --- life cycle functions --- */
function preload() {
  /* tilemaps */
  game.load.tilemap('level0', 'res/map/level0.json', null,
                    Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('level1', 'res/map/level1.json', null,
                    Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('level2', 'res/map/level2.json', null,
                    Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('level3', 'res/map/level3.json', null,
                    Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('end', 'res/map/end.json', null,
                    Phaser.Tilemap.TILED_JSON);

  /* tiles */
  game.load.image('ld40-tiles', 'res/img/tiles.png');
  game.load.image('ld40-tiles-background', 'res/img/tiles-background.png');

  /* sprite sheets */
  game.load.spritesheet('master-sheet', 'res/img/tiles.png', 21,21,900,2,2);
  game.load.spritesheet('slash', 'res/img/animation-slash.png', 32,32,4);

  /* particles */
  game.load.image('star', 'res/img/particle-star.png');

  /* audio */
  game.load.audio('bgm', 'res/bgm/bgm.mp3');
  game.load.audio('death1', 'res/sfx/death1.wav');
  game.load.audio('death2', 'res/sfx/death2.ogg');
  game.load.audio('death3', 'res/sfx/death3.mp3');
  game.load.audio('death4', 'res/sfx/death4.wav');
  game.load.audio('jump', 'res/sfx/jump.mp3');
  game.load.audio('scream1', 'res/sfx/scream1.ogg');
  game.load.audio('scream2', 'res/sfx/scream2.wav');
  game.load.audio('slash', 'res/sfx/slash.wav');
  game.load.audio('win', 'res/sfx/win.wav');
}

function create() {
  game.level = 0;
  game.levelProgression = ['level0', 'level1', 'level2', 'level3'];

  /* cursors declaration */
  game.cursorKeys = game.input.keyboard.createCursorKeys();
  game.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  /* physics declaration */
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.gravity.y = 105;

  /* map */
  map = new Map('level0');

  /* ui */
  hud = new HUD();

  /* sprites */
  avatar = new Avatar();
  slash = new Slash();

  /* sfx */
  game.sfxDeath1 = game.add.audio('death1');
  game.sfxDeath2 = game.add.audio('death2');
  game.sfxDeath3 = game.add.audio('death3');
  game.sfxDeath4 = game.add.audio('death4');
  game.sfxJump = game.add.audio('jump');
  game.sfxScream1 = game.add.audio('scream1');
  game.sfxScream2 = game.add.audio('scream2');
  game.sfxSlash = game.add.audio('slash');
  game.sfxWin = game.add.audio('win');

  /* bgm */
  bgmGame = game.add.audio('bgm');
  bgmGame.loop = true;
  bgmGame.play();
}

function update() {
  handleCollisionsWorld();

  /* collisions */
  handleCollisionsGround();
  handleCollisionsLava();

  handleCollisionsMonsters();
  handleCollisionsGoal();

  /* player update */
  handleInput();

  /* non-player update */
  map.monsters.forEach(function(monster, indexM) {
    monster.update();
  });
}

function render() {
  //game.debug.body(avatar.sprite);
}
