import { contextBridge } from 'electron'
import * as fs from 'fs-extra'
import { read, blockOption, save, typeCheck } from '../src/blockTypes'
import * as path from 'path'
import { getTextWidth } from '../src/function/utils'
import { basicInputShapeWidth, blockPadding, blockSpace } from '../src/constant'

let text2idx = new Array<string>()
let idx2block = new Array<save.Block>()

let tag2block = new Map<string, save.Block>()

function toTextForSearch(text: string) {
    return text.replace(/ /g, '').toLowerCase()
}

function read2save(block: read.Block, option: blockOption): save.Block {
    let width = blockPadding * 2

    const content: (string | save.Input | save.Dropdown)[] = block.content.map((value) => {
        width += blockSpace
        if (typeof value === 'string') {
            const lw = width
            width += getTextWidth(value, 12)
            return value
        } else if (typeCheck.isReadInput(value)) {
            let v
            if (typeof value.value === 'string') {
                v = value.value
                const lw = width
                width += getTextWidth(value.value, 10) + basicInputShapeWidth
            } else {
                v = tag2block.get(value.value.tag)
                width += v ? v.width : basicInputShapeWidth
                if (!v) v = ''
                const lw = width
            }
            return {
                type: value.type,
                value: v
            }
        } else {
            return {
                item: value.item,
                selected: 0
            }
        }
    })

    return {
        tag: block.tag,
        pos: null,
        width: width - blockSpace,
        content: content,
        scope: block.scope,
        size: block.size,
        color: option.color,
        stroke: option.stroke,
        children: null,
        next: null,
        returnType: block.returnType
    }
}

function load() {
    const space: read.Namespace = fs.readJSONSync(path.join(__dirname, 'assets', 'blocks.json'))
    
    function solve(members: (read.Block | read.Namespace)[], option: blockOption) {
        members.forEach((member) => {
            if (typeCheck.isReadBlock(member)) {
                let text = ''
                member.content.forEach((value) => {
                    if (typeof value === 'string')
                        text += toTextForSearch(value)
                    else
                        text += '~'
                })
                const sb = read2save(member, option)
                text2idx.push(text)
                idx2block.push(sb)
                tag2block.set(member.tag, sb)
            } else {
                option.spacename.push(member.name)
                solve(member.members, { color: member.color, stroke: member.stroke, spacename: option.spacename })
            }
        })
    }
    solve(space.members, { color: space.color, stroke: space.stroke, spacename: [space.name] })
}

function search(text: string) : save.Block[] {
    let list = Array<save.Block>()
    if (text.length === 0) {
        return idx2block
    } else {
        const st = toTextForSearch(text)
        text2idx.forEach((value, idx) => {
            if (value.includes(st))
                list.push(idx2block[idx])
        })
        return list
    }  
}

contextBridge.exposeInMainWorld(
    'api', {
        load: () => {
            load()
        },
        search: (text: string) => {
            return search(text)
        }
    }
)