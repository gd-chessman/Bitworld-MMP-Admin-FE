export const truncateString = (str: string | null | undefined, maxLength: number): string => {
    // Kiểm tra nếu str là null, undefined hoặc chuỗi rỗng
    if (!str || str.length === 0) {
      return '';  // Hoặc trả về một giá trị mặc định khác tùy nhu cầu
    }
  
    // Nếu độ dài của str nhỏ hơn hoặc bằng maxLength, trả về str nguyên vẹn
    if (str.length <= maxLength) {
      return str;
    }
  
    // Nếu str dài hơn maxLength, cắt chuỗi và thêm "..." vào giữa
    const halfLength = Math.floor(maxLength / 2) - 1;
    return str.slice(0, halfLength) + "..." + str.slice(str.length - halfLength);
  };