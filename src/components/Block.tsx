import React, { useState, useContext } from "react";
import { typeCheck, save } from '../blockTypes'
import { basicInputShapeWidth, blockPadding, blockSpace, normalShapeConstant, smallShapeConstant } from "../constant";
import { getTextWidth } from "../function/utils";
import { addWidth, getCurrentTab } from "../manager";
import './Block.css'

import Input from "./Input";

import { ZoomContext } from "../context";

const NoneScopeShape = (props: {width: number, color: string, stroke: string, size: string}) => {
    return (
        <rect className="block-shape" x="0" y="0" rx="8" ry="8" width={props.width}
        height={props.size === 'small' ? smallShapeConstant.shapeHeight : normalShapeConstant.shapeHeight} fill={props.color} stroke={props.stroke} strokeLinejoin="round" strokeLinecap="round"></rect>
    )
}

const NormalScopeShape = (props: {width: number, color: string, stroke: string}) => {
    return (
        <path className="block-shape"
            d={`m 8 0 h ${props.width + 10 - 20} c 4.5 0 8 3.5 8 8 v 12 c 0 4.5 -3.5 8 -8 8 H 18 c -3.5 0 -6 2.5 -6 6 v 5 c 0 3.5 2.5 6 6 6 h ${props.width - 20} a 7.5 7.5 0 0 1 0 15 H 8 c -4.5 0 -8 -3.5 -8 -8 V 8 c 0 -4.5 3.5 -8 8 -8 z`}
            fill={props.color} stroke={props.stroke} strokeLinejoin="round" strokeLinecap="round">
        </path>
    )
}

const Block = (props: { template: save.Block, pos: string, addWidth: Function | null, update: Function | null }) => {
    let stateArr = Array<string>()
    let [update, setUpdate] = useState(false)

    props.template.content.forEach((item) => {
        if (typeof item !== 'string') {
            if (typeCheck.isSaveInput(item)) {
                if (typeof item.value === 'string' && item.value !== '')
                    stateArr.push(item.value)
                else
                    stateArr.push('')
            }
        }
    })
    const [inputValues, setInputValues] = useState(stateArr)

    function setInputValue(value: string, idx: number) {
        const nlist = inputValues.slice()
        nlist[idx] = value
        setInputValues(nlist)
    }

    function addWidthInInput(width: number) {
        addWidth(width, props.pos);
        if (props.addWidth)
            props.addWidth(width)
        if (props.update)
            props.update()
    }

    function addWidthBlock(width: number) {
        addWidth(width, props.pos)
    }

    const c = props.template.size === 'small' ? smallShapeConstant : normalShapeConstant

    let currentX = blockPadding // 왼쪽 element들의 너비, 패딩 합
    let i = 0
    const content = props.template.content.map((item, idx) => {
        let widthToAdd = 0
        let ret
        if (typeof item === 'string') {
            widthToAdd += getTextWidth(item, 12)
            ret = <text fontSize={12} key={idx} x={currentX} y={c.textY} fill="white">{item}</text>
        } else if (typeCheck.isSaveInput(item)) {
            const ti = i
            i++
            if (typeof item.value === 'string') {
                widthToAdd += getTextWidth(inputValues[ti], 10) + basicInputShapeWidth
                ret = <Input size={props.template.size} x={currentX} key={idx} inputValue={inputValues[ti]} setInputValue={(v: string) => setInputValue(v, ti)} addWidth={addWidthInInput}></Input>
            }
            else {
                widthToAdd += item.value.width
                ret = <g transform={`translate(${currentX}, 0)`} key={idx}><Block template={item.value} pos={`${props.pos}.0.${idx + 1}`} addWidth={addWidthBlock} update={() => setUpdate(!update)}></Block></g>
            }
            
        } else {
            ret = <div></div>
        }
        currentX += widthToAdd + blockSpace
        return ret
    })
    currentX -= blockSpace
    currentX += blockPadding

    function handleDrag() {

    }

    const zoom = useContext(ZoomContext)

    return (
        <g className="block" transform={props.template.pos ? `translate(${props.template.pos.x / zoom}, ${props.template.pos.y / zoom})` : ''} data-block-pos={props.pos} onDrag={handleDrag}>
            {props.template.scope === 'normal' ?
            <NormalScopeShape color={props.template.color} stroke={props.template.stroke} width={currentX}></NormalScopeShape> :
            <NoneScopeShape color={props.template.color} stroke={props.template.stroke} size={props.template.size} width={currentX}></NoneScopeShape>}
            <g className="block-content">
                {content}
            </g>
        </g>
    )
}

export default Block;