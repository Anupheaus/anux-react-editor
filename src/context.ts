import { IValidationError } from './models';

export interface IEditorContext<T extends {} = {}> {
    record: T;
    isDirty: boolean;
    validationErrors: IValidationError[];
    update(record: T): void;
    save(): Promise<void>;
    cancel(): void;
    setValidationErrorsFor(id: string, errors: IValidationError[]): void;
}

export const EditorContext = React.createContext<IEditorContext>({
    record: undefined,
    isDirty: false,
    validationErrors: [],
    setValidationErrorsFor: undefined,
    update: undefined,
    save: undefined,
    cancel: undefined,
});
