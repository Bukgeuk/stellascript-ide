import { contextBridge, app } from 'electron'
import * as isDev from 'electron-is-dev'
import * as fs from 'fs-extra'
import * as path from 'path'
import { read } from '../src/blockTypes'

let textArr: Array<string>
let blockArr: Array<read.Block>

let getBlockDetailByTag: Map<string, blockOption>

interface blockOption {
    color: string,
    stroke: string,
    spacename: string[]
}

function toTextForSearch(text: string) {
    return text.replace(/ /g, '').toLowerCase()
}

function isReadBlock(member: read.Block | read.Namespace): member is read.Block {
    return (member as read.Block).tag !== undefined
}

contextBridge.exposeInMainWorld(
    'api', {
        load: (callback: Function) => {
            /*if (isDev) {

            } else {
                const appdata = app.getPath('appData')
                fs.existsSync(path.join(appdata, 'addon'))
            }*/

            const space: read.Namespace = fs.readJSONSync(path.join(__dirname, 'assets', 'blocks.json'))

            function solve(members: (read.Block | read.Namespace)[], option: blockOption) {
                members.forEach((member) => {
                    if (isReadBlock(member)) {
                        let text = ''
                        member.content.forEach((value) => {
                            if (typeof value === 'string')
                                text += toTextForSearch(value)
                        })
                    
                        textArr.push(text)
                        blockArr.push(member)
                        getBlockDetailByTag.set(member.tag, option)
                    } else {
                        option.spacename.push(member.name)
                        solve(member.members, { color: member.color, stroke: member.stroke, spacename: option.spacename })
                    }
                })
            }

            solve(space.members, { color: space.color, stroke: space.stroke, spacename: [space.name] })

            callback()
        },
        search: (text: string, callback: Function) => {
            let list = Array<read.Block>()
            const st = toTextForSearch(text)

            textArr.forEach((value, idx) => {
                if (value.includes(st))
                    list.push(blockArr[idx])
            })

            callback(list)
        }
    }
)