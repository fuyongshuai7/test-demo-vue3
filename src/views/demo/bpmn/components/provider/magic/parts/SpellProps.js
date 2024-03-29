import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function (element) {

  return [
    {
      id: 'spell',
      element,
      component: Spell,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function Spell(props) {
  console.log('props', props)
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.spell || '';
  }

  const setValue = value => {
    return modeling.updateProperties(element, {
      spell: value
    });
  }

  // 官方这边返回的是一个jsx的格式，改成js写法
  return TextFieldEntry({
    id: id,
    description: translate('Apply a black magic spell'),
    label: translate('Spell'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  })
}
