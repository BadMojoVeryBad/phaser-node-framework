/**
 * Returns if certain controls are active.
 */
export interface ControlsInterface {
  /**
   * Returns > 0 if any input for the control is pressed.
   *
   * @param control The control to check.
   *
   * @returns number A number between 0 and 1 that represents how
   *                'active' the control is.
   */
  isActive(control: string): number;
}
