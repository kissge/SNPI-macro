import browser from 'webextension-polyfill'
import Mousetrap from 'mousetrap'

Mousetrap.prototype.stopCallback = () => false

const countAncestors = (div) => {
    let i = 0
    while (div && !div.classList.contains('notion-page-content')) {
        div = div.parentElement
        ++i
    }
    return i
}

const getParticipantsList = () => {
    const lines = Array.from(document.querySelectorAll('.notion-page-content [contenteditable]'))

    while (lines.length > 0 && !lines[0].textContent.includes('参加者')) {
        lines.shift()
    }

    if (lines.length < 2) {
        return []
    }

    const headerDepth = countAncestors(lines.shift())
    const baseDepth = countAncestors(lines[0])
    const words = []
    while (lines.length > 0) {
        const div = lines.shift()
        const depth = countAncestors(div)
        if (depth > baseDepth) {
            continue
        }
        if (depth <= headerDepth) {
            break
        }

        const word = div.textContent.trim()
        if (word === '') {
            break
        }

        words.push(word)
    }

    return words.map(word => {
        for (let i = 1; i <= word.length; ++i) {
            const short = word.substr(0, i)
            if (words.every(word2 => word === word2 || word2.substr(0, i) !== short)) {
                return short
            }
        }

        return word
    }).map(word => `${word}：`)
}

const updateName = (id) => {
    const names = getParticipantsList()
    let textToInsert

    if (typeof id === typeof 0) {
        if (id > names.length) {
            return
        }

        textToInsert = names[id - 1]
    }

    const selection = document.getSelection()
    let { focusNode, focusOffset } = selection

    let current = { name: '', i: -1 }
    names.forEach((name, i) => {
        if (selection.anchorNode.textContent.substr(0, name.length) === name) {
            current = { name, i }
        }
    })

    if (id === 'next') {
        textToInsert = names[current.i === -1 ? 0 : (current.i + 1) % names.length]
    } else if (id === 'prev') {
        textToInsert = names[current.i === -1 ? names.length - 1 : (current.i + names.length - 1) % names.length]
    }

    selection.setBaseAndExtent(selection.anchorNode, 0, selection.anchorNode, current.name.length)
    document.execCommand('insertText', true, textToInsert)

    if (focusNode.nodeType !== Node.TEXT_NODE) {
        if (focusNode.firstChild && focusNode.firstChild.nodeType === Node.TEXT_NODE) {
            focusNode = focusNode.firstChild
        } else {
            return
        }
    }

    focusOffset += textToInsert.length - current.name.length
    selection.setBaseAndExtent(focusNode, focusOffset, focusNode, focusOffset)
}

for (let i = 1; i <= 9; ++i) {
    Mousetrap.bind(`ctrl+alt+${i}`, () => updateName(i))
}
Mousetrap.bind('ctrl+alt+j', () => updateName('next'))
Mousetrap.bind('ctrl+alt+k', () => updateName('prev'))

console.info('SNPI Macro is ready')
