import { ChangeEvent, FunctionComponent } from 'react';
import { useBound, CustomTag, useClasses } from 'anux-react-utils';
import { Switch } from '@material-ui/core';
import commonStyles from './fields.css';
import styles from './toggleField.css';

interface IProps {
  label?: string;
  isReadOnly?: boolean;
  get: boolean;
  set?(newValue: boolean): void;
}

export const ToggleField: FunctionComponent<IProps> = ({
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

  const classNames = useClasses([
    commonStyles.common,
    styles.root,
  ]);

  return (
    <CustomTag name="anux-editor-toggle-field" className={classNames}>
      <CustomTag name="anux-editor-toggle-label" className={styles.label}>{label}</CustomTag>
      <Switch
        checked={get}
        disabled={isReadOnly}
        onChange={handleChanged}
        color="primary"
        className={styles.span}
      />
    </CustomTag>
  );
};
