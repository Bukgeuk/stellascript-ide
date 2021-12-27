import React, { useState, useEffect, MouseEvent, useRef } from 'react';
import './font.css';
import './App.css';

import ContextMenu from './components/ContextMenu';
import Block from './components/Block';

import { addBlock, getCurrentTab, getGrabbingBlock } from './manager';
import { save } from './blockTypes';

import { ZoomContext } from './context';

const App = () => {
    const [isMenuOpened, setIsMenuOpened] = useState(false)
    const [query, setQuery] = useState('')
    const [menuPos, setMenuPos] = useState({x: 0, y: 0})
    const [zoom, setZoom] = useState(1.0)

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

        return () => {
            document.removeEventListener('click', handleClick)
        }
    })

    const tab = getCurrentTab()
    const blocks = tab.map((block, idx) => {
        return (<Block template={block} key={idx} pos={`${idx + 1}`} addWidth={null} update={null}></Block>)
    })

    const grabbingBlock = getGrabbingBlock()

    function generateBlock(block: save.Block) {
        setIsMenuOpened(false)
        const wrect = workspaceRef.current?.getBoundingClientRect()
        if (wrect) {
            block.pos = {
                x: menuPos.x - wrect.left,
                y: menuPos.y - wrect.top
            }
        }
        addBlock(block)
    }

    function handleWheel(e: React.WheelEvent) {
        setZoom(zoom - (e.deltaY / 1000))
    }

    return (
        <React.Fragment>
            <ContextMenu isMenuOpened={isMenuOpened} menuPos={menuPos} query={query} setQuery={setQuery} refs={{input: menuInputRef, list: menuListRef}} handleClick={generateBlock}></ContextMenu>
            <div id='workspace' onContextMenu={handleContextMenu} ref={workspaceRef}>
                <ZoomContext.Provider value={zoom}>
                    <svg xmlns="http://www.w3.org/2000/svg" onWheel={handleWheel}>
                        <text fontSize={12} id='getTextWidth' y={-300}></text>
                        <g id='grabbingBlock' transform={`scale(${zoom})`}>
                            {grabbingBlock && <Block template={grabbingBlock} pos='0' addWidth={null} update={null}></Block>}
                        </g>
                        <g id='blockGroup' transform={`scale(${zoom})`}>
                            {blocks}
                        </g>
                    </svg>
                </ZoomContext.Provider>
            </div>
        </React.Fragment>
    );
}

export default App;
