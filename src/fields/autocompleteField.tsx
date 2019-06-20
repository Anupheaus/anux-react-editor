import { ChangeEvent, PropsWithChildren, ReactElement, useState, useMemo, useRef, useEffect } from 'react';
import { CustomTag, useActions } from 'anux-react-utils';
import { FormControl, FormHelperText, LinearProgress, TextField, Paper, Popper, MenuItem } from '@material-ui/core';
import * as Autosuggest from 'react-autosuggest';
import * as textContent from 'react-addons-text-content';
import { useValidation } from '../hooks';
import { IRecord } from 'anux-common';
import { ValidationPriorities } from '../models';
import './autocompleteField.scss';

interface IRenderParams<T extends IRecord> {
    item: T;
    isHighlighted: boolean;
    text: string;
}

interface IQuery {
    id?: string;
    text?: string;
}

interface IProps<T extends IRecord> {
    label?: string;
    isReadOnly?: boolean;
    isRequired?: boolean;
    hint?: string;
    get: string;
    items(query: IQuery): Promise<T[]>;
    set?(newValue: T): void;
    children(params: IRenderParams<T>): ReactElement;
}

interface IState<T extends IRecord> {
    items: T[];
    error: Error;
}

export const AutocompleteField: <T extends IRecord>(props: PropsWithChildren<IProps<T>>) => ReactElement<PropsWithChildren<IProps<T>>> = ({
    label,
    get,
    set,
    items = () => [],
    hint = '',
    isReadOnly = false,
    isRequired = false,
    children,
}) => {
    type T = Parameters<typeof set>[0];

    isReadOnly = isReadOnly || !set;
    const [{ items: loadedItems, error: fetchError }, setState] = useState<IState<T>>({ items: undefined, error: undefined });
    const inputRef = useRef<HTMLInputElement>(undefined);
    const currentQueryIdRef = useRef<string>();
    const isLoadingItems = loadedItems == null;

    const { fetch, fetchForAutosuggest, clear, handleChanged, getSelectedItemAsText, renderItem, renderMenu, renderInput } = useActions({
        async fetch(query: IQuery): Promise<void> {
            const currentQueryId = Math.uniqueId();
            currentQueryIdRef.current = currentQueryId;
            clear();
            const results = await items(query);
            if (currentQueryIdRef.current !== currentQueryId) { return; }
            setState(s => ({ ...s, items: results }));
        },
        async fetchForAutosuggest({ value: text }: Autosuggest.SuggestionsFetchRequestedParams): Promise<void> {
            await fetch({ text });
        },
        clear(): void {
            setState({ items: undefined, error: undefined });
        },
        handleChanged(event: ChangeEvent): void {
            if (isReadOnly) { return; }
            const id: string = event.target.getAttribute('value');
            const matchedItem = loadedItems && loadedItems.findById(id);
            set(matchedItem);
        },
        getSelectedItemAsText(item: T): string {
            return textContent(children({ item, isHighlighted: true, text: '' }));
        },
        renderItem(item: T, { isHighlighted, query }: Autosuggest.RenderSuggestionParams): ReactElement {
            return (
                <MenuItem selected={isHighlighted} component="div" value={item.id}>
                    {children({ item, isHighlighted, text: query })}
                </MenuItem>
            );
        },
        renderMenu(options: Autosuggest.RenderSuggestionsContainerParams): ReactElement {
            return (
                <Popper className="anux-editor-autocomplete-field-popup-menu" anchorEl={inputRef.current} open={options.children != null}>
                    <Paper
                        {...options.containerProps}
                        style={{ width: inputRef.current ? inputRef.current.clientWidth : null }}
                        square>
                        {options.children}
                    </Paper>
                </Popper>
            );
        },
        renderInput(args: any): ReactElement {
            return (
                <TextField
                    fullWidth
                    InputProps={{
                        inputRef: (node: HTMLInputElement) => {
                            inputRef.current = node;
                            args.ref(node);
                        },
                        ...args,
                    }}
                />
            );
        },
    });

    useEffect(() => {
        fetch({ id: get }).catch(error => setState(s => ({ ...s, error })));
    }, [get]);

    const validationError = useValidation({
        value: get,
        isRequired,
        isDisabled: isReadOnly || isLoadingItems,
        isValid(id, raiseError) {
            if (fetchError) {
                raiseError({ message: 'Failed to retrieve autocomplete suggestions.', priority: ValidationPriorities.Critical });
            }
            if (!loadedItems) { return; }
            if (loadedItems.findById(id)) { return; }
            raiseError({
                message: 'Current value is invalid',
                priority: ValidationPriorities.High,
            });
        },
    });

    const inputProps = useMemo<Autosuggest.InputProps<T>>(() => {
        const item = loadedItems && loadedItems.findById(get);
        return {
            label,
            placeholder: hint,
            value: item ? getSelectedItemAsText(item) : '',
            onChange: handleChanged,
        };
    }, [hint, loadedItems, get]);

    return (
        <CustomTag name="anux-editor-autocomplete-field" className="anux-editor-field anux-editor-autocomplete-field">
            <FormControl error={!!validationError} disabled={isReadOnly || isLoadingItems}>
                <Autosuggest
                    renderInputComponent={renderInput}
                    suggestions={loadedItems || Array.empty()}
                    onSuggestionsFetchRequested={fetchForAutosuggest}
                    onSuggestionsClearRequested={clear}
                    getSuggestionValue={getSelectedItemAsText}
                    renderSuggestion={renderItem}
                    inputProps={inputProps}
                    renderSuggestionsContainer={renderMenu}
                ></Autosuggest>
                {isLoadingItems ? <LinearProgress className="anux-editor-autocomplete-progress" /> : null}
                {validationError ? <FormHelperText>{validationError.message}</FormHelperText> : null}
            </FormControl>
        </CustomTag >
    );
};
