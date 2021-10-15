import { Scene } from '../../scene';
import { InputInterface } from './InputInterface';

/**
 * A keyboard button press.
 */
export class KeyboardInput implements InputInterface {
    private scene!: Phaser.Scene;
    private keyCode!: number;
    private key: Phaser.Input.Keyboard.Key;

    constructor(scene: Scene, keyCode: number) {
      this.scene = scene;
      this.keyCode = keyCode;
      this.key = this.scene.input.keyboard.addKey(this.keyCode);
    }

    public isActive(): number {
      return this.key.isDown ? 1 : 0;
    }
}
