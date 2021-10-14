import { Container } from 'inversify';
import { Scene } from '../scene';

type Asset = {
  key: string,
  path: string,
  path2: string
}

export class LoadScene extends Scene {
  private assets: Array<Asset>;

  private nextScene: string;

  constructor () {
    super('_load');
  }

  init (data: { assets: Array<Asset>, nextScene: string }): void {
    this.assets = data.assets;
    this.nextScene = data.nextScene;
  }

  preload (): void {
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
        this.load.image(asset.key, asset.path)
      } else if (extension === 'ogg') {
        this.load.audio(asset.key, asset.path);
      } else if (extension === 'json') {
        this.load.tilemapTiledJSON(asset.key, asset.path);
      }
    }

    // Basic graphics and loading bar.
    const graphics = this.add.graphics();

    // Progress bar.
    this.load.on('progress', (percent: number) => {
      const x = 0;
      const y = 0;
      const height = 180;
      const width = 320 * percent;
      graphics.fillRect(x, y, width, height);
    });

    // Go to next scene when loading is done.
    this.load.on('complete', () => {
      // Start next scene.
      if (this.nextScene) {
        this.changeScene(this.nextScene);
      }
    });
  }
}
