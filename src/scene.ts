import { Container } from 'inversify';
import { ComponentInterface } from './componentInterface';

enum Hook {
  BEFORE_CREATE,
  CREATE,
  AFTER_CREATE,
  BEFORE_UPDATE,
  UPDATE,
  AFTER_UPDATE,
}

/**
 * A Phaser scene extension that allows the use of components.
 */
export abstract class Scene extends Phaser.Scene {
  private components: Array<ComponentInterface> = [];

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  /**
   * Safely changes the scene by unregistering all components and events.
   *
   * @param key The unique key of the scene to change to.
   */
  public changeScene(key: string): void {
    this.components = [];
    this.scene.start(key);
  }

  /**
   * Adds a component to the scene.
   *
   * @param key The unique key of the component to add.
   * @param data Any data to be passed to the component's `init()` method.
   */
  public addComponent(key: string, data?: Record<string, unknown>): void {
    const serviceContainer = this.registry.get('_serviceContainer') as Container;
    const component = serviceContainer.get<ComponentInterface>(key);
    component.setScene(this);
    component.init(data);
    this.components.push(component);
  }

  /**
   * Don't override this method. If you do, components will stop working!
   */
  public create(): void {
    this.createComponents();
  }

  /**
   * Don't override this method. If you do, components will stop working!
   */
  public update(time: number, delta: number): void {
    this.updateComponents(time, delta);
  }

  /**
   * Get the width of the game.
   */
  public width(): number {
    return this.game.canvas.width;
  }

  /**
   * Get the height of the game.
   */
  public height(): number {
    return this.game.canvas.height;
  }

  private createComponents(): void {
    for (const component of this.components) {
      this.updateComponent(component, Hook.BEFORE_CREATE);
    }

    for (const component of this.components) {
      this.updateComponent(component, Hook.CREATE);
    }

    for (const component of this.components) {
      this.updateComponent(component, Hook.AFTER_CREATE);
    }
  }

  private updateComponents(time: number, delta: number): void {
    for (const component of this.components) {
      this.updateComponent(component, Hook.BEFORE_UPDATE, time, delta);
    }

    for (const component of this.components) {
      this.updateComponent(component, Hook.UPDATE, time, delta);
    }

    for (const component of this.components) {
      this.updateComponent(component, Hook.AFTER_UPDATE, time, delta);
    }
  }

  private updateComponent(component: ComponentInterface, hook: Hook, time = 0, delta = 0) {
    switch (hook as Hook) {
    case Hook.BEFORE_CREATE:
      component.beforeCreate();
      break;

    case Hook.CREATE:
      component.create();
      break;

    case Hook.AFTER_CREATE:
      component.afterCreate();
      break;

    case Hook.BEFORE_UPDATE:
      component.beforeUpdate(time, delta);
      break;

    case Hook.UPDATE:
      component.update(time, delta);
      break;

    case Hook.AFTER_UPDATE:
      component.afterUpdate(time, delta);
      break;
    }
  }
}
