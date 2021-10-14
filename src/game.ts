import 'reflect-metadata';
import { Container } from 'inversify';
import 'phaser';
import { ComponentInterface } from './componentInterface';
import { Scene } from './scene';
import { LoadScene } from './scene/loadScene';

/**
 * Creates and configures a Phaser game.
 *
 * TODO: Register controls.
 */
export class Game {
  private phaser: Phaser.Game;

  private scenes: Record<string, typeof Scene> = {};

  private config: Phaser.Types.Core.GameConfig;

  private serviceContainer: Container;

  private assets: Array<{
    key: string,
    path: string,
    path2: string
  }> = [];

  /**
   * Creates an instance of the game.
   *
   * @param width The width of the game in pixels. It will be scaled to fit the browser window.
   * @param height The width of the game in pixels. It will be scaled to fit the browser window.
   * @param gravity The y-axis gravity.
   * @param debug Enables physics debugging.
   * @returns A game instance.
   */
  public static create(width: number, height: number, gravity: number = 0, debug: boolean = false): Game {
    const game = new Game();

    // Create phaser game.
    game.config = {
      type: Phaser.WEBGL,
      backgroundColor: '#000000',
      width: width,
      height: height,
      pixelArt: true,
      antialias: false,
      input: {
        gamepad: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          // TODO: Make sure this is a power of two.
          tileBias: width / 20,
          gravity: {
            y: gravity
          },
          debug: debug
        },
      },
      callbacks: {
        postBoot: (game: any) => {
          game.canvas.style.width = '100%';
          game.canvas.style.height = '100%';
        }
      }
    };

    // Register load scene.
    game.scenes['_load'] = LoadScene;

    // Create service container.
    game.serviceContainer = new Container();

    return game;
  }

  /**
   * Registers a component for use in the game.
   *
   * TODO: Make sure key is unique.
   *
   * @param key A unique key to reference the component by. This is used when adding components to a scene.
   * @param component The component class.
   */
  public registerComponent(key: string, component: new (...args: unknown[]) => ComponentInterface): void {
    if (key === '' || key.charAt(0) === '_') {
      console.error(`Cannot register component "${key}" as it has no key, or a key that starts with a "_"!`);
      return;
    }
    this.registerService<ComponentInterface>(key, component);
  }

  /**
   * Registers a scene for use in the game.
   *
   * TODO: Make sure key is unique.
   *
   * @param key A unique key to reference the scene by. This is used when switching scenes.
   * @param scene The scene class.
   */
  public registerScene(key: string, scene: new (...args: unknown[]) => Scene): void {
    if (key === '' || key.charAt(0) === '_') {
      console.error(`Cannot register scene "${key}" as it has no key, or a key that starts with a "_"!`);
      return;
    }
    this.scenes[key] = scene;
  }

  /**
   * Registers an arbitrary class in the service container so it can be automatically injected into your components.
   *
   * TODO: Make sure key is unique.
   *
   * @param key A unique key to reference the service with. This is used when injecting the service.
   * @param object The class to register.
   */
  public registerService<I>(key: string, object: new (...args: unknown[]) => I): void {
    this.serviceContainer.bind<I>(key).to(object);
  }

  /**
   * Registers an asset for the game to use. This can be a PNG image, an OGG audio file, a Tiled map editor JSON file,
   * or a TexturePacker atlas. If it's a texture atlas, the path parameter is the image and the path2 parameter is the data.
   *
   * These assets will automatically be loaded when the game starts.
   *
   * TODO: Make sure key is unique.
   *
   * @param key A unique key to reference the asset.
   * @param path The path to the file.
   * @param path2 The second path, if registering a texture atlas.
   */
  public registerAsset(key: string, path: string, path2: string = ''): void {
    const extension = path.split('.').pop();
    if (!extension) {
      console.error(`Could not load asset "${key}" as the specified path has no extension: "${path}".`);
      return;
    }

    if (!['png', 'json', 'ogg'].includes(extension)) {
      console.error(`Could not load asset "${key}" as the asset is not a supported type: "png", "json", or "ogg".`);
      return;
    }

    this.assets.push({
      key,
      path,
      path2
    });
  }

  /**
   * Starts the game.
   *
   * TODO: Add error handling to prevent registering stuff after the game has started.
   */
  public start(): void {
    // Create the game.
    this.phaser = new Phaser.Game(this.config);

    // Add all scenes.
    let nextScene = '';
    for (const key in this.scenes) {
      if (key !== '_load' && nextScene === '') {
        nextScene = key;
      }
      this.phaser.scene.add(key, this.scenes[key]);
    }

    // Make sure we can access the service container.
    this.phaser.registry.set('_serviceContainer', this.serviceContainer);

    // Start the first scene.
    this.phaser.scene.start('_load', {
      assets: this.assets,
      nextScene
    });
  }
}
