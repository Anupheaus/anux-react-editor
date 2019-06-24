import { useContext } from 'react';
import { EditorContext } from '../context';

export function useFieldBusy(id: string) {
    const { setFieldBusyState } = useContext(EditorContext);
    return (isBusy: boolean) => setFieldBusyState(id, isBusy);
}
