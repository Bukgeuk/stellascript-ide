import React, { useState, useEffect, MouseEvent, useRef } from 'react';
import './font.css';
import './App.css';

import ContextMenu from './components/ContextMenu';
import Block from './components/Block';

import { addBlock, addWidth, getCurrentTab, getGrabbingBlock, getMovPos, makeVirtual, move, pushBlock } from './manager';
import { save } from './blockTypes';

import { ZoomContext } from './context';
import { basicInputShapeWidth, normalShapeConstant } from './constant';

function checkSVG(element: Element): boolean {
    while (element.tagName !== 'BODY') {
        if (element.tagName === 'svg') return true
        else element = element.parentElement!
    }
    return false
}

function addTranslate(str: string, dx: number, dy: number): string {
    const pattern = /translate\((-?\d+\.?\d*),\s?(-?\d+\.?\d*)\)/
    const arr = str.match(pattern)
    if (!arr) return str
    return `translate(${parseFloat(arr[1]) + dx}, ${parseFloat(arr[2]) + dy})`
}

const App = () => {
    const [isMenuOpened, setIsMenuOpened] = useState(false)
    const [query, setQuery] = useState('')
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1.0)
    const [isDragging, setIsDragging] = useState(false)
    const [isGrabbing, setIsGrabbing] = useState(false)
    const [grabOffset, setGrabOffset] = useState({ x: 0, y: 0 })
    const [grabPos, setGrabPos] = useState({ x: 0, y: 0 })

    const menuInputRef = useRef<HTMLInputElement>(null)
    const menuListRef = useRef<HTMLDivElement>(null)

    const workspaceRef = useRef<HTMLDivElement>(null)

    const handleClick = () => setIsMenuOpened(false)
    const handleContextMenu = (event: MouseEvent) => {
        setMenuPos({x: event.clientX, y: event.clientY})
        setQuery('')
        menuListRef.current?.scrollTo(0, 0)
        setIsMenuOpened(true);
        menuInputRef.current?.focus()
    }

    useEffect(() => {
        document.addEventListener('click', handleClick)
        document.addEventListener('mousedown', handleMouseDown)
        document.addEventListener('mouseup', handleMouseUp)
        if (isDragging || isGrabbing) document.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.removeEventListener('click', handleClick)
            document.removeEventListener('mousedown', handleMouseDown)
            document.removeEventListener('mouseup', handleMouseUp)
            if (isDragging || isGrabbing) document.removeEventListener('mousemove', handleMouseMove)
        }
    })

    const tab = getCurrentTab()
    const movPos = getMovPos()
    const blocks = tab.map((block, idx) => {
        return (<Block template={block} key={idx} pos={`${idx + 1}`} movPos={movPos}></Block>)
    })

    const grabbingBlock = getGrabbingBlock()

    function generateBlock(block: save.Block) {
        setIsMenuOpened(false)
        const wrect = workspaceRef.current?.getBoundingClientRect()
        const movPos = getMovPos()
        if (wrect) {
            block.pos = {
                x: menuPos.x - wrect.left - movPos.x,
                y: menuPos.y - wrect.top - movPos.y
            }
        }
        addBlock(block)
    }

    function handleWheel(e: React.WheelEvent) {
        if (isDragging || isGrabbing) return
        let nz = zoom - (e.deltaY / 1000)
        if (nz > 2) nz = 2
        else if (nz < 0.5) nz = 0.5
        setZoom(nz)
    }

    let lastElCt: Element | null = null
    let isFixedNx: boolean = false
    let offsetNx = {x: 0, y: 0}
    function handleMouseMove(e: globalThis.MouseEvent) {
        if (isDragging) {
            move(e.movementX, e.movementY)
            const ch = document.getElementById('blockGroup')?.children
            if (ch) {
                for (let i = 0; i < ch.length; i++) {
                    const item = ch.item(i)
                    const tr = item?.getAttribute('transform')
                    if (tr) item?.setAttribute('transform', addTranslate(tr, e.movementX, e.movementY))
                }
            }
        } else if (isGrabbing) {
            const gb = document.getElementById('grabbingBlock')
            const tr = gb?.getAttribute('transform')
            const tx = (e.clientX - grabOffset.x) / zoom
            const ty = (e.clientY - grabOffset.y) / zoom
            if (tr && !isFixedNx) gb?.setAttribute('transform', `scale(${zoom}) translate(${tx}, ${ty})`)

            if (gb) {
                const rect = gb.getBoundingClientRect()
                const elCt = document.elementsFromPoint(rect.x + (10 * zoom), rect.y + (rect.height / 2))
                let flagCt = false
                let iCt = 0
                for (; iCt < elCt.length; iCt++) {
                    if (elCt[iCt].classList.contains('input-shape')) {
                        flagCt = true
                        break
                    }
                }

                if (flagCt) {
                    if (!lastElCt) {
                        elCt[iCt].setAttribute('stroke', '#FFFFFF')
                        lastElCt = elCt[iCt]
                    }
                } else {
                    if (lastElCt) {
                        lastElCt.setAttribute('stroke', '#FF9C00')
                        lastElCt = null
                    }

                    const txNx = rect.x + (10 * zoom), tyNx = rect.y - (10 * zoom)
                    const elNx = document.elementsFromPoint(offsetNx.x === 0 ? txNx : e.clientX + offsetNx.x, offsetNx.y === 0 ? tyNx : e.clientY + offsetNx.y)
                    let flagNx = false
                    let iNx = 0
                    for (; iNx < elNx.length; iNx++) {
                        if (elNx[iNx].classList.contains('block-shape')) {
                            flagNx = true
                            break
                        }
                    }

                    if (flagNx) {
                        const elNxRect = elNx[iNx].parentElement?.getBoundingClientRect()
                        const wrect = workspaceRef.current?.getBoundingClientRect()
                        if (!isFixedNx && elNxRect && wrect) {
                            if (rect.height > normalShapeConstant.shapeHeight && elNxRect.height >= normalShapeConstant.shapeHeight) {
                                gb.setAttribute('transform', `scale(${zoom}) translate(${(elNxRect.x - grabPos.x + (e.clientX - rect.x)) / zoom}, ${(elNxRect.y + elNxRect.height - grabPos.y + (e.clientY - rect.y)) / zoom})`)
                                isFixedNx = true
                                offsetNx = {x: e.clientX - txNx, y: e.clientY - tyNx}
                            }
                        }
                    } else {
                        if (isFixedNx) {
                            isFixedNx = false
                            offsetNx = {x: 0, y: 0}
                        }
                    }
                }
            }
        }
    }

    function handleMouseDown(e: globalThis.MouseEvent) {
        if (e.target instanceof Element) {
            if (e.target.tagName === 'svg') {
                setIsDragging(true)
            } else if (checkSVG(e.target)) {
                let element = e.target as HTMLElement
                while (true) {
                    if (element.classList.contains('block')) break
                    else if (element.classList.contains('block-input')) return
                    else element = element.parentElement!
                }

                const pos = element.dataset.blockPos
                if (pos) {
                    const pl = pos.split('.')
                    let dx, dy
                    if (pl.length !== 1) {
                        const brect = element.getBoundingClientRect()
                        dx = brect.x - movPos.x
                        dy = brect.y - movPos.y
                        const wrect = workspaceRef.current?.getBoundingClientRect()
                        if (wrect) {
                            dx -= wrect.x
                            dy -= wrect.y
                        }
                    } else {
                        dx = 0
                        dy = 0
                    }
                    
                    const rect = element.getBoundingClientRect()
                    if (rect) {
                        if (pl[pl.length - 2] === '0') addWidth(-rect.width + basicInputShapeWidth, pl.slice(0, -2).join('.'))
                    }

                    makeVirtual(pos, dx, dy)
                    setGrabOffset({ x: e.clientX, y: e.clientY })
                    setGrabPos({ x: e.clientX, y: e.clientY })
                    setIsGrabbing(true)
                }
            }
        }
    }

    function handleMouseUp(e: globalThis.MouseEvent) {
        if (isDragging) {
            setIsDragging(false)
        } else if (isGrabbing) {
            let gb = getGrabbingBlock()
            const rect = document.getElementById('grabbingBlock')?.getBoundingClientRect()

            if (isFixedNx) {
                if (gb && rect) {
                    
                }
            } else {
                const place = (gb: save.Block) => {
                    let opx = 0, opy = 0
                    if (gb.pos) {
                        opx = gb.pos.x
                        opy = gb.pos.y
                    }
                    gb.pos = {
                        x: opx + (e.clientX - grabOffset.x),
                        y: opy + (e.clientY - grabOffset.y)
                    }

                    addBlock(gb)
                }
            
                if (gb && e.target instanceof Element) {
                    if (rect) {
                        const el = document.elementsFromPoint(rect.x + 10, rect.y + (rect.height / 2))
                        let flag = false
                        let i = 0
                        for (; i < el.length; i++) {
                            if (el[i].classList.contains('input-shape')) {
                                flag = true
                                break
                            }
                        }
                        if (!flag) place(gb)
                        else {
                            const pos = (el[i].parentElement as HTMLElement).dataset.blockPos
                            if (pos) {
                                const arr = pos.split('.')
                                if (arr[arr.length - 2] === '0') addWidth(rect.width - basicInputShapeWidth, arr.slice(0, -2).join('.'))

                                pushBlock(gb, pos)
                            }
                            else place(gb)
                        }
                    } else {
                        place(gb)
                    }
                }
            }

            setIsGrabbing(false)
        }
    }

    return (
        <React.Fragment>
            <ContextMenu isMenuOpened={isMenuOpened} menuPos={menuPos} query={query} setQuery={setQuery} refs={{input: menuInputRef, list: menuListRef}} handleClick={generateBlock}></ContextMenu>
            <div id='app'>
                <div id='explorer'>

                </div>
                <div id='workspace' onContextMenu={handleContextMenu} ref={workspaceRef}>
                    <ZoomContext.Provider value={zoom}>
                        <svg id='workspaceSvg' xmlns="http://www.w3.org/2000/svg" onWheel={handleWheel}>
                            <text fontSize={12} id='getTextWidth' y={-300}></text>
                            <g id='blockGroup' transform={`scale(${zoom})`}>
                                {blocks}
                            </g>
                            {isGrabbing &&
                            <g id='grabbingBlock' className='virtual' transform={`scale(${zoom}) translate(${(grabPos.x - grabOffset.x) / zoom}, ${(grabPos.y - grabOffset.y) / zoom})`}>
                                <Block template={grabbingBlock!} pos='0' movPos={movPos}></Block>
                            </g>}
                        </svg>
                    </ZoomContext.Provider>
                </div>
            </div>
        </React.Fragment>
    );
}

export default App;
