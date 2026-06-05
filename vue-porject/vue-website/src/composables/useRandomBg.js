// 所有背景图片文件名（位于 public/back/ 下）
const POOL = [
  'bg_01.jpg', 'bg_02.jpg', 'bg_03.jpg', 'bg_04.jpg', 'bg_05.jpg',
  'bg_06.jpg', 'bg_07.jpeg', 'bg_08.jpg', 'bg_09.jpg', 'bg_10.jpg',
  'bg_11.jpg', 'bg_12.jpg', 'bg_13.jpg', 'bg_14.jpg', 'bg_15.jfif',
  'bg_16.jpg', 'bg_17.png', 'bg_18.png', 'bg_19.png', 'bg_20.jpg',
  'bg_21.jpg', 'bg_22.jpg', 'bg_23.jpg', 'bg_24.png'
]

// 模块级变量：记录上一次使用的索引，避免连续重复
let lastIndex = -1

export function useRandomBg() {
  let index
  do {
    index = Math.floor(Math.random() * POOL.length)
  } while (index === lastIndex && POOL.length > 1)
  lastIndex = index

  return `/back/${POOL[index]}`
}
