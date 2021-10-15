import { Scene } from './scene';

/**
 * Defined the interface required to make components work.
 */
export interface ComponentInterface {
  /**
   * This is called after the object is contructed, but before create.
   * This means all dependencies will be resolved, but the actual phaser
   * logic wont have started yet.
   */
  init(data?: Record<string, unknown>): void;

  /**
   * Called during the scene's `create()` method, before all other components
   * `create()` methods have been run.
   */
  beforeCreate(): void;

  /**
   * Called during the scene's `create()` method.
   */
  create(): void;

  /**
   * Called during the scene's `create()` method, after all other components
   * `create()` methods have been run. Useful for emitting events that have
   * been subscribed to in the `create()` method.
   */
  afterCreate(): void;

  /**
   * Called during the scene's `update()` method, before all other components
   * `update()` methods have been run.
   *
   * @param time Game time in ms.
   * @param delta Frame delta in ms.
   */
  beforeUpdate(time: number, delta: number): void;

  /**
   * Called during the scene's `update()` method.
   *
   * @param time Game time in ms.
   * @param delta Frame delta in ms.
   */
  update(time: number, delta: number): void;

  /**
   * Called during the scene's `update()` method, after all other components
   * `update()` methods have been run. Useful for emitting events.
   *
   * @param time Game time in ms.
   * @param delta Frame delta in ms.
   */
  afterUpdate(time: number, delta: number): void;

  /**
   * Sets the phaser scene member.
   *
   * @param scene The scene.
   */
  setScene(scene: Scene): void;
}
