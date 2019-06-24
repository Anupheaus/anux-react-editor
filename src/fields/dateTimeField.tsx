import { FunctionComponent, useMemo } from 'react';
import { useBound, CustomTag } from 'anux-react-utils';
import { DatePicker, TimePicker, DateTimePicker, DatePickerProps, TimePickerProps, DateTimePickerProps, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import * as moment from 'moment';
import { useValidation } from '../hooks';
import './textField.scss';

interface IProps {
  label?: string;
  isReadOnly?: boolean;
  isRequired?: boolean;
  hint?: string;
  get: number;
  mode?: DateTimeModes;
  views?: DateTimePickerProps['views'];
  set?(newValue: number): void;
}

interface ICommonProps extends DatePickerProps, TimePickerProps, DateTimePickerProps {
  views: any;
  openTo: any;
  onChange(date: any): void;
  onClick?(): void;
}

export enum DateTimeModes {
  DateTime,
  DateOnly,
  TimeOnly,
}

export const DateTimeField: FunctionComponent<IProps> = ({
  label,
  get,
  set,
  hint,
  isReadOnly = false,
  isRequired = false,
  mode = DateTimeModes.DateTime,
  views,
}) => {
  isReadOnly = isReadOnly || !set;

  const validationError = useValidation({
    value: get,
    isRequired,
    isDisabled: isReadOnly,
  });

  const handleChanged = useBound((date: moment.Moment) => {
    if (isReadOnly) { return; }
    set(date.valueOf());
  });

  const value = useMemo(() => moment(get), [get]);

  const commonProps: ICommonProps = {
    variant: 'inline',
    value,
    label,
    placeholder: hint,
    // disableToolbar: true,
    disabled: isReadOnly,
    onChange: handleChanged,
    error: !!validationError,
    helperText: validationError && validationError.message,
    views,
    openTo: views,
  };

  const renderDateOnly = () => (<DatePicker {...commonProps} />);
  const renderTimeOnly = () => (<TimePicker {...commonProps} />);
  const renderDateTime = () => (<DateTimePicker {...commonProps} />);

  return (
    <CustomTag name="anux-editor-datetime-field" className="anux-editor-field anux-editor-datetime-field">
      <MuiPickersUtilsProvider utils={MomentUtils}>
        {mode === DateTimeModes.DateOnly ? renderDateOnly() : mode === DateTimeModes.TimeOnly ? renderTimeOnly() : renderDateTime()}
      </MuiPickersUtilsProvider>
    </CustomTag>
  );
};
