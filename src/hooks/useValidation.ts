import { IValidationError, ValidationPriorities } from '../models';
import { EditorContext } from '../context';
import { useContext, useEffect } from 'react';
import { Omit, is } from 'anux-common';
import { useBound } from 'anux-react-utils';

interface IValidationConfigWithValue<T> {
    value: T;
    isRequired?: boolean;
}

interface IValidationConfigWithoutValue {
    isRequired(): boolean;
}

interface IStandardValidationConfig {
    id: string;
    isDisabled?: boolean;
    isValid?(raiseError: (error: Omit<IValidationError, 'id'>) => void): void;
}

type IValidationConfig<T> = (IValidationConfigWithoutValue | IValidationConfigWithValue<T>) & IStandardValidationConfig;

function defaultRequiredValidation<T>(value: T): boolean {
    if (is.empty(value as any)) { return true; }
    if (value == null) { return true; }
    return false;
}

// @ts-ignore
export function useValidation<T>({ id, isRequired = false, isValid, isDisabled = false, value }: IValidationConfig<T>, dependencies?: any[]): IValidationError {
    const { setValidationErrorsFor, validationErrors } = useContext(EditorContext);

    isValid = is.function(isValid) ? useBound(isValid) : isValid;
    isRequired = is.function(isRequired) ? useBound(isRequired) : isRequired;

    dependencies = (dependencies || []).concat([isRequired, isDisabled, isValid, value]);

    useEffect(() => {
        const newValidationErrors: IValidationError[] = [];

        // make sure we are not disabled (disabled components cannot cause validation errors)
        if (!isDisabled) {

            // isRequired validation
            if (typeof (isRequired) === 'function' || isRequired === true) {
                const requiredCheckFunc = typeof (isRequired) === 'function' ? isRequired : defaultRequiredValidation.bind(null, value);
                if (requiredCheckFunc() === true) {
                    newValidationErrors.push({
                        id,
                        message: 'This field requires a value.',
                        priority: ValidationPriorities.IsRequired,
                    });
                }
            }

            // custom validation
            if (typeof (isValid) === 'function') { isValid(error => newValidationErrors.push({ ...error, id })); }
        }

        // set the validation for this component
        setValidationErrorsFor(id, newValidationErrors);
    }, dependencies);

    useEffect(() => () => setValidationErrorsFor(id, []), []); // clear the validation errors for this component when it is unmounted

    return validationErrors
        .filter(error => error.id === id)
        .orderBy(error => error.priority)
        .firstOrDefault();
}
