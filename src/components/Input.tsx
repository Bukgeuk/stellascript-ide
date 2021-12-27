import React, { useRef } from 'react'
import { base } from '../blockTypes'
import { basicInputShapeWidth, normalShapeY, smallShapeY, basicInputWidth } from '../constant';
import { getTextWidth } from '../function/utils';
import styles from './Input.module.css'

interface InputProps {
    inputValue: string,
    setInputValue: Function,
    size: base.sizeType,
    x: number,
    addWidth: Function
}

const Input = (props: InputProps) => {
    const fInputRef = useRef<HTMLInputElement>(null)

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const str = event.target.value
        let nShapeWidth = basicInputShapeWidth
        if (str) {
            nShapeWidth += getTextWidth(str, 10)
        }
        props.addWidth(nShapeWidth - shapeWidth)
        props.setInputValue(str)
    }

    function handleClick() {
        fInputRef.current?.focus()
    }

    let fInputWidth = basicInputWidth
    let shapeWidth = basicInputShapeWidth
    let fx = shapeWidth - fInputWidth

    if (props.inputValue) {
        fInputWidth = getTextWidth(props.inputValue, 10)
        shapeWidth += fInputWidth
        fx = (shapeWidth - fInputWidth) / 2
    }

    return (
        <g className="block-input">
            <rect className="input-shape" x={props.x} y={props.size === 'small' ? smallShapeY : normalShapeY} rx="8" ry="8" width={shapeWidth}
                height="20" fill="#ffde82" stroke="#FF9C00" strokeLinejoin="round" strokeLinecap="round" cursor="text" onClick={handleClick}></rect>
            <foreignObject x={props.x + fx} y={props.size === 'small' ? -4 : -1} width={fInputWidth} height="21">
                <input className={styles.foreignInput} type="text" value={props.inputValue} onChange={handleChange} ref={fInputRef}></input>
            </foreignObject>
        </g>
    )
}

export default Input;