export function getTextWidth(text: string, size: number): number {
    const el = document.getElementById('getTextWidth')
    if (el) {
        el.textContent = text
        el.style.fontSize = `${size}px`
        return el.getBoundingClientRect().width
    }
    return 0
}

export function deepClone(obj: any) {
    if (obj === null || obj === undefined || typeof obj !== "object") {
        return obj
    }

    const ret = (Array.isArray(obj) ? [] : {}) as {[key: string]: any}

    for (let key of Object.keys(obj)) {
        ret[key] = deepClone(obj[key])
    }

    return ret
}