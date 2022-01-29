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

function __f(e: save.Block[], n: number | number[], m: boolean) {
    if (Array.isArray(n)) {
        let element: save.Block | null = e[n[0]]
        let v
        if (m) v = n[1] - 1
        else v = n[1]
        for (let i = 0; i < v; i++) {
            if (!element) return null
            element = element.next
        }
        return element
    } else return e[n]
}

function __t(n: number | number[]) {
    if (Array.isArray(n)) return n[0]
    else return n
}

export function getComponent(pos: string): save.Block | save.Input | null {
    const pl = pos.split('.').map(item => {
        if (item.includes('>'))
            return item.split('>').map(element => parseInt(element) - 1)
        else
            return (parseInt(item) - 1)
    })

    let element = __f(tabs[currentTab], pl[0], false)
    let idx = 1
    let isNext = false
    let ncount = 0
    if (pl.length <= idx || !element) {
        return element
    }
    while (pl.length > idx) {
        if (isNext) {
            ncount++
            if (ncount === __t(pl[idx])) {
                isNext = false
                idx++
            }
            if (element.next) element = element.next
            else return null
        } else {
            if (__t(pl[idx]) === -1) {
                idx++
                const r: string | save.Input | save.Dropdown = element.content[__t(pl[idx])]
                if (typeof r !== 'string') {
                    if (typeCheck.isSaveInput(r)) {
                        if (pl.length - 1 === idx && typeof r.value === 'string') {
                            return r
                        } else if (typeof r.value !== 'string') {
                            element = r.value
                            idx++
                            continue
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
            block.pos = { x: 0, y: 0 }
            cp.value = block
        }
        return true
    } else return false
}

export function popBlock(pos: string): save.Block | null {
    const pl = pos.split('.').map(item => {
        if (item.includes('>'))
            return item.split('>').map(element => parseInt(element) - 1)
        else
            return (parseInt(item) - 1)
    })

    let copy
    let element = __f(tabs[currentTab], pl[0], true)
    let idx = 1
    let isNext = false
    let ncount = 0
    if (!element) return null
    else if (pl.length <= idx) {
        if (element.next) {
            copy = deepClone(element.next)
            element.next = null
        } else {
            copy = deepClone(element)
            delete tabs[currentTab][__t(pl[0])]
        }
    }
    else {
        if (element.next) element = element.next
    }
    
    while (pl.length > idx) {
        if (isNext) {
            ncount++
            if (ncount === __t(pl[idx])) {
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
            if (__t(pl[idx]) === -1) {
                idx++
                
                const r: string | save.Input | save.Dropdown = element.content[__t(pl[idx])]
                if (typeof r !== 'string') {
                    if (typeCheck.isSaveInput(r)) {
                        if (typeof r.value !== 'string') {
                            element = r.value
                            if (pl.length - 1 === idx) {
                                copy = deepClone(r.value)
                                r.value = ''
                            }
                            idx++
                            continue
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

export function makeVirtual(pos: string, dx?: number, dy?: number) {
    const block = popBlock(pos)
    if (dx && dy && block) {
        if (dx !== 0 || dy !== 0) {
            block.pos = {
                x: dx,
                y: dy
            }
        }    
    }
    grabbingBlock = block
}

export function getGrabbingBlock(): save.Block | null {
    return grabbingBlock
}

export function addWidth(width: number, pos: string) {
    const pl = pos.split('.').map(item => {
        if (item.includes('>'))
            return item.split('>').map(element => parseInt(element) - 1)
        else
            return (parseInt(item) - 1)
    })

    let element = __f(tabs[currentTab], pl[0], false)
    let idx = 1
    let isNext = false
    let ncount = 0

    if (!element) return
    else if (pl.length === 1) element.width += width
    else {
        while (pl.length > idx) {
            element.width += width
            if (isNext) {
                ncount++
                if (ncount === __t(pl[idx])) {
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
                if (__t(pl[idx]) === -1) {
                    idx++
                    const r: string | save.Input | save.Dropdown = element.content[__t(pl[idx])]
                    if (typeof r !== 'string') {
                        if (typeCheck.isSaveInput(r)) {
                            if (typeof r.value !== 'string') {
                                if (pl.length - 1 === idx) {
                                    r.value.width += width
                                }
                                element = r.value
                                idx++
                                continue
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