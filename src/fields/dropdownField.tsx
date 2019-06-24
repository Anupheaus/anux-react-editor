import { ChangeEvent, PropsWithChildren, ReactElement } from 'react';
import { CustomTag, useBound, useAsync } from 'anux-react-utils';
import { Select, FormControl, InputLabel, FormHelperText, Input, MenuItem, LinearProgress } from '@material-ui/core';
import { useValidation } from '../hooks';
import { IRecord } from 'anux-common';
import './dropdownField.scss';
import { ValidationPriorities } from '../models';

interface IProps<T extends IRecord> {
    label?: string;
    isReadOnly?: boolean;
    isRequired?: boolean;
    get: string;
    items: (T[]) | (() => Promise<T[]>);
    set?(newValue: T): void;
    children(item: T): ReactElement;
}

export const DropdownField: <T extends IRecord>(props: PropsWithChildren<IProps<T>>) => ReactElement<PropsWithChildren<IProps<T>>> = ({
    label,
    get,
    set,
    items = [],
    isReadOnly = false,
    isRequired = false,
    children,
}) => {
    isReadOnly = isReadOnly || !set;
    const inputId = `anux-dropdown-${Math.uniqueId()}`;

    const { isBusy: isLoadingItems, result: loadedItems } = useAsync(() => (items instanceof Array ? () => items : items)(), [items]);

    const validationError = useValidation({
        value: get,
        isRequired,
        isDisabled: isReadOnly || isLoadingItems,
        isValid(id, raiseError) {
            if (loadedItems && loadedItems.findById(id)) { return; }
            raiseError({
                message: 'Current value is invalid',
                priority: ValidationPriorities.High,
            });
        },
    });

    const handleChanged = useBound((event: ChangeEvent<{ name?: string; value: string; }>) => {
        if (isReadOnly) { return; }
        const value: string = event.target.value;
        const matchedItem = loadedItems.findById(value);
        set(matchedItem);
    });

    const renderItems = useBound(() => loadedItems.map(item => (
        <MenuItem key={item.id} value={item.id}>{children(item)}</MenuItem>
    )));

    return (
        <CustomTag name="anux-editor-dropdown-field" className="anux-editor-field anux-editor-dropdown-field">
            <FormControl error={!!validationError} disabled={isReadOnly || isLoadingItems}>
                {label ? <InputLabel htmlFor={inputId}>{label}</InputLabel> : null}
                <Select
                    value={get || ''}
                    onChange={handleChanged}
                    input={<Input
                        id={inputId}
                        name={inputId}
                    />}
                >
                    {loadedItems ? renderItems() : null}
                </Select>
                {isLoadingItems ? <LinearProgress className="anux-editor-field-progress" /> : null}
                {validationError ? <FormHelperText>{validationError.message}</FormHelperText> : null}
            </FormControl>
        </CustomTag>
    );
};
