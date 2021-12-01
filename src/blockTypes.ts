export namespace base {
    export type primitiveType = 'int' | 'string' | 'char' | 'float' | 'complex' | 'bool'
    export type scopeType = 'none' | 'normal' | 'frameless'
    export type inputType = primitiveType | 'name'
}

export namespace read {
    export interface Namespace {
        color: string,
        stroke: string,
        name: string,
        members: (Block | Namespace)[]
    }

    export interface DropdownItem {
        tag: string,
        text: string
    }
        
    export interface Dropdown {
        item: DropdownItem[]
    }

    export interface Input {
        type: base.inputType
    }
    
    export interface Block {
        tag: string,
        content: (string | Input | Dropdown)[]
        scope: base.scopeType,
        returnType: base.primitiveType | 'void'
    }
}

export namespace save {
    export interface DropdownItem {
        tag: string,
        text: string
    }
    
    export interface Dropdown {
        item: DropdownItem[]
        selected: number
    }
    
    export interface Input {
        type: base.inputType,
        value: string | Block
    }
    
    export interface Block {
        tag: string,
        color: string,
        stroke: string,
        content: (string | Input | Dropdown)[]
        scope: base.scopeType,
        children: Block[],
        returnType: base.primitiveType | 'void'
    }
}