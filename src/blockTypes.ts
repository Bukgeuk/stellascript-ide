export namespace base {
    export type primitiveType = 'int' | 'string' | 'char' | 'float' | 'complex' | 'bool' | 'type'
    export type scopeType = 'none' | 'normal' | 'frameless'
    export type sizeType = 'small' | 'normal'
    export type inputType = primitiveType | 'name'

    export interface DropdownItem {
        tag: string,
        text: string
    }
}

export namespace read {
    export interface Namespace {
        color: string,
        stroke: string,
        name: string,
        members: (Block | Namespace)[]
    }

    export interface Dropdown {
        item: base.DropdownItem[]
    }

    export interface ChildBlock {
        tag: string
    }

    export interface Input {
        type: base.inputType[] | 'any'
        value: string | ChildBlock
    }
    
    export interface Block {
        tag: string,
        content: (string | Input | Dropdown)[]
        scope: base.scopeType,
        size: base.sizeType,
        returnType: base.primitiveType | 'void'
    }
}

export namespace save {
    export interface Dropdown {
        item: base.DropdownItem[]
        selected: number
    }
    
    export interface Input {
        type: base.inputType[] | 'any',
        value: string | Block
    }
    
    export interface Block {
        tag: string,
        pos: {x: number, y : number} | null,
        width: number,
        color: string,
        stroke: string,
        content: (string | Input | Dropdown)[]
        scope: base.scopeType,
        size: base.sizeType,
        children: Block | null,
        next: Block | null,
        returnType: base.primitiveType | 'void'
    }
}

export interface blockOption {
    color: string,
    stroke: string,
    spacename: string[]
}

export namespace typeCheck {
    export function isSaveInput(element: save.Input | save.Dropdown | save.Block): element is save.Input {
        return (element as save.Input).type !== undefined
    }
    
    export function isSaveBlock(element: save.Input | save.Dropdown | save.Block): element is save.Block {
        return (element as save.Block).tag !== undefined
    }
    
    export function isReadBlock(element: read.Block | read.Dropdown | read.Input | read.Namespace): element is read.Block {
        return (element as read.Block).tag !== undefined
    }
    
    export function isReadInput(element: read.Block | read.Dropdown | read.Input | read.Namespace): element is read.Input {
        return (element as read.Input).type !== undefined
    }
}

declare global {
    interface Window {
        api: any
    }
}