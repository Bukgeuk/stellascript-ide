import React from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import '../font.css'
import styles from './ContextMenu.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { read, blockOption } from "../blockTypes";

interface ContextMenuProps {
    query: string,
    setQuery: Function,
    isMenuOpened: boolean,
    menuPos: {x: number, y: number}
}

const MenuItem = (props: {text: string, option: blockOption}) => {
    return (
        <div className={styles.item}>
            <span className={styles.circle} style={{backgroundColor: props.option.color}}></span>
            <span>{props.text}</span>
        </div>
    )
}

function getTextFromContent(content: (string | read.Input | read.Dropdown)[]) {
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

const ContextMenu = React.forwardRef((props: ContextMenuProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    let items

    if (props.isMenuOpened) {
        const list: read.Block[] = window.api.search(props.query)
        items = list.map((item, idx) => {
            const detail = window.api.getDetail(item.tag)
            return (
                <React.Fragment key={idx}>
                    {idx !== 0 && <Line></Line>}
                    <MenuItem text={getTextFromContent(item.content)} option={detail}></MenuItem>
                </React.Fragment>
            )
        })
    }

    return (
        <div id={styles.menu} style={{display: props.isMenuOpened ? 'unset' : 'none', top: props.menuPos.y, left: props.menuPos.x}} onClick={(e) => e.stopPropagation()}>
            <InputGroup id={styles.inputGroup} size="sm">
                <FormControl placeholder="블럭 검색" value={props.query} onChange={(event) => props.setQuery(event.target.value)} ref={ref}></FormControl>
            </InputGroup>
            <div id={styles.list}>
                {props.isMenuOpened && items}
            </div>
        </div>
    )
})

export default ContextMenu;