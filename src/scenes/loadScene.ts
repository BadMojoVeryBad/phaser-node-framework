import { Scene } from '../scene';

type Asset = {
  key: string,
  path: string,
  path2: string
};

type Animation = {
  texture: string,
  frame: string,
  start: number,
  end: number,
  repeat: boolean,
  fps: number
};

export class LoadScene extends Scene {
  private assets: Array<Asset>;

  private animations: Array<Animation>;

  private nextScene: string;

  private loadingColor: number;

  constructor() {
    super('_load');
  }

  init(data: { assets: Array<Asset>, animations: Array<Animation>, nextScene: string, loadingColor: number }): void {
    this.assets = data.assets;
    this.animations = data.animations;
    this.nextScene = data.nextScene;
    this.loadingColor = data.loadingColor;
  }

  preload(): void {
    // Load assets based on type.
    for (const asset of this.assets) {
      const extension = asset.path.split('.').pop();
      if (asset.path2) {
        this.load.atlas({
          key: asset.key,
          textureURL: asset.path,
          atlasURL: asset.path2
        });
      } else if (extension === 'png') {
        this.load.image(asset.key, asset.path);
      } else if (extension === 'ogg') {
        this.load.audio(asset.key, asset.path);
      } else if (extension === 'json') {
        this.load.tilemapTiledJSON(asset.key, asset.path);
      }
    }

    // Basic graphics and loading bar.
    const graphics = this.add.graphics();
    graphics.fillStyle(this.loadingColor);

    // Progress bar.
    const gameWidth = this.game.canvas.width;
    const gameHeight = this.game.canvas.height;
    const loaderWidth = gameWidth / 2;
    const loaderHeight = gameHeight / 16;
    const loaderX = gameWidth / 4;
    const loaderY = (gameHeight / 2) - (loaderHeight / 2);
    graphics.fillRect(loaderX + loaderWidth, loaderY, gameHeight / 32, loaderHeight);
    graphics.fillRect(loaderX - gameHeight / 32, loaderY, gameHeight / 32, loaderHeight);
    graphics.fillRect(loaderX, loaderY - gameHeight / 32, loaderWidth, gameHeight / 32);
    graphics.fillRect(loaderX, loaderY + loaderHeight, loaderWidth, gameHeight / 32);
    this.load.on('progress', (percent: number) => {
      graphics.fillRect(loaderX, loaderY, loaderWidth * percent, loaderHeight);
    });

    // Go to next scene when loading is done.
    this.load.on('complete', () => {
      // Start next scene.
      if (this.nextScene) {
        this.changeScene(this.nextScene);
      }
    });
  }

  public create(): void {
    for (const animation of this.animations) {
      const key = animation.frame ? animation.frame : animation.texture;
      this.anims.create({
        key: key,
        frames: this.anims.generateFrameNames(animation.texture, { prefix: key, start: animation.start, end: animation.end, zeroPad: 0 }),
        frameRate: animation.fps,
        repeat: animation.repeat ? -1 : 0,
      });
    }
  }
}
