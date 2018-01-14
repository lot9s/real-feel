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
  /* avatar */
  game.physics.arcade.collide(avatar.sprite, map.layers['foreground']);

  /* monsters */
  map.monsters.forEach(function(monster, indexM) {
    game.physics.arcade.collide(monster.sprite, map.layers['foreground']);
  });
}

function handleCollisionsLava() {
  /* avatar */
  game.physics.arcade.collide(map.lava, avatar.sprite, () => {
    if (!state.restartLevel) {
      playerDeath();
    }
  });

  /* monsters */
  map.monsters.forEach( (monster, index) => {
    game.physics.arcade.collide(map.lava, monster.sprite, () => {
      monster.onDeath();
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
  game.load.pack('realfeel', 'res/pack.json');
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
  avatar.update();

  /* non-player update */
  map.monsters.forEach(function(monster, indexM) {
    monster.update();
  });
}

function render() {
  //game.debug.body(avatar.sprite);
  //game.debug.bodyInfo(avatar.sprite, 21, 63);
}
