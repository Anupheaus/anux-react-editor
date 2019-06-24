import { ChangeEvent, FunctionComponent } from 'react';
import { useBound, CustomTag } from 'anux-react-utils';
import { Switch } from '@material-ui/core';
import './switchField.scss';

interface IProps {
  label?: string;
  isReadOnly?: boolean;
  get: boolean;
  set?(newValue: boolean): void;
}

export const SwitchField: FunctionComponent<IProps> = ({
  label,
  get,
  set,
  isReadOnly = false,
}) => {
  isReadOnly = isReadOnly || !set;

  const handleChanged = useBound((_event: ChangeEvent, isChecked: boolean) => {
    if (isReadOnly) { return; }
    set(isChecked);
  });

  return (
    <CustomTag name="anux-editor-switch-field" className="anux-editor-field anux-editor-switch-field">
      <CustomTag name="anux-editor-switch-label">{label}</CustomTag>
      <Switch
        checked={get}
        disabled={isReadOnly}
        onChange={handleChanged}
        color="primary"
      />
    </CustomTag>
  );
};
