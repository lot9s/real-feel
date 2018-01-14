class Monster {
  constructor(spawnX, spawnY) {
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
    if (this.sprite.body.y >= game.world.height - this.sprite.body.height) {
      this.sprite.body.velocity.x = 0;
      this.sprite.body.velocity.y = 0;
      return;
    }

    /* movement */
    let xDirection = (avatar.sprite.x - this.sprite.x) < 0 ? -1 : 1;
    let yDirection = (avatar.sprite.y - this.sprite.y) < 0 ? -1 : 1;
    if (!this.ghost) {
      this.sprite.body.velocity.x = 10 * xDirection;

      if (this.sprite.body.onFloor()) {
        this.sprite.body.velocity.y = -50;
      }

    /* movement ghost */
    } else {
      if (Math.abs(avatar.sprite.x - this.sprite.x) <=
          avatar.sprite.body.width)
      {
        xDirection = 0;
      }

      if (Math.abs(avatar.sprite.y - this.sprite.y) <=
          avatar.sprite.body.height)
      {
        yDirection = 0;
      }

      this.sprite.body.velocity.x = (15 + (5 * avatar.kills)) * xDirection;
      this.sprite.body.velocity.y = (15 + (5 * avatar.kills)) * yDirection;
    }
  }
}
