import { IDialog, is } from 'anux-common';
import { FunctionComponent } from 'react';
import { EditorSaveButton } from './saveButton';
import { EditorCancelButton } from './cancelButton';
import { CustomTag, useBound } from 'anux-react-utils';
import './toolbar.scss';
import { ToolbarContext } from './toolbarContext';

interface IProps {
  onShowDialog(dialog: IDialog): Promise<void>;
}

export const EditorToolbar: FunctionComponent<IProps> = ({
  onShowDialog,
  children,
}) => {

  const showDialog = useBound((dialog: IDialog) => {
    if (!is.function(onShowDialog)) { return; }
  });

  return (
    <CustomTag name="anux-editor-toolbar">
      <ToolbarContext.Provider value={{ showDialog }}>
        <CustomTag name="anux-editor-toolbar-custom">
          {children || null}
        </CustomTag>
        <EditorCancelButton />
        <EditorSaveButton />
      </ToolbarContext.Provider>
    </CustomTag>
  );
};
