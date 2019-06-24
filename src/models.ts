export enum ValidationPriorities {
    Low,
    IsRequired,
    Medium,
    High,
    Important,
    Critical,
}

export interface IValidationError {
    id?: string;
    message: string;
    priority: ValidationPriorities;
}
