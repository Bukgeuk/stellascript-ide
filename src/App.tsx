import React, { useState, useEffect, MouseEvent, useRef } from 'react';
import './font.css';
import './App.css';

import ContextMenu from './components/ContextMenu';

const App = () => {
    const [isMenuOpened, setIsMenuOpened] = useState(false)
    const [query, setQuery] = useState('')
    const [menuPos, setMenuPos] = useState({x: 0, y: 0})

    const menuInputRef: React.RefObject<HTMLInputElement> = useRef(null)

    const handleClick = () => setIsMenuOpened(false)
    const handleContextMenu = (event: MouseEvent) => {
        setMenuPos({x: event.clientX, y: event.clientY})
        setQuery('')
        setIsMenuOpened(true);
        menuInputRef.current?.focus()
    }

    useEffect(() => {
        document.addEventListener('click', handleClick)

        return () => {
            document.removeEventListener('click', handleClick)
        }
    })

    return (
        <React.Fragment>
            <div id='getTextWidth'></div>
            <ContextMenu isMenuOpened={isMenuOpened} menuPos={menuPos} query={query} setQuery={setQuery} ref={menuInputRef}></ContextMenu>
            <div id='workspace' onContextMenu={handleContextMenu}>
                <svg xmlns="http://www.w3.org/2000/svg">
                    <g id='blockGroup'>

                    </g>
                </svg>
            </div>
        </React.Fragment>
    );
}

export default App;
