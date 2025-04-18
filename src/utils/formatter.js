export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}


// Video 37.2 hàm generatePlaceholderCard: Cách xử lý trong logic thư viện DndKit khi Column là rỗng
// Phía FE sẽ tự tạo ra một cái card đặc biệt: Placeholder, không liên quan đến BE
// Card đặc biệt này sẽ được ẩn ở giao diện UI của người dùng
// Cấu trúc Id của cái card này để Unique rất đơn giản, không cần phải làm random phức tạp:
// "columnId-placeholder-card" (mỗi column chỉ có thể có tối đa một cái Placeholder card)
// Quan trọng khi tạo: Phải đầy đủ (_id, boardId, columnId, FE_PlaceholderCard)
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}