import { Container } from 'inversify';
import { NodeInterface } from './nodeInterface';

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
export abstract class Scene extends Phaser.Scene implements NodeInterface {
  private nodes: Array<NodeInterface> = [];
  private created = false;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  public init(data?: Record<string, unknown>): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // ...to be overridden.
  }

  public getChildren(): Array<NodeInterface> {
    return this.nodes;
  }

  public getParent(): NodeInterface|null {
    return null;
  }

  public setScene(): void {
    // ...
  }

  public remove(): void {
    this.scene.stop();
  }

  /**
   * Safely changes the scene by unregistering all components and events.
   *
   * @param key The unique key of the scene to change to.
   */
  public changeScene(key: string): void {
    this.nodes = [];
    this.scene.start(key);
  }

  /**
   * Creates a node instance, but does no add it to the node tree.
   *
   * @param key The key of the node to add.
   * @param data Any data to be passed to the node's `init()` method.
   */
  public createNode(key: string, data?: Record<string, unknown>): NodeInterface {
    // Get a node instance.
    const serviceContainer = this.registry.get('_serviceContainer') as Container;
    const node = serviceContainer.get<NodeInterface>(key);

    // Initialise it.
    node.setScene(this);
    node.init(data);

    // Run creation hooks if the scene is already ceated.
    if (this.created) {
      this.updateNode(node, Hook.CREATE);
    }

    return node;
  }

  /**
   * Adds a node to the scene.
   *
   * @param key The key of the node to add.
   * @param data Any data to be passed to the node's `init()` method.
   */
  public addNode(key: string, data?: Record<string, unknown>): void {
    const node = this.createNode(key, data);

    // Add it to node tree.
    this.nodes.push(node);
  }

  /**
   * Don't override this method. If you do, components will stop working!
   */
  public create(): void {
    for (const child of this.getChildren()) {
      this.updateNode(child, Hook.CREATE);
    }
    this.created = true;
  }

  /**
   * Don't override this method. If you do, components will stop working!
   */
  public update(time: number, delta: number): void {
    for (const child of this.getChildren()) {
      this.updateNode(child, Hook.UPDATE, time, delta);
    }
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

  /**
   * Has the scene's created() method been run?
   *
   * @returns
   */
  public isCreated(): boolean {
    return this.created;
  }

  private updateNode(node: NodeInterface, hook: Hook, time = 0, delta = 0) {
    switch (hook as Hook) {
    case Hook.CREATE:
      node.create();
      break;

    case Hook.UPDATE:
      node.update(time, delta);
      break;
    }

    for (const child of node.getChildren()) {
      this.updateNode(child, hook, time, delta);
    }
  }
}
