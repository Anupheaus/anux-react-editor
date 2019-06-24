import { FunctionComponent, useContext } from 'react';
import { EditorContext } from '../context';
import { Button } from '@material-ui/core';
import { useBound } from 'anux-react-utils';
import { ToolbarContext } from './toolbarContext';
import { IDialog } from 'anux-common';

const createNotDirtyDialog = (): IDialog => ({
  message: 'No fields have been changed.',
  autoHideAfterMilliseconds: 3000,
});

interface IProps {

}

export const EditorSaveButton: FunctionComponent<IProps> = ({ }) => {
  const { save, isDirty } = useContext(EditorContext);
  const { showDialog } = useContext(ToolbarContext);
  const onClick = useBound(async () => {
    if (!isDirty) { await showDialog(createNotDirtyDialog()); }
  });

  return (
    <Button
      color="primary"
      onClick={onClick}
    >
      Save
    </Button>
  );
};
