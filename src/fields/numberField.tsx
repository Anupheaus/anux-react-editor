import { FC, ChangeEvent } from 'react';
import { useBound, CustomTag } from 'anux-react-utils';
import { TextField as MUITextField } from '@material-ui/core';
import { useValidation, useFieldId } from '../hooks';
import './textField.scss';
import * as NumberFormatType from 'react-number-format';
import { InputBaseComponentProps } from '@material-ui/core/InputBase';

const NumberFormat = NumberFormatType as any as typeof NumberFormatType.default; // types are wrong...grrrr

interface IProps {
    label?: string;
    isReadOnly?: boolean;
    isRequired?: boolean;
    hint?: string;
    get: number;
    decimalPlaces?: number;
    symbols?: {
        thousands?: string;
        prefix?: string;
        suffix?: string;
        decimalPoint?: string;
    };
    set?(newValue: number): void;
}

export const NumberField: FC<IProps> =
    ({
        label,
        get,
        set,
        hint,
        isReadOnly = false,
        isRequired = false,
        decimalPlaces = 2,
        symbols: {
            thousands = ',',
            decimalPoint = '.',
            prefix,
            suffix,
        } = {},
    }) => {
        isReadOnly = isReadOnly || !set;
        const id = useFieldId('anux-number');

        const validationError = useValidation({
            id,
            value: get,
            isRequired,
            isDisabled: isReadOnly,
        });

        const handleChanged = useBound((event: ChangeEvent) => {
            if (isReadOnly) { return; }
            const value: number = Number.parseFloat(event.target['value']);
            set(value);
        });

        const CustomNumberField = useBound(({ inputRef, onChange, defaultValue, ...other }: InputBaseComponentProps) => (
            <NumberFormat
                {...other}
                thousandSeparator={thousands}
                defaultValue={defaultValue as string}
                getInputRef={inputRef}
                onValueChange={values => {
                    onChange({
                        target: {
                            value: values.value,
                        },
                    } as any);
                }}
                decimalSeparator={decimalPoint}
                decimalScale={decimalPlaces}
                prefix={prefix}
                suffix={suffix}
            />
        ));

        return (
            <CustomTag name="anux-editor-number-field" className="anux-editor-field anux-editor-number-field">
                <MUITextField
                    label={label}
                    value={get}
                    placeholder={hint}
                    disabled={isReadOnly}
                    onChange={handleChanged}
                    error={!!validationError}
                    helperText={validationError && validationError.message}
                    InputProps={{ inputComponent: CustomNumberField }}
                />
            </CustomTag>
        );
    };
