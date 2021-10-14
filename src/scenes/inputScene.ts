import { InputInterface } from '../controls/inputs/InputInterface';
import { RegisterControlsInterface } from '../controls/RegisterControlsInterface';
import { Gamepad, GamepadButton, GamepadInput } from '../controls/inputs/GamepadInput';
import { KeyboardInput } from '../controls/inputs/KeyboardInput';
import { Scene } from '../scene';

export class InputScene extends Scene {
  constructor() {
    super('_input');
  }

  public init(data: { controls: RegisterControlsInterface, inputs: Record<string, string[]> }): void {
    for (const control in data.inputs) {
      const inputObjects: Array<InputInterface> = [];

      for (const input of data.inputs[control]) {
        const inputType = input.split('.').shift();
        const inputCode = input.split('.').pop();

        if (inputType === 'Keyboard') {
          if (!inputCode || isNaN(Number.parseInt(inputCode))) {
            console.error(`Invalid input code "${inputCode}" for input type "${inputType}".`);
          } else {
            inputObjects.push(new KeyboardInput(this, Number.parseInt(inputCode)));
          }
        } else if (inputType === 'Gamepad') {
          if (!inputCode || (<any>GamepadButton)[inputCode] === undefined) {
            console.error(`Invalid input code "${inputCode}" for input type "${inputType}".`);
          } else {
            inputObjects.push(new GamepadInput(this, Gamepad.ONE, (<any>GamepadButton)[inputCode]));
          }
        } else {
          console.error(`Invalid input type "${inputType}". Valid types are "Keyboard" and "Gamepad".`);
        }
      }

      data.controls.registerInputs(control, inputObjects);
    }
  }
}
