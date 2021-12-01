import React from "react";
import { read } from '../blockTypes'

function getTextWidth(text: string): number {
    const el = document.getElementById('getTextWidth')
    if (el) {
        el.innerText = text
        return el.getBoundingClientRect().width
    }
    return 0
}

const Block = (props: { template: read.Block }) => {
    return (
        <g>

        </g>
    )
}

export default Block;