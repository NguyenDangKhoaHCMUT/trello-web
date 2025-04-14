import Box from '@mui/material/Box'
import theme from '~/theme'
import ListColumns from './ListColumns/ListColumns'
import {
  DndContext,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  getFirstCollision
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DnDKetSensors'
import { arrayMove } from '@dnd-kit/sortable'

import { useEffect, useState, useCallback, useRef } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatter'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

// Xac dinh loai item dang keo tha
// activeDragItemType = ACTIVE_DRAG_ITEM_TYPE.COLUMM: keo column
// activeDragItemType = ACTIVE_DRAG_ITEM_TYPE.CARD: keo card
const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMM: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({
  board, createNewColumn,
  createNewCard, moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn,
  deleteColumnDetails
}) {
  // https://docs.dndkit.com/api-documentation/sensors
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: {
  //     distance: 10 // Khoảng cách chuột di chuyển tối thiểu để kích hoạt sự kiện kéo thả
  //   }
  // })
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10 // Khoảng cách chuột di chuyển tối thiểu để kích hoạt sự kiện kéo thả
    }
  })
  // nhấn giữ 250ms mới kéo được
  // Tolerance là khoảng cách tối thiểu giữa vị trí ban đầu và vị trí kéo thả
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 500
    }
  })

  // Ưu tiên dùng kết hợp 2 sensor là mouseSensor và touchSensor để có trải nghiệm tốt nhất trên mobile và desktop
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // cùng 1 thời điểm chỉ có 1 phần tử được kéo thả là column hoặc card
  const [activeDragItemId, setactiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // Điểm va chạm cuối cùng trước đó (xử lý thuật toán phát hiện va chạm (video 37))
  const lastOverId = useRef(null)

  useEffect(() => {
    // Columns đã được sắp xếp ở component cha cao nhất (boards/_id.jsx) rồi (video 71 đã giải thích)
    setOrderedColumns(board.columns)
  }, [board])

  // Tìm column theo cardId (trong trường hợp kéo card giữa các column)
  const findColumnByCardId = (cardId) => {
    // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds vì c.cardOrderIds bởi vì ở trc handleDragOver
    // chúng ta sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }


  // Khởi tạo Function chung xử lý việc
  // cập nhật lại state trong TH di chuyển card giữa 2 column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns(prevColumns => {
      // Tìm vị trí (index) của overCard trong column đích (nơi mà activeCard sắp đc thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Logic tính toán 'cardIndex' mới (trên hoặc dưới của overCard) lấy chuẩn ra từ code của thư viện -
      // nhiều khi muốn từ chối hiểu =)))
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height

      const modifier = isBelowOverItem ? 1 : 0

      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data
      // rồi return - cập nhật lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      // column cũ
      if (nextActiveColumn) {
        // xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó
        // để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Thêm Placeholder card nếu column rỗng: bị kéo hết card đi, không còn cái nào nữa (video 37.2)
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }

        // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      // column mới (cái column mà card sẽ được thả vào)
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo nó có tồn tại ở overColumn hay không, nếu có thì cần xóa nó trc
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card
        // giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id // Cập nhật lại columnId cho card đang kéo
        }
        // bước tiếp theo là thêm cái card đang kéo và overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData )

        // Xóa Placeholder card nếu column không còn rỗng nữa (video 37.2)
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card?.FE_PlaceholderCard)

        // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      // Nếu Func này được gọi từ handleDragEnd nghĩa là đã kéo thả xong,
      // Lúc này mới xử lý gọi API 1 lần ở đây
      if (triggerFrom === 'handleDragEnd') {
        /**
         * Gọi lên props function moveCardToDifferentColumn nằm ở component cha cao nhất (boards/_id.jsx)
         * Lưu ý: Về sau ở học phần MERN Stack Advanced thì chúng ta sẽ đưa dữ liệu Board ra ngoài Redux Global State
         * và lúc này chúng ta có thể gọi API luon ở đây là xong thay vì phải lần lượt gọi ngược lên những
         * component cha phía bên trên (Đối với component con nằm càng sâu thì càng khổ)
         * Việc sử dụng Redux như vậy thì code sẽ Clean chuẩn chỉnh hơn rất nhiều
         */
        /**
         * Phải dùng tới activeDragItemData.columnId hoặc tốt nhất là oldColumnWhenDraggingCard._id
         * (set vào state từ bước handleDragStart) chứ không phải activeData trong scope handleDragEnd này
         * vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật một lần rồi
         */
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        )
      }
      return nextColumns
    })
  }

  // Trigger khi bắt đầu kéo 1 phần tử
  const handleDragStart = (event) => {
    // console.log('Drag start', event)
    setactiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMM)
    setActiveDragItemData(event?.active?.data?.current)

    // Nếu là kéo card thì mới được thực hiện hành động set giá trị oldColumnWhenDraggingCard
    if (event?.active?.data?.current?.columnId) {
      // Nếu kéo card thì cần lưu lại column cũ để xử lý sau này
      const oldColumn = findColumnByCardId(event?.active?.id)
      setOldColumnWhenDraggingCard(oldColumn)
    }
  }

  //Trigger trong quá trình kéo (drag) một phần tử
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMM) {
      // console.log('Card dragged, tạm thời chưa làm gì cả')
      return
    }

    // Còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các columns
    // console.log('Drag over', event)

    const { active, over } = event
    // active: item being dragged (vi tri cu)
    // over: item being dragged over (vi tri moi)

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì
    // (tránh crash trang)
    if (!over || !active) {
      return
    }

    // activeDraggingCard: là cái card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: là cái card đang tương tác trên hoặc dưới so với cái card đang được kéo ở trên
    const { id: overCardId } = over

    // Tìm  2 cái column theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Nếu không tìm thấy column nào thì không làm gì cả
    // (tránh crash trang)
    if (!activeColumn || !overColumn) {
      return
    }


    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau,
    // còn nếu kéo card trong cùng 1 column thì không làm gì cả
    // Vì ở đây đang làm đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi
    // thì nó lại là vấn đề khác ở handleDragEnd
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns (
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  // Trigger khi kết thúc kéo 1 phần tử => hành động thả
  const handleDragEnd = (event) => {
    // console.log('Drag ended', event)
    const { active, over } = event
    // active: item being dragged (vi tri cu)
    // over: item being dragged over (vi tri moi)

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì
    // (tránh crash trang)
    if (!over || !active) {
      return
    }

    // Xử lý kéo thả card ở đây
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard: là cái card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard: là cái card đang tương tác trên hoặc dưới so với cái card đang được kéo ở trên
      const { id: overCardId } = over

      // Tìm  2 cái column theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // Nếu không tìm thấy column nào thì không làm gì cả
      // (tránh crash trang)
      if (!activeColumn || !overColumn) {
        return
      }

      // Hành động kéo thả card giữa 2 column khác nhau
      // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart) chứ không phải activeData
      // trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật
      // một lần rồi
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns (
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      } else {
        // Hành động kéo thả card trong cùng 1 column

        // Lấy vị trí cũ (từ thằng oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // console.log('oldCardIndex', oldCardIndex)
        // Lấy vị trí mới (từ thằng over)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        // console.log('newCardIndex', newCardIndex)

        // Dùng arrayMove vì kéo card trong một cái column thì tương tự với logic
        // kéo column trong một cái board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderedCardsIds = dndOrderedCards.map(card => card._id)

        // console.log('dndOrderedCards', dndOrderedCards)
        // Vẫn gọi update State ở đây để tránh delay hoặc Flickering giao diện lúc kéo thả cần phải chờ gọi
        // API (small trick)
        setOrderedColumns(prevColumns => {
          // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data
          // rồi return - cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm tới cái Column mà chúng ta đang kéo thả card vào
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          // Cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCardsIds

          // Trả về giá trị state mới chuẩn vị trí
          return nextColumns
        })

        /**
         * Gọi lên props function moveCardInTheSameColumn nằm ở component cha cao nhất (boards/_id.jsx)
         * Lưu ý: Về sau ở học phần MERN Stack Advanced thì chúng ta sẽ đưa dữ liệu Board ra ngoài Redux Global State
         * và lúc này chúng ta có thể gọi API luon ở đây là xong thay vì phải lần lượt gọi ngược lên những
         * component cha phía bên trên (Đối với component con nằm càng sâu thì càng khổ)
         * Việc sử dụng Redux như vậy thì code sẽ Clean chuẩn chỉnh hơn rất nhiều
         */
        moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardsIds, oldColumnWhenDraggingCard._id)
      }
    }

    // Xử lý kéo thả column trong 1 cái BoardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMM) {
      // Check if the item being dragged is different from the item being dragged over
      if (active.id !== over.id) {
        // Lấy vị trí cũ (từ thằng active)
        const oldColumnIndex = orderedColumns.findIndex(column => column._id === active.id)
        // Lấy vị trí mới (từ thằng over)
        const newColumnIndex = orderedColumns.findIndex(column => column._id === over.id)
        // Swap the columns in the new order
        // Dùng arrayMove của thg dnd-kit để sắp xếp lại mảng Columns ban đầu
        // Code của arrayMove ở đây: https://github.com/clauderic/dnd-kit/blob/master/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)

        // Vẫn gọi Update State ở đây để tránh delay hoặc Flickering giao diện lúc kéo thả cần phải chờ gọi
        // API (small trick)
        setOrderedColumns(dndOrderedColumns)

        /**
         * Gọi lên props function moveColumns nằm ở component cha cao nhất (boards/_id.jsx)
         * Lưu ý: Về sau ở học phần MERN Stack Advanced thì chúng ta sẽ đưa dữ liệu Board ra ngoài Redux Global State
         * và lúc này chúng ta có thể gọi API luon ở đây là xong thay vì phải lần lượt gọi ngược lên những
         * component cha phía bên trên (Đối với component con nằm càng sâu thì càng khổ)
         * Việc sử dụng Redux như vậy thì code sẽ Clean chuẩn chỉnh hơn rất nhiều
         */
        moveColumns(dndOrderedColumns)
      }
    }

    // Những dữ liệu sau khi kéo thả xong thì cần phải reset lại để tránh bị lỗi
    setactiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  // Animation khi thả phần tử
  // Test bằng cách kéo xong thả trực tiếp và nhìn phần giữ chỗ overlay (vid 32)
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  // Chúng ta sẽ tự custom lại chiến lược/ thuật toán phát hiện va chạm tối ứu cho việc
  // kéo thả card giữa nhiều column khác nhau (video 37 fix bug quan tọng)
  const collisionDetectionStrategy = useCallback((args) => {
    // Trường hợp kéo column thì dùng thuật toán closestCorners là chuẩn nhất
    if (activeDragItemType == ACTIVE_DRAG_ITEM_TYPE.COLUMM) {
      return closestCorners({ ...args })
    }

    // Tìm các điểm giao nhau, va chạm - trả về 1 mảng các va chạm - với con trỏ
    const pointerIntersection = pointerWithin(args)

    // Video 37.1: Nếu pointerIntersection là mảng rỗng, return luôn không cần làm gì cả
    // fix triệt để bug flickering của thư viện dnd-kit trong TH sau:
    // - Kéo card có image cover lớn và kéo lên phía trên cùng ra khỏi khu vực kéo thả
    if (!pointerIntersection?.length) return

    // Thuật toán phát hiện va chạm sẽ trả về 1 mảng các va chạm ở đây
    // (không cần bước này nữa - video 37.1)
    // const intersection = !!pointerIntersection?.length
    //   ? pointerIntersection
    //   : rectIntersection(args)

    // Tìm overId đầu tiên trong đám pointerIntersection ở trên
    let overId = getFirstCollision(pointerIntersection, 'id')

    if (overId) {
      // Video 37: Đoạn này để fix cái vụ flickering nhé
      // Nếu cái overId nó là column thì sẽ tìm tới cái cardId gần nhất bên trong khi vực va chạm đó dựa vào
      // thuật toán phát hiện va chạm closestCenter hoặc closestCorners đều được. Tuy nhiên ở đây dùng
      // closestCorners mình sẽ thấy nó mượt hơn
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        // console.log('overId before', overId)
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return container.id !== overId && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        }) [0]?.id
        // console.log('overId after', overId)
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    // Nếu overId lfa null thì trả về mảng rỗng - tránh bug crash trang
    return lastOverId.current ? [{ id: lastOverId.current }] : []

  }, [activeDragItemType, orderedColumns])

  return (
    <DndContext
      // Cảm biến (đã giải thích kĩ ở vd 30)
      sensors={sensors}
      // Thuật toán phát hiện va chạm (nếu khong có nó thì card với cover lớn sẽ không kéo qua column khác được vì lúc
      // này nó đang bị conflict giữa card với column), chúng ta sẽ dùng closestCorners thay vì closestCenter
      // https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
      // Update vid 37: nếu chỉ dùng closestCorners thì sẽ có bug flickering + sai lệch
      // dữ liệu (xem vid 37 để hiểu rõ hơn)
      // collisionDetection={closestCorners}

      // Tự custom nâng cao thuật tóa phát hiện va chạm (video 37)
      collisionDetection={collisionDetectionStrategy}

      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} createNewColumn={createNewColumn} createNewCard={createNewCard} deleteColumnDetails={deleteColumnDetails}/>
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMM) && <Column column={activeDragItemData}/>}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
