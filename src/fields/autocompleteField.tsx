import { ChangeEvent, PropsWithChildren, ReactElement, useState, useMemo, useRef, useEffect, FocusEvent, FormEvent } from 'react';
import { CustomTag, useActions } from 'anux-react-utils';
import { FormControl, FormHelperText, LinearProgress, TextField, Paper, Popper, MenuItem } from '@material-ui/core';
import * as Autosuggest from 'react-autosuggest';
import * as textContent from 'react-addons-text-content';
import { useValidation, useFieldId, useFieldBusy } from '../hooks';
import { IRecord, is } from 'anux-common';
import { ValidationPriorities } from '../models';
import styles from './autocompleteField.css';
import commonStyles from './fields.css';

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
  getTextFromItem?(item: T): string;
  children(params: IRenderParams<T>): ReactElement;
}

interface IState<T extends IRecord> {
  value: string;
  items: T[];
  isLoading: boolean;
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
  getTextFromItem,
  children,
}) => {
  type T = Parameters<typeof set>[0];
  const id = useFieldId('anux-autocomplete');

  isReadOnly = isReadOnly || !set;
  const [{ items: loadedItems, value, isLoading, error: fetchError }, setState] = useState<IState<T>>({ value: '', items: undefined, isLoading: false, error: undefined });
  const [inputElement, setInputElement] = useState<HTMLInputElement>(undefined);
  const currentQueryIdRef = useRef('');
  const ignoreNextClearRef = useRef(false);
  const setBusy = useFieldBusy(id);
  // const isLoadingItems = loadedItems == null;

  const {
    fetch, stopFetching, fetchForAutosuggest, suggestionSelected, matchUsingQuery, handleChanged, handleBlur, getSelectedItemAsText, renderItem, renderMenu, renderInput,
  } = useActions({
    async fetch(query: IQuery): Promise<void> {
      if (is.empty(query.id) && is.empty(query.text)) { return; }
      setBusy(true);
      const currentQueryId = Math.uniqueId();
      currentQueryIdRef.current = currentQueryId;
      setState(s => ({ ...s, items: undefined, isLoading: true, error: undefined }));
      const results = await items(query);
      if (currentQueryIdRef.current !== currentQueryId) { return; }
      setState(s => ({ ...s, items: results, isLoading: false }));
      setBusy(false);
      matchUsingQuery({ id: query.id });
    },
    stopFetching() {
      currentQueryIdRef.current = Math.emptyId();
      setBusy(false);
      setState(s => ({ ...s, isLoading: false }));
    },
    async fetchForAutosuggest({ value: text, reason }: Autosuggest.SuggestionsFetchRequestedParams): Promise<void> {
      if (reason === 'input-focused') { return; }
      await fetch({ text });
    },
    suggestionSelected(_event: FormEvent, { suggestion: { id: selectedId } }: Autosuggest.SuggestionSelectedEventData<T>) {
      ignoreNextClearRef.current = true;
      matchUsingQuery({ id: selectedId });
    },
    matchUsingQuery(query: IQuery): boolean {
      if (is.empty(query.id) && is.empty(query.text)) { return true; }
      const matchById = () => loadedItems && query.id ? loadedItems.findById(query.id) : null;
      const matchByValue = () => loadedItems && query.text ? loadedItems.find(item => getSelectedItemAsText(item) === query.text) : null;
      const matchedItem = matchById() || matchByValue();
      if (matchedItem) {
        const matchedItemText = getSelectedItemAsText(matchedItem);
        if (value !== matchedItemText) { setState(s => ({ ...s, value: matchedItemText })); }
        if (get !== matchedItem.id) { set(matchedItem); }
        return true;
      } else {
        if (value !== query.text) { setState(s => ({ ...s, value: query.text })); }
        if (!is.empty(get)) { set(undefined); }
        return false;
      }
    },
    handleChanged(_event: ChangeEvent, { newValue, method }: Autosuggest.ChangeEvent): void {
      if (isReadOnly || method !== 'type') { return; }
      if (value !== newValue) {
        stopFetching();
        setState(s => ({ ...s, value: newValue }));
        if (!is.empty(get)) { set(undefined); }
      }
    },
    handleBlur(event: FocusEvent): void {
      if (isReadOnly) { return; }
      const text = event.target.getAttribute('value');
      matchUsingQuery({ text });
    },
    getSelectedItemAsText(item: T): string {
      return is.function(getTextFromItem) ? getTextFromItem(item) : textContent(children({ item, isHighlighted: true, text: '' }));
    },
    renderItem(item: T, { isHighlighted, query }: Autosuggest.RenderSuggestionParams): ReactElement {
      return (
        // @ts-ignore
        <MenuItem selected={isHighlighted} component="div" value={item.id}>
          {children({ item, isHighlighted, text: query })}
        </MenuItem>
      );
    },
    renderMenu(options: Autosuggest.RenderSuggestionsContainerParams): ReactElement {
      return (
        <Popper className={styles.popupMenu} anchorEl={inputElement} open={options.children != null}>
          <Paper
            {...options.containerProps}
            style={{ width: inputElement ? inputElement.clientWidth : null }}
            square>
            {options.children}
          </Paper>
        </Popper>
      );
    },
    renderInput(args: any): ReactElement {
      const { ref, ...other } = args;
      return (
        <TextField
          fullWidth
          InputProps={{
            inputRef: (node: HTMLInputElement) => {
              ref(node);
              setInputElement(node);
            },
          }}
          {...other}
        />
      );
    },
  });

  useEffect(() => {
    if (is.empty(get)) { return; }
    if (loadedItems && matchUsingQuery({ id })) { return; }
    fetch({ id: get }).catch(error => setState(s => ({ ...s, error })));
  }, [get]);

  const validationError = useValidation({
    id,
    isDisabled: isReadOnly || isLoading,
    isRequired: () => isRequired && is.empty(get) && is.empty(value),
    isValid(raiseError) {
      if (fetchError) { raiseError({ message: 'Failed to retrieve autocomplete suggestions.', priority: ValidationPriorities.Critical }); }
      if (!loadedItems) { return; }
      if (loadedItems.findById(get)) { return; }
      raiseError({
        message: 'Current value is invalid',
        priority: ValidationPriorities.High,
      });
    },
  }, [get, value, loadedItems]);

  const inputProps = useMemo<Autosuggest.InputProps<T>>(() => ({
    label,
    placeholder: hint,
    value,
    onChange: handleChanged,
    onBlur: handleBlur,
    InputLabelProps: {
      shrink: true,
    },
  }), [label, hint, value]);

  return (
    <CustomTag name="anux-editor-autocomplete-field" className={commonStyles.common}>
      <FormControl error={!!validationError} disabled={isReadOnly || isLoading}>
        <Autosuggest
          renderInputComponent={renderInput}
          suggestions={loadedItems || Array.empty()}
          onSuggestionsFetchRequested={fetchForAutosuggest}
          onSuggestionsClearRequested={Function.empty()}
          onSuggestionSelected={suggestionSelected}
          getSuggestionValue={getSelectedItemAsText}
          renderSuggestion={renderItem}
          inputProps={inputProps}
          renderSuggestionsContainer={renderMenu}
        ></Autosuggest>
        {isLoading ? <LinearProgress className={commonStyles.progress} /> : null}
        {validationError ? <FormHelperText>{validationError.message}</FormHelperText> : null}
      </FormControl>
    </CustomTag >
  );
};
