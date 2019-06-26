import { ReactElement, PropsWithChildren, useState, useEffect } from 'react';
import { useBound, areShallowEqual, CustomTag, useClasses } from 'anux-react-utils';
import { IValidationError } from './models';
import { EditorContext } from './context';
import styles from './editor.css';
import { IMap, PromiseMaybe } from 'anux-common';

interface IEditorChildren<T extends {}> {
  record: T;
  update(record: T): void;
}

interface IProps<T extends {}> {
  record: T;
  className?: string;
  children(props: IEditorChildren<T>): ReactElement;
  onSave?(record: T, additionalParams?: IMap): PromiseMaybe;
  onCancel?(additionalParams?: IMap): PromiseMaybe;
}

export const Editor: <T extends {}>(props: PropsWithChildren<IProps<T>>) => ReactElement<PropsWithChildren<IProps<T>>> = ({
  record,
  className,
  children,
  onSave,
  onCancel }) => {
  type T = typeof record;

  const [state, setState] = useState({
    record,
    isDirty: false,
    validationErrors: [] as IValidationError[],
    busyFields: [] as string[],
  });

  const { record: mutatedRecord, validationErrors, busyFields, isDirty } = state;

  const checkIsDirty = (updatedRecord: T) => !areShallowEqual(updatedRecord, record);

  const update = useBound((updatedRecord: T) => setState(innerState => ({ ...innerState, record: updatedRecord, isDirty: checkIsDirty(updatedRecord) })));

  const reset = () => mutatedRecord === record && isDirty === false ? undefined : setState(innerState => ({ ...innerState, record, isDirty: false }));
  useEffect(reset, [record]);

  const cancel = useBound((additionalParams?: IMap) => {
    reset();
    if (onCancel) { onCancel(additionalParams || {}); }
  });

  const save = useBound((additionalParams?: IMap) => {
    if (!onSave) { throw new Error('This record has been requested to be saved, but no onSave handler has been provided.'); }
    if (!isDirty) { return; }
    onSave(mutatedRecord, additionalParams || {});
  });

  const setValidationErrorsFor = useBound((id: string, errors: IValidationError[]) => setState(innerState => ({
    ...innerState,
    validationErrors: innerState.validationErrors
      .filter(error => error.id !== id)
      .concat(errors.map(error => ({ ...error, id }))), // probably unnecessary to add id here, but just making sure :)
  })));

  const setFieldBusyState = useBound((id: string, isBusy: boolean) => {
    if (isBusy && !busyFields.includes(id)) { setState(s => ({ ...s, busyFields: busyFields.concat(id) })); }
    if (!isBusy && busyFields.includes(id)) { setState(s => ({ ...s, busyFields: busyFields.except([id]) })); }
  });

  const canSave = isDirty && busyFields.length === 0 && validationErrors.length === 0;

  const classNames = useClasses(['anux-editor', className, styles.root]);

  return (
    <CustomTag name="anux-editor" className={classNames}>
      <EditorContext.Provider value={{ record, update, isDirty, canSave, validationErrors, busyFields, setValidationErrorsFor, setFieldBusyState, cancel, save }}>
        {children({ record: mutatedRecord, update })}
      </EditorContext.Provider>
    </CustomTag>
  );
};
