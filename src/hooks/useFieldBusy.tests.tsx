import { FunctionComponent } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { EditorContext } from '../context';
import { useFieldBusy } from './useFieldBusy';

describe('hooks - useFieldBusy', () => {

  interface IProps {
    id: string;
    isBusy: boolean;
  }

  const Component: FunctionComponent<IProps> = ({ id, isBusy }) => {
    const setBusy = useFieldBusy(id);
    setBusy(isBusy);
    return null;
  };

  function createComponent(id: string, setFieldBusyState: (id: string, isBusy: boolean) => void) {

    return mount(<EditorContext.Provider value={{ ...{} as any, setFieldBusyState }}><Component id={id} isBusy={false} /></EditorContext.Provider>);
  }

  function setIsBusy(component: ReactWrapper<any, Readonly<{}>, any>, isBusy: boolean): void {
    const id = component.find(Component).prop('id');
    component.setProps({
      children: (
        <Component id={id} isBusy={isBusy} />
      ),
    });
  }

  it('can be instantiated', () => {
    let id: string;
    let isBusy: boolean;
    const component = createComponent('something', (innerId, innerIsBusy) => {
      id = innerId;
      isBusy = innerIsBusy;
    });

    expect(id).to.eq('something');
    expect(isBusy).to.be.false;
    setIsBusy(component, true);
    expect(isBusy).to.be.true;
  });

});
