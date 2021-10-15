import { inject, injectable } from 'inversify';
import { ControlsInterface } from './ControlsInterface';
import { RegisterControlsInterface } from './RegisterControlsInterface';

/**
 * @inheritdoc
 */
@injectable()
export class Controls implements ControlsInterface {
  constructor(@inject('_registerControls') private controls: RegisterControlsInterface) { }

  /**
   * @inheritdoc
   */
  public isActive(control: string): number {
    return this.controls.isActive(control);
  }
}
