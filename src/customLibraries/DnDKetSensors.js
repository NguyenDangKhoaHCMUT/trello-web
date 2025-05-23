// https://github.com/clauderic/dnd-kit/issues/477
import {
  MouseSensor as DnDKitMouseSensor,
  TouchSensor as DnDKitTouchSensor
} from '@dnd-kit/core'

// Block DnD event propagation if element have 'data-no-dnd' attribute
const handler = ({ nativeEvent: event }) => {
  let cur = event.target

  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false
    }
    cur = cur.parentElement
  }

  return true
}

export class MouseSensor extends DnDKitMouseSensor {
  static activators = [{ eventName: 'onMouseDown', handler }]
}

export class TouchSensor extends DnDKitTouchSensor {
  static activators = [{ eventName: 'onTouchStart', handler }]
}
