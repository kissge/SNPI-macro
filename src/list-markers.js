const headers = [
  null,
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    .split('')
    .map(c => `(${c})`),
  '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => c + ')'),
  'ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅺⅻ'.split('').map(c => c + '.'),
]

function rewriteLists() {
  document
    .querySelectorAll('.notion-numbered_list-block > div > div:first-child > span')
    .forEach(span => {
      let count = 0
      let cursor = span
      while (cursor) {
        if (cursor.classList.contains('notion-numbered_list-block')) ++count
        cursor = cursor.parentElement
      }

      if ((count - 1) % headers.length === 0) {
        span.classList.remove('snpi__number')
        span.parentElement.classList.toggle('snpi__force-bold-item', count === 1)
      } else {
        const header = headers[(count - 1) % headers.length]
        span.classList.add('snpi__number')
        span.dataset.header = header[(Number.parseInt(span.innerText) - 1) % header.length]
        span.parentElement.classList.remove('snpi__force-bold-item')
      }
    })

  document
    .querySelectorAll(
      '.notion-bulleted_list-block > div > div:first-child > div:not(.notion-selectable)',
    )
    .forEach(div => {
      let count = 0
      let cursor = div
      while (cursor) {
        if (cursor.classList.contains('notion-bulleted_list-block')) ++count
        cursor = cursor.parentElement
      }

      div.dataset.depth = (count - 1) % 5
      div.parentElement.classList.toggle('snpi__force-bold-item', count === 1)
    })
}

document.addEventListener('keydown', () => setTimeout(rewriteLists, 50))
document.addEventListener('mouseup', () => setTimeout(rewriteLists, 50))
setInterval(rewriteLists, 1000)
