import { IValidationError, ValidationPriorities } from '../models';
import { EditorContext } from '../context';
import { useContext, useEffect, useRef } from 'react';
import { Omit } from 'anux-common';

interface IValidationConfig<T> {
    value: T;
    isRequired?: boolean | (() => boolean);
    isDisabled?: boolean;
    isValid?(value: T, raiseError: (error: Omit<IValidationError, 'id'>) => void): void;
}

function defaultRequiredValidation<T>(value: T): boolean {
    if (typeof (value) === 'string' && value.length === 0) { return false; }
    if (value == null) { return false; }
    return true;
}

export function useValidation<T>({ value, isRequired = false, isValid, isDisabled = false }: IValidationConfig<T>): IValidationError {
    const { setValidationErrorsFor, validationErrors } = useContext(EditorContext);
    const id = useRef(Math.uniqueId());

    useEffect(() => {
        const newValidationErrors: IValidationError[] = [];

        // make sure we are not disabled (disabled components cannot cause validation errors)
        if (!isDisabled) {

            // isRequired validation
            if (typeof (isRequired) === 'function' || isRequired === true) {
                const requiredCheckFunc = typeof (isRequired) === 'function' ? isRequired : defaultRequiredValidation.bind(null, value);
                if (requiredCheckFunc() !== true) {
                    newValidationErrors.push({
                        id: id.current,
                        message: 'This field requires a value.',
                        priority: ValidationPriorities.IsRequired,
                    });
                }
            }

            // custom validation
            if (typeof (isValid) === 'function') { isValid(value, error => newValidationErrors.push({ ...error, id: id.current })); }
        }

        // set the validation for this component
        setValidationErrorsFor(id.current, newValidationErrors);
    }, [value, isDisabled]);

    useEffect(() => () => setValidationErrorsFor(id.current, []), []); // clear the validation errors for this component when it is unmounted

    return validationErrors
        .filter(error => error.id === id.current)
        .orderBy(error => error.priority)
        .firstOrDefault();
}
