import { injectable } from 'inversify';
import { ComponentInterface } from './componentInterface';
import { Scene } from './scene';

/**
 * A component to be used in a Phaser game.
 */
@injectable()
export abstract class Component implements ComponentInterface {
  protected scene: Scene;

  public init(data?: Record<string, unknown>): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // To be overridden.
  }

  public beforeCreate(): void {
    // To be overridden.
  }

  public create(): void {
    // To be overridden.
  }

  public afterCreate(): void {
    // To be overridden.
  }

  public beforeUpdate(time: number, delta: number): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // To be overridden.
  }

  public update(time: number, delta: number): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // To be overridden.
  }

  public afterUpdate(time: number, delta: number): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // To be overridden.
  }

  public setScene(scene: Scene): void {
    this.scene = scene;
  }
}
