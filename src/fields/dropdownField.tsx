import { ChangeEvent, PropsWithChildren, ReactElement } from 'react';
import { CustomTag, useBound, useAsync } from 'anux-react-utils';
import { Select, FormControl, InputLabel, FormHelperText, Input, MenuItem, LinearProgress } from '@material-ui/core';
import { useValidation, useFieldBusy, useFieldId } from '../hooks';
import { IRecord } from 'anux-common';
import { ValidationPriorities } from '../models';
import styles from './fields.css';

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
    const id = useFieldId('anux-dropdown');
    const { isBusy: isLoadingItems, result: loadedItems } = useAsync(() => (items instanceof Array ? () => items : items)(), [items]);

    const setBusy = useFieldBusy(id);
    setBusy(isLoadingItems);

    const validationError = useValidation({
        id,
        value: get,
        isRequired,
        isDisabled: isReadOnly || isLoadingItems,
        isValid(raiseError) {
            if (loadedItems && loadedItems.findById(get)) { return; }
            raiseError({
                message: 'Current value is invalid',
                priority: ValidationPriorities.High,
            });
        },
    }, [loadedItems]);

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
        <CustomTag name="anux-editor-dropdown-field" className={styles.common}>
            <FormControl error={!!validationError} disabled={isReadOnly || isLoadingItems}>
                {label ? <InputLabel htmlFor={id}>{label}</InputLabel> : null}
                <Select
                    value={get || ''}
                    onChange={handleChanged}
                    input={<Input
                        id={id}
                        name={id}
                    />}
                >
                    {loadedItems ? renderItems() : null}
                </Select>
                {isLoadingItems ? <LinearProgress className={styles.progress} /> : null}
                {validationError ? <FormHelperText>{validationError.message}</FormHelperText> : null}
            </FormControl>
        </CustomTag>
    );
};
