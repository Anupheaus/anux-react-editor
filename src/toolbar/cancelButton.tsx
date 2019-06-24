import { FunctionComponent, useContext } from 'react';
import { Button } from '@material-ui/core';
import { EditorContext } from '../context';
import { useBound } from 'anux-react-utils';

interface IProps {

}

export const EditorCancelButton: FunctionComponent<IProps> = ({ }) => {
  const { cancel } = useContext(EditorContext);

  const onClick = useBound(() => {
    cancel();
  });

  return (
    <Button
      onClick={onClick}
    >
      Cancel
    </Button>
  );
};
