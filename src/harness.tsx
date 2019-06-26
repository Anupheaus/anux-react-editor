import { createHarness } from 'anux-package';
import { Editor, TextField, NumberField, DropdownField, AutocompleteField, DateTimeField, DateTimeModes, ToggleField, EditorContext } from './';
import { useBound, CustomTag } from 'anux-react-utils';
import styles from './harness.css';
import { FunctionComponent, useContext, useState } from 'react';
import { Button, Switch } from '@material-ui/core';

interface IRecord {
  name: string;
  age: number;
  sourceId: string;
  invalidSourceId: string;
  date: number;
  switch: boolean;
}

interface ISource {
  id: string;
  name: string;
}

interface IProps {
  record: IRecord;
}

const ReportRecord: FunctionComponent<IProps> = ({ record }) => {

  const formatValue = (value: any) => {
    switch (typeof (value)) {
      case 'boolean':
        return value === true ? 'true' : 'false';
      default:
        return value;
    }
  };

  const renderProperty = (property: PropertyKey) => (
    <CustomTag key={property.toString()} name="record-property">
      <CustomTag name="record-property-name">{property.toString()}:</CustomTag>
      <CustomTag name="record-property-value">{formatValue(record[property])}</CustomTag>
    </CustomTag>
  );

  return (
    <CustomTag name="report-record" className={styles.reports.block}>
      {Reflect.ownKeys(record).map(renderProperty)}
    </CustomTag>
  );
};

const Toolbar: FunctionComponent = () => {
  const { cancel, save, isDirty, validationErrors, busyFields } = useContext(EditorContext);
  return (
    <CustomTag name="harness-editor-toolbar">
      <Switch checked={isDirty} disabled={true} />
      <span>{validationErrors.length}</span>&nbsp;&nbsp;&nbsp;
      <span>{busyFields.length}</span>
      <Button onClick={cancel}>Cancel</Button>
      <Button onClick={save} color="primary">Save</Button>
    </CustomTag>
  );
};

export const editorHarness = createHarness({ name: 'Editor' }, () => {
  const [data, setData] = useState<IRecord>({
    name: 'Tony',
    age: 38,
    sourceId: '123',
    invalidSourceId: '200',
    date: (new Date((new Date()).toUTCString())).valueOf(),
    switch: true,
  });

  const sources: ISource[] = [
    { id: '124', name: 'book' },
    { id: '123', name: 'pen' },
    { id: '125', name: 'notepad' },
  ];

  const handleOnSave = useBound(async (record: IRecord) => {
    setData(record);
    await Promise.delay(1000);
  });

  const loadItems = useBound<() => Promise<ISource[]>>(() => new Promise(resolve => setTimeout(() => resolve(sources), 3000)));

  return (
    <Editor<IRecord>
      className={styles.editor}
      record={data}
      onSave={handleOnSave}
    >
      {({ record, update }) => (
        <>
          <TextField
            label="Text Field"
            get={record.name}
            set={value => update({ ...record, name: value })}
            isRequired
          />
          <TextField
            label="Text Field (Read Only)"
            get={record.name}
          />
          <NumberField
            label="Number Field"
            get={record.age}
            set={age => update({ ...record, age })}
            decimalPlaces={0}
          />
          <DropdownField<ISource>
            label="Dropdown Field"
            get={record.sourceId}
            set={item => update({ ...record, sourceId: item.id })}
            items={loadItems}
          >
            {({ name }) => (
              <div>{name}</div>
            )}
          </DropdownField>
          <DropdownField<ISource>
            label="Invalid Dropdown Field"
            get={record.invalidSourceId}
            set={item => update({ ...record, invalidSourceId: item.id })}
            items={loadItems}
          >
            {({ name }) => (
              <div>{name}</div>
            )}
          </DropdownField>
          <AutocompleteField<ISource>
            label="Autocomplete Field"
            get={record.sourceId}
            set={item => update({ ...record, sourceId: item ? item.id : undefined })}
            items={loadItems}
            getTextFromItem={item => item.name}
            isRequired={true}
          >
            {({ item: { name }, text }) => (
              <div>{name} ({text})</div>
            )}
          </AutocompleteField>
          <DateTimeField
            label="Date Time Field"
            get={record.date}
            set={date => update({ ...record, date })}
          />
          <DateTimeField
            label="Date Field"
            mode={DateTimeModes.DateOnly}
            get={record.date}
            set={date => update({ ...record, date })}
          />
          <DateTimeField
            label="Time Field"
            mode={DateTimeModes.TimeOnly}
            get={record.date}
            set={date => update({ ...record, date })}
          />
          <ToggleField
            label="Switch Field"
            get={record.switch}
            set={value => update({ ...record, switch: value })}
          />
          <Toolbar />
          <CustomTag name="harness-reports" className={styles.reports.container}>
            <ReportRecord record={data} />
            <ReportRecord record={record} />
          </CustomTag>
        </>
      )}
    </Editor>
  );
});
