import { ReactElement, PropsWithChildren, useState } from 'react';
import { useBound, areShallowEqual, CustomTag, useClasses } from 'anux-react-utils';
import { IValidationError } from './models';
import { EditorContext } from './context';
import './editor.scss';

interface IEditorChildren<T extends {}> {
    record: T;
    update(record: T): void;
}

interface IProps<T extends {}> {
    record: T;
    className?: string;
    children(props: IEditorChildren<T>): ReactElement;
    onSave?(record: T): Promise<void>;
    onCancel?(): void;
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
    });

    const { record: mutatedRecord, validationErrors, isDirty } = state;

    const checkIsDirty = (updatedRecord: T) => areShallowEqual(updatedRecord, record);

    const update = useBound((updatedRecord: T) => setState(innerState => ({ ...innerState, record: updatedRecord, isDirty: checkIsDirty(updatedRecord) })));

    const cancel = useBound(() => {
        setState(innerState => ({ ...innerState, record, isDirty: false }));
        if (onCancel) { onCancel(); }
    });

    const save = useBound(() => onSave && onSave(mutatedRecord));

    const setValidationErrorsFor = useBound((id: string, errors: IValidationError[]) => setState(innerState => ({
        ...innerState,
        validationErrors: innerState.validationErrors
            .filter(error => error.id !== id)
            .concat(errors.map(error => ({ ...error, id }))), // probably unnecessary to add id here, but just making sure :)
    })));

    const classNames = useClasses(['anux-editor', className]);

    return (
        <CustomTag name="anux-editor" className={classNames}>
            <EditorContext.Provider value={{ record, update, isDirty, validationErrors, setValidationErrorsFor, cancel, save }}>
                {children({ record: mutatedRecord, update })}
            </EditorContext.Provider>
        </CustomTag>
    );
};
