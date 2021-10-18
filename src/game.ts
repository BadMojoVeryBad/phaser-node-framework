import 'reflect-metadata';
import { Container } from 'inversify';
import 'phaser';
import { ComponentInterface } from './componentInterface';
import { Scene } from './scene';
import { LoadScene } from './scenes/loadScene';
import { InputScene } from './scenes/inputScene';
import { RegisterControls } from './controls/RegisterControls';
import { RegisterControlsInterface } from './controls/RegisterControlsInterface';
import { ControlsInterface } from './controls/ControlsInterface';
import { Controls } from './controls/Controls';

/**
 * Creates and configures a Phaser game.
 */
export class Game {
  private phaser: Phaser.Game;

  private scenes: Record<string, typeof Scene> = {};

  private inputs: Record<string, string[]> = {};

  private config: Phaser.Types.Core.GameConfig;

  private serviceContainer: Container;

  private keys: string[] = [];

  private isStarted = false;

  private static options = {
    debug: false,
    gravity: 0,
    backgroundColor: 0x000000,
    loadingColor: 0xffffff
  };

  private options = {
    debug: false,
    gravity: 0,
    backgroundColor: 0x000000,
    loadingColor: 0xffffff
  };

  private assets: Array<{
    key: string,
    path: string,
    path2: string
  }> = [];

  private animations: Array<{
    texture: string,
    frame: string,
    start: number,
    end: number,
    repeat: boolean,
    fps: number
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
  public static create(width: number, height: number, options?: {
    debug?: boolean,
    gravity?: number,
    backgroundColor?: number,
    loadingColor?: number
  }): Game {
    const game = new Game();

    let optionsMerged = Game.options;
    if (options) {
      optionsMerged = { ...optionsMerged, ...options };
    }

    // Create phaser game.
    game.config = {
      type: Phaser.WEBGL,
      backgroundColor: optionsMerged.backgroundColor,
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
          // Make sure this is a power of two.
          tileBias: Math.pow(2, Math.round(Math.log(width / 20) / Math.log(2))),
          gravity: {
            y: optionsMerged.gravity
          },
          debug: optionsMerged.debug
        },
      },
      callbacks: {
        postBoot: (game: any) => {
          game.canvas.style.width = '100%';
          game.canvas.style.height = '100%';
        }
      }
    };

    game.options = optionsMerged;

    // Register load scene.
    game.scenes['_load'] = LoadScene;

    // Create service container.
    game.serviceContainer = new Container();

    return game;
  }

  /**
   * Registers a component for use in the game.
   *
   * @param key A unique key to reference the component by. This is used when adding components to a scene.
   * @param component The component class.
   */
  public registerComponent(key: string, component: new (...args: unknown[]) => ComponentInterface): void {
    this.validateKey(key, 'component');
    this.serviceContainer.bind<ComponentInterface>(key).to(component);
  }

  /**
   * Registers a scene for use in the game.
   *
   * @param key A unique key to reference the scene by. This is used when switching scenes.
   * @param scene The scene class.
   */
  public registerScene(key: string, scene: new (...args: any[]) => Scene): void {
    this.validateKey(key, 'scene');
    this.scenes[key] = scene;
  }

  /**
   * Registers an arbitrary class in the service container so it can be automatically injected into your components.
   *
   * @param key A unique key to reference the service with. This is used when injecting the service.
   * @param object The class to register.
   */
  public registerService<I>(key: string, object: new (...args: any[]) => I, isSingleton = false): void {
    this.validateKey(key, 'service');

    if (isSingleton) {
      this.serviceContainer.bind<I>(key).to(object).inSingletonScope();
    } else {
      this.serviceContainer.bind<I>(key).to(object);
    }
  }

  /**
   * Registers an asset for the game to use. This can be a PNG image, an OGG audio file, a Tiled map editor JSON file,
   * or a TexturePacker atlas. If it's a texture atlas, the path parameter is the image and the path2 parameter is the data.
   *
   * These assets will automatically be loaded when the game starts.
   *
   * @param key A unique key to reference the asset.
   * @param path The path to the file.
   * @param path2 The second path, if registering a texture atlas.
   */
  public registerAsset(key: string, path: string, path2 = ''): void {
    this.validateKey(key, 'asset');

    const extension = path.split('.').pop();
    if (!extension) {
      throw Error(`Could not load asset "${key}" as the specified path has no extension: "${path}".`);
    }

    if (!['png', 'json', 'ogg'].includes(extension)) {
      throw Error(`Could not load asset "${key}" as the asset is not a supported type: "png", "json", or "ogg".`);
    }

    this.assets.push({
      key,
      path,
      path2
    });
  }

  /**
   * Listens for inputs on a given control.
   *
   * The control string is arbitrary, and is cimply used to reference the inputs later,
   *
   * An input string is an input type and an input code, seperated by a dot. The input
   * types can be "Keyboard" or "Gamepad". Valid keyboard input codes are JavaScript
   * keyboard code, as shown here: https://keycode.info/. Valid gamepad input codes are:
   * * A
   * * B
   * * X
   * * Y
   * * L1
   * * R1
   * * L2
   * * R2
   * * SELECT
   * * START
   * * STICK_LEFT
   * * STICK_RIGHT
   * * UP
   * * DOWN
   * * LEFT
   * * RIGHT
   * * VENDOR_1 (The 'PS Button' or 'Xbox Home' button)
   * * VENDOR_2 (The Dualshock4's touch panel thing)
   * * STICK_LEFT_UP
   * * STICK_LEFT_DOWN
   * * STICK_LEFT_LEFT
   * * STICK_LEFT_RIGHT
   * * STICK_RIGHT_UP
   * * STICK_RIGHT_DOWN
   * * STICK_RIGHT_LEFT
   * * STICK_RIGHT_RIGHT
   *
   * Valid input string examples are:
   * * "Keyboard.38" (The up arrow key)
   * * "Gamepad.R2" (The R2 button)
   *
   * @param control An arbitrary string representing a control. For example, you could
   *    name a control 'UP', and listen for inputs on the up arrow key, as well as the
   *    'w' key.
   * @param inputs The inputs to listen for on this control.
   */
  public registerControl(control: string, ...inputs: string[]): void {
    this.inputs[control] = inputs;
  }

  /**
   * Registers an animation in Phaser using the supplied texture atlas and frame. All animations have a no zero-padding.
   *
   * @param texture The key of a texture atlas you loaded using registerAsset().
   * @param frame The frame name of the images within the atlas.
   * @param start The start frame.
   * @param end The end frame.
   * @param repeat If the animation repeats.
   * @param fps The frame rate.
   */
  public registerAnimation(texture: string, frame: string, start: number, end: number, repeat = true, fps = 12): void {
    this.validateKey(frame, 'asset');

    this.animations.push({
      texture,
      frame,
      start,
      end,
      repeat,
      fps
    });
  }

  /**
   * Starts the game.
   */
  public start(): void {
    if (this.isStarted) {
      throw new Error('Cannot start the game twice!');
    }

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

    // Register framework services.
    this.serviceContainer.bind<RegisterControlsInterface>('_registerControls').to(RegisterControls).inSingletonScope();
    this.registerService<ControlsInterface>('controls', Controls);

    // Add input scene.
    const controls = this.serviceContainer.get<RegisterControlsInterface>('_registerControls');
    this.phaser.scene.add('_input', InputScene);
    this.phaser.scene.start('_input', { controls, inputs: this.inputs });

    // Make sure we can access the service container.
    this.phaser.registry.set('_serviceContainer', this.serviceContainer);

    // Start the first scene.
    this.phaser.scene.start('_load', {
      assets: this.assets,
      animations: this.animations,
      nextScene,
      loadingColor: this.options.loadingColor
    });

    // Set flag.
    this.isStarted = true;
  }

  private validateKey(key: string, type = 'thing') {
    if (this.isStarted) {
      throw new Error(`Cannot register ${type} with key ${key} as the game has already been started. Register your ${type} before calling the "start()" method.`);
    }

    if (this.keys.includes(key)) {
      throw Error(`Cannot register ${type} in game as the key "${key}" is already in use!`);
    }

    if (key === '' || key.charAt(0) === '_') {
      throw Error(`Cannot register ${type} in game as the key "${key}" is invalid! It cannot be an empty string or start with an underscore.`);
    }

    this.keys.push(key);
  }
}
