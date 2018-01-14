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
