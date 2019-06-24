import { IValidationError } from './models';
import { IMap, PromiseMaybe } from 'anux-common';

export interface IEditorContext<T extends {} = {}> {
    record: T;
    isDirty: boolean;
    validationErrors: IValidationError[];
    busyFields: string[];
    canSave: boolean;
    update(record: T): void;
    save(additionalParams?: IMap): PromiseMaybe;
    cancel(additionalParams?: IMap): PromiseMaybe;
    setValidationErrorsFor(id: string, errors: IValidationError[]): void;
    setFieldBusyState(id: string, isBusy: boolean): void;
}

export const EditorContext = React.createContext<IEditorContext>({
    record: undefined,
    isDirty: false,
    validationErrors: [],
    busyFields: [],
    setValidationErrorsFor: undefined,
    update: undefined,
    canSave: true,
    save: undefined,
    cancel: undefined,
    setFieldBusyState: undefined,
});
