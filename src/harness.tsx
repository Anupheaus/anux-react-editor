import { createHarness } from 'anux-package';
import { Editor } from './editor';
import { TextField, NumberField, DropdownField, AutocompleteField } from './fields';
import { useBound, CustomTag } from 'anux-react-utils';
import './harness.scss';
import { FunctionComponent } from 'react';

interface IRecord {
    name: string;
    age: number;
    sourceId: string;
    invalidSourceId: string;
}

interface ISource {
    id: string;
    name: string;
}

interface IProps {
    record: IRecord;
}

const ReportRecord: FunctionComponent<IProps> = ({ record }) => {

    const renderProperty = useBound((property: PropertyKey) => (
        <CustomTag key={property.toString()} name="record-property">
            <CustomTag name="record-property-name">{property.toString()}:</CustomTag>
            <CustomTag name="record-property-value">{record[property]}</CustomTag>
        </CustomTag>
    ));

    return (
        <CustomTag name="report-record">
            {Reflect.ownKeys(record).map(renderProperty)}
        </CustomTag>
    );
};

export const editorHarness = createHarness({ name: 'Editor' }, () => {
    let data: IRecord = {
        name: 'Tony',
        age: 38,
        sourceId: '123',
        invalidSourceId: '200',
    };

    const sources: ISource[] = [
        { id: '124', name: 'book' },
        { id: '123', name: 'pen' },
        { id: '125', name: 'notepad' },
    ];

    const handleOnSave = useBound(((record: IRecord) => { data = record; }));

    const loadItems = useBound<() => Promise<ISource[]>>(() => new Promise(resolve => setTimeout(() => resolve(sources), 3000)));

    return (
        <Editor<IRecord>
            className="test-class"
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
                        set={item => update({ ...record, sourceId: item.id })}
                        items={loadItems}
                    >
                        {({ item: { name } }) => (
                            <div>{name}</div>
                        )}
                    </AutocompleteField>

                    <ReportRecord record={record} />
                </>
            )}
        </Editor>
    );
});
