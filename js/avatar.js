/* player avatar */
class Avatar {
  constructor() {
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
    this.sprite.body.setSize(9,21,6,0);
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

  update() {
    let arrowKeysDown = game.cursorKeys.left.isDown ||
                        game.cursorKeys.right.isDown;

    /* ground */
    if (this.sprite.body.onFloor()) {
      /* left walk */
      if (game.cursorKeys.left.isDown) {
        this.sprite.body.velocity.x = -50 + (-5 * this.kills);
        this.sprite.animations.play('walk', 5);
      }

      /* right walk */
      if (game.cursorKeys.right.isDown) {
        this.sprite.body.velocity.x = 50 + (5 * this.kills);
        this.sprite.animations.play('walk', 5);
      }

      /* jump */
      if (game.cursorKeys.up.isDown) {
        this.sprite.body.velocity.y = -50 + (-5 * this.kills);
        game.sfxJump.play();
      }

      /* idle */
      if (!arrowKeysDown) {
        this.sprite.body.velocity.x = 0;
        this.sprite.animations.play('idle');
      }

    /* air */
    } else {
      if (game.cursorKeys.left.isDown) {
        this.sprite.body.velocity.x = -50 + (-5 * this.kills);
      }

      if (game.cursorKeys.right.isDown) {
        this.sprite.body.velocity.x = 50 + (5 * this.kills);
      }
    }
  }
}

/* player slash atack */
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

