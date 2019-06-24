import { createContext } from 'react';
import { IDialog } from 'anux-common';

interface IToolbarContext {
  showDialog(dialog: IDialog): Promise<void>;
}

export const ToolbarContext = createContext<IToolbarContext>({
  showDialog: Function.emptyAsync(),
});
