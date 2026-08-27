/**
 * Seat Validation Utility
 * Kiểm tra các quy tắc chọn ghế phía Frontend:
 * 1. Không cho chọn khác loại ghế
 * 2. Không cho chọn cách ghế (chỉ cho phép các ghế liền kề nhau 4 hướng: trên dưới, trái phải)
 * 3. Kiểm tra tính liên thông khi bỏ chọn ghế (không làm đứt đoạn cụm ghế)
 */

/**
 * Kiểm tra 2 ghế có liền kề 4 hướng không
 * @param {Object} seatA { row_letter, seat_number }
 * @param {Object} seatB { row_letter, seat_number }
 * @returns {boolean}
 */
export const areSeatsAdjacent = (seatA, seatB) => {
  if (!seatA || !seatB) return false;

  const rowA = seatA.row_letter.trim().toUpperCase();
  const rowB = seatB.row_letter.trim().toUpperCase();
  const numA = parseInt(seatA.seat_number, 10);
  const numB = parseInt(seatB.seat_number, 10);

  // Kề trái / phải: Cùng hàng, khoảng cách số ghế = 1
  if (rowA === rowB && Math.abs(numA - numB) === 1) {
    return true;
  }

  // Kề trên / dưới: Cùng cột, hàng liền kề (khoảng cách charCode = 1)
  if (numA === numB && Math.abs(rowA.charCodeAt(0) - rowB.charCodeAt(0)) === 1) {
    return true;
  }

  return false;
};

/**
 * Kiểm tra tập ghế có tạo thành 1 cụm liên thông 4 hướng duy nhất không (BFS)
 * @param {Array<Object>} seats 
 * @returns {boolean}
 */
export const areSeatsConnected = (seats) => {
  if (!seats || seats.length <= 1) return true;

  const visited = new Set();
  const queue = [seats[0]];
  visited.add(seats[0].id);

  while (queue.length > 0) {
    const current = queue.shift();

    for (const neighbor of seats) {
      if (!visited.has(neighbor.id) && areSeatsAdjacent(current, neighbor)) {
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    }
  }

  return visited.size === seats.length;
};

/**
 * Kiểm tra tính hợp lệ khi người dùng click chọn thêm ghế mới
 * @param {Array<Object>} currentSelectedSeats - Danh sách object ghế đã chọn
 * @param {Array<Object>} seatsToAdd - Danh sách object ghế muốn chọn thêm (1 ghế hoặc 1 cặp sweetbox)
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateSeatSelection = (currentSelectedSeats, seatsToAdd) => {
  if (!seatsToAdd || seatsToAdd.length === 0) {
    return { isValid: false, error: 'Không có ghế được chọn' };
  }

  // Nếu chưa chọn ghế nào, cho phép chọn ghế đầu tiên (hoặc cặp đầu tiên)
  if (!currentSelectedSeats || currentSelectedSeats.length === 0) {
    return { isValid: true };
  }

  // 1. Kiểm tra cùng loại
  const currentType = currentSelectedSeats[0].type;
  const isAllSameType = seatsToAdd.every((seat) => seat.type === currentType);
  if (!isAllSameType) {
    return {
      isValid: false,
      error: `Chỉ được chọn các ghế cùng loại (${currentType.toUpperCase()}) trong một lần đặt!`
    };
  }

  // 2. Kiểm tra liền kề 4 hướng với các ghế đã chọn
  const isAdjacent = seatsToAdd.some((newSeat) =>
    currentSelectedSeats.some((selectedSeat) => areSeatsAdjacent(selectedSeat, newSeat))
  );

  if (!isAdjacent) {
    return {
      isValid: false,
      error: 'Vui lòng chọn các ghế liền kề nhau (trên/dưới hoặc trái/phải), không được chọn cách ghế!'
    };
  }

  return { isValid: true };
};

/**
 * Kiểm tra tính hợp lệ khi người dùng bỏ chọn ghế (tránh làm đứt đoạn cụm ghế)
 * @param {Array<Object>} remainingSeats - Danh sách ghế còn lại sau khi bỏ chọn
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateSeatDeselection = (remainingSeats) => {
  if (!remainingSeats || remainingSeats.length <= 1) {
    return { isValid: true };
  }

  if (!areSeatsConnected(remainingSeats)) {
    return {
      isValid: false,
      error: 'Không thể bỏ chọn ghế này vì sẽ làm đứt đoạn các ghế còn lại. Vui lòng bỏ chọn từ các ghế ở mép ngoài!'
    };
  }

  return { isValid: true };
};
