import { useRef } from 'react';

export function useFieldId(fieldType: string): string {
    const idRef = useRef(`${fieldType}-${Math.uniqueId()}`);
    return idRef.current;
}
