import { contextBridge } from 'electron'
import * as fs from 'fs-extra'
import { read, blockOption } from '../src/blockTypes'
import * as path from 'path'

let text2idx = new Array<string>()
let idx2block = new Array<read.Block>()

let tag2blockdetail = new Map<string, blockOption>()

function toTextForSearch(text: string) {
    return text.replace(/ /g, '').toLowerCase()
}

function isReadBlock(member: read.Block | read.Namespace): member is read.Block {
    return (member as read.Block).tag !== undefined
}

function load() {
    const space: read.Namespace = fs.readJSONSync(path.join(__dirname, 'assets', 'blocks.json'))
    
    function solve(members: (read.Block | read.Namespace)[], option: blockOption) {
        members.forEach((member) => {
            if (isReadBlock(member)) {
                let text = ''
                member.content.forEach((value) => {
                    if (typeof value === 'string')
                        text += toTextForSearch(value)
                    else
                        text += '~'
                })
            
                text2idx.push(text)
                idx2block.push(member)
                tag2blockdetail.set(member.tag, option)
            } else {
                option.spacename.push(member.name)
                solve(member.members, { color: member.color, stroke: member.stroke, spacename: option.spacename })
            }
        })
    }
    solve(space.members, { color: space.color, stroke: space.stroke, spacename: [space.name] })
}

function search(text: string) : read.Block[] {
    let list = Array<read.Block>()
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

function getDetail(tag: string) : blockOption | undefined {
    return tag2blockdetail.get(tag)
}

contextBridge.exposeInMainWorld(
    'api', {
        load: () => {
            load()
        },
        search: (text: string) => {
            return search(text)
        },
        getDetail: (tag: string) => {
            return getDetail(tag)
        }
    }
)