import React from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import '../font.css'
import styles from './ContextMenu.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { save } from "../blockTypes";

interface ContextMenuProps {
    query: string,
    setQuery: Function,
    isMenuOpened: boolean,
    handleClick: Function,
    menuPos: {x: number, y: number},
    refs: {
        input: React.Ref<HTMLInputElement>
        list: React.Ref<HTMLDivElement>
    }
}

const MenuItem = (props: {block: save.Block, handleClick: Function}) => {
    return (
        <div className={styles.item} onClick={() => props.handleClick(props.block)}>
            <span className={styles.circle} style={{backgroundColor: props.block.color}}></span>
            <span>{getTextFromContent(props.block.content)}</span>
        </div>
    )
}

function getTextFromContent(content: (string | save.Input | save.Dropdown)[]) {
    let ret = ''
    content.forEach((item) => {
        if (typeof item === 'string') {
            ret += item + ' '
        } else {
            ret += '~ '
        }
    })
    return ret.slice(0, ret.length - 1)
}

const Line = () => {
    return <div className={styles.line}></div>
}

const ContextMenu = (props: ContextMenuProps) => {
    let items

    if (props.isMenuOpened) {
        const list: save.Block[] = window.api.search(props.query)
        items = list.map((item, idx) => {
            return (
                <React.Fragment key={idx}>
                    {idx !== 0 && <Line></Line>}
                    <MenuItem block={item} handleClick={props.handleClick}></MenuItem>
                </React.Fragment>
            )
        })
    }

    return (
        <div id={styles.menu} style={{top: props.isMenuOpened ? props.menuPos.y : -1500, left: props.menuPos.x}} onClick={(e) => e.stopPropagation()}>
            <InputGroup id={styles.inputGroup} size="sm">
                <FormControl placeholder="블럭 검색" value={props.query} onChange={(event) => props.setQuery(event.target.value)} ref={props.refs.input}></FormControl>
            </InputGroup>
            <div id={styles.list} ref={props.refs.list}>
                {props.isMenuOpened && items}
            </div>
        </div>
    )
}

export default ContextMenu;