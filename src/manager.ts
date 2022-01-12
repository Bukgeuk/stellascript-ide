import { save, typeCheck } from './blockTypes'
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

export function getComponent(pos: string): save.Block | save.Input | null {
    const pl = pos.split('.').map((item) => parseInt(item) - 1)

    let element = tabs[currentTab][pl[0]]
    let idx = 1
    let isNext = false
    let ncount = 0
    if (pl.length <= idx) {
        return tabs[currentTab][pl[0]]
    }
    while (pl.length > idx) {
        if (isNext) {
            ncount++
            if (ncount === pl[idx]) {
                isNext = false
                idx++
            }
            if (element.next) element = element.next
            else return null
        } else {
            if (pl[idx] === -1) {
                idx++
                const r = element.content[pl[idx]]
                if (typeof r !== 'string') {
                    if (typeCheck.isSaveInput(r)) {
                        if (pl.length - 1 === idx && typeof r.value === 'string') {
                            return r
                        } else if (typeof r.value !== 'string') {
                            element = r.value
                            idx++
                            break
                        }
                    }
                }
                return null
            } else {
                element = element.children!
                isNext = true
                ncount = 0
            }
        }
    }

    return element
}

export function pushBlock(block: save.Block, pos: string): boolean {
    const cp = getComponent(pos)
    if (cp) {
        if (typeCheck.isSaveBlock(cp)) {

        } else {
            cp.value = block
        }
        return true
    } else return false
}

export function popBlock(pos: string): save.Block | null {
    const pl = pos.split('.').map((item) => parseInt(item) - 1)

    let copy
    let element = tabs[currentTab][pl[0]]
    let idx = 1
    let isNext = false
    let ncount = 0
    if (pl.length <= idx) {
        copy = deepClone(element)
        delete tabs[currentTab][pl[0]]
    }
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
            if (element.next) element = element.next
            else if (copy) return copy
            else return null
        } else {
            if (pl[idx] === -1) {
                idx++
                
                const r = element.content[pl[idx]]
                if (typeof r !== 'string') {
                    if (typeCheck.isSaveInput(r)) {
                        if (typeof r.value !== 'string') {
                            element = r.value
                            if (pl.length - 1 === idx) {
                                copy = deepClone(r.value)
                                r.value = ''
                            }
                            idx++
                            break
                        }
                    }
                }
                if (copy) return copy
            } else {
                if (element.children) element = element.children
                else if (copy) return copy
                else return null
                isNext = true
                ncount = 0
            }
        } 
    }

    return copy
}

export function updateBlock() {
    
}

export function makeVirtual(pos: string) {
    grabbingBlock = popBlock(pos)
}

export function getGrabbingBlock(): save.Block | null {
    return grabbingBlock
}

export function addWidth(width: number, pos: string) {
    const pl = pos.split('.').map((item) => parseInt(item) - 1)

    let element = tabs[currentTab][pl[0]]
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
                        if (element.next)
                            element.next.width += width
                    }
                    isNext = false
                    idx++
                }
                if (element.next)
                    element = element.next
            } else {
                if (pl[idx] === -1) {
                    idx++
                    const r = element.content[pl[idx]]
                    if (typeof r !== 'string') {
                        if (typeCheck.isSaveInput(r)) {
                            if (typeof r.value !== 'string') {
                                if (pl.length - 1 === idx) {
                                    r.value.width += width
                                }
                                element = r.value
                                idx++
                                break
                            }
                        }
                    }
                    
                    
                } else {
                    if (element.children)
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