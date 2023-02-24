import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function (element) {
    return [
        {
            id: 'name',
            element,
            component: Component,
            isEdited: isTextFieldEntryEdited
        }
    ];
}

function Component(props) {
    console.log('props', props)
    const { element, id } = props;

    const modeling = useService('modeling');
    const translate = useService('translate');
    const debounce = useService('debounceInput');

    const getValue = () => {
        return element.businessObject.name || '';
    }

    const setValue = value => {
        return modeling.updateProperties(element, {
            name: value
        });
    }

    return <TextFieldEntry
        id={id}
        element={element}
        description={translate('first cumstom panel prop')}
        label={translate('Cool Guys!')}
        getValue={getValue}
        setValue={setValue}
        debounce={debounce}
    />
}
