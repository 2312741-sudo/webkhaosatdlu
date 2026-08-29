/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dlu: {
          // Tông màu chính: Xanh lá đậm (rêu) thương hiệu DLU
          primary: '#1B4D3E',      // Xanh lá đậm / Rêu chính
          dark: '#0F5132',         // Xanh rêu đậm sâu
          hover: '#143D31',        // Hover xanh rêu
          light: '#E8F3EE',        // Nền xanh nhạt
          
          // Tông màu nhấn: Vàng đất / Vàng đồng (Ochre)
          accent: '#C9A227',       // Vàng đất / Vàng đồng chính
          gold: '#B8860B',         // Vàng đồng đậm
          'gold-light': '#FDF6E2', // Nền vàng nhạt
          
          // Tông màu cờ / điểm nhấn cảnh báo
          red: '#C0392B',          // Đỏ cờ / đỏ biểu trưng
          'red-dark': '#962D22',
          
          // Tông màu nền
          bg: '#F7F7F5',           // Nền xám rất nhạt chuẩn công lập
          card: '#FFFFFF',
          sidebar: '#143D31',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Roboto', 'Noto Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
