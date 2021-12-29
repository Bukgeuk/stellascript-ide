import { save } from './blockTypes'
import { deepClone } from './function/utils'

let tabs: Array<Array<save.Block>> = [[]]
let movpos: Array<{ x: number, y: number }> = [{ x: 0, y: 0 }]
let currentTab: number = 0
let grabbingBlock: save.Block | null = null

export function addBlock(block: save.Block) {
    tabs[currentTab].push(block)
}

export function getCurrentTab() {
    return tabs[currentTab]
}

export function popBlock(pos: string): save.Block {
    const pl = pos.split('.').map((item) => parseInt(item) - 1)

    let copy
    let element: any = tabs[currentTab][pl[0]]
    let idx = 1
    let isNext = false
    let ncount = 0
    while (pl.length > idx) {
        if (isNext) {
            ncount++
            if (ncount === pl[idx]) {
                if (pl.length - 1 === idx) {
                    copy = deepClone(element.next)
                    element.next = null
                }
                isNext = false
                idx++
            }
            element = element.next
        } else {
            if (pl[idx] === -1) {
                idx++
                if (pl.length - 1 === idx) {
                    copy = deepClone(element.content[pl[idx]])
                    element.content[pl[idx]] = ''
                }
                element = element.content[pl[idx]]
                idx++
            } else {
                element = element.children
                isNext = true
                ncount = 0
            }
        } 
    }
    
    return copy
}

export function makeVirtual(pos: string) {
    grabbingBlock = popBlock(pos)
}

export function getGrabbingBlock(): save.Block | null {
    return grabbingBlock
}

export function addWidth(width: number, pos: string) {
    const pl = pos.split('.').map((item) => parseInt(item) - 1)

    let element: any = tabs[currentTab][pl[0]]
    let idx = 1
    let isNext = false
    let ncount = 0
    if (pl.length === 1) {
        element.width += width
    } else {
        while (pl.length > idx) {
            if (isNext) {
                ncount++
                if (ncount === pl[idx]) {
                    if (pl.length - 1 === idx) {
                        element.next.width += width
                    }
                    isNext = false
                    idx++
                }
                element = element.next
            } else {
                if (pl[idx] === -1) {
                    idx++
                    if (pl.length - 1 === idx) {
                        element.content[pl[idx]].value.width += width
                    }
                    element = element.content[pl[idx]]
                    idx++
                    
                } else {
                    element = element.children
                    isNext = true
                    ncount = 0
                }
            } 
        }
    }
}

export function move(x: number, y: number) {
    movpos[currentTab] = {
        x: movpos[currentTab].x + x,
        y: movpos[currentTab].y + y
    }
}

export function getMovPos(): { x: number, y: number } {
    return movpos[currentTab]
}