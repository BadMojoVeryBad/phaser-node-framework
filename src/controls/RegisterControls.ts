import { injectable } from 'inversify';
import { RegisterControlsInterface } from './RegisterControlsInterface';
import { InputInterface } from './inputs/InputInterface';

/**
 * @inheritdoc
 */
@injectable()
export class RegisterControls implements RegisterControlsInterface {
    private controlMap: Record<string, InputInterface[]> = {};

    /**
     * @inheritdoc
     */
    public registerInputs(control: string, inputs: InputInterface[]): void {
      this.registerControl(control);
      this.controlMap[control] = inputs;
    }

    /**
     * @inheritdoc
     */
    public isActive(control: string): number {
      const inputs = this.controlMap[control.valueOf()];
      let active = 0;

      // For each input in this control.
      if (inputs) {
        for (let i = 0; i < inputs.length; i++) {
          // Store how active it is.
          const current = inputs[i].isActive();
          if (current > active) {
            active = current;
          }
        }
      }

      // Return the most active the control.
      return active;
    }

    private registerControl(control: string): void {
      for (const controlKey in this.controlMap) {
        if (controlKey === control.valueOf().toString()) {
          return;
        }
      }

      this.controlMap[control] = [];
    }
}
