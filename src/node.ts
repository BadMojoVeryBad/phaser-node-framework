import { injectable } from 'inversify';
import { NodeInterface } from './nodeInterface';
import { Scene } from './scene';

/**
 * A node to be used in a Phaser game.
 */
@injectable()
export abstract class Node implements NodeInterface {
  protected scene: Scene;
  private children: Array<NodeInterface> = [];
  private parent: NodeInterface;

  public init(data?: Record<string, unknown>): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // To be overridden.
  }

  public create(): void {
    // To be overridden.
  }

  public update(time: number, delta: number): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // To be overridden.
  }

  public destroy(): void {
    // To be overridden.
  }

  public setScene(scene: Scene): void {
    this.scene = scene;
  }

  public addNode(key: string, data: Record<string, unknown>): void {
    const component = this.scene.createNode(key, data);
    this.children.push(component);
  }

  public getParent(): NodeInterface {
    return this.parent;
  }

  public getChildren(): Array<NodeInterface> {
    return this.children;
  }

  public remove(): void {
    this.destroyChildren(this.getChildren());
    this.destroy();
    this.children = [];
  }

  private destroyChildren(nodes: Array<NodeInterface>) {
    for (const node of nodes) {
      this.destroyChildren(node.getChildren());
      node.destroy();
    }
  }
}
