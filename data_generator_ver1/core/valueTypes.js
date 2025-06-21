// valueTypes.js
/**
 * ValueVariant의 JavaScript 구현
 * C++의 std::variant를 JavaScript 객체로 표현
 */

export const ValueType = {
    DOUBLE: 'double',
    VECTOR: 'vector',
    RANGE: 'range',
    LABEL_NUMBER: 'labelNumber',
    LABEL_VECTOR: 'labelVector'
};

export class ValueVariant {
    constructor(type, value) {
        this.type = type;
        this.value = value;
        this.validate();
    }

    validate() {
        switch (this.type) {
            case ValueType.DOUBLE:
                if (typeof this.value !== 'number') {
                    throw new Error('DOUBLE type requires a number value');
                }
                break;
            
            case ValueType.VECTOR:
                if (!Array.isArray(this.value) || !this.value.every(v => typeof v === 'number')) {
                    throw new Error('VECTOR type requires an array of numbers');
                }
                break;
            
            case ValueType.RANGE:
                if (!Array.isArray(this.value) || this.value.length !== 2 || 
                    !this.value.every(v => typeof v === 'number')) {
                    throw new Error('RANGE type requires an array of two numbers [min, max]');
                }
                break;
            
            case ValueType.LABEL_NUMBER:
                if (!this.value.label || typeof this.value.label !== 'string' ||
                    typeof this.value.number !== 'number') {
                    throw new Error('LABEL_NUMBER type requires {label: string, number: number}');
                }
                break;
            
            case ValueType.LABEL_VECTOR:
                if (!this.value.label || typeof this.value.label !== 'string' ||
                    !Array.isArray(this.value.vector) || 
                    !this.value.vector.every(v => typeof v === 'number')) {
                    throw new Error('LABEL_VECTOR type requires {label: string, vector: number[]}');
                }
                break;
            
            default:
                throw new Error(`Unknown value type: ${this.type}`);
        }
    }

    toString() {
        switch (this.type) {
            case ValueType.DOUBLE:
                return this.value.toFixed(4);
            
            case ValueType.VECTOR:
                if (this.value.length === 2) {
                    return `(${this.value[0].toFixed(2)}, ${this.value[1].toFixed(2)})`;
                } else if (this.value.length === 3) {
                    return `(${this.value[0].toFixed(2)}, ${this.value[1].toFixed(2)}, ${this.value[2].toFixed(2)})`;
                } else {
                    return `[${this.value.map(v => v.toFixed(2)).join(', ')}]`;
                }
            
            case ValueType.RANGE:
                return `[${this.value[0].toFixed(4)}, ${this.value[1].toFixed(4)}]`;
            
            case ValueType.LABEL_NUMBER:
                return `{${this.value.label}: ${this.value.number.toFixed(4)}}`;
            
            case ValueType.LABEL_VECTOR:
                const vecStr = this.value.vector.length <= 3 
                    ? `(${this.value.vector.map(v => v.toFixed(2)).join(', ')})`
                    : `[${this.value.vector.map(v => v.toFixed(2)).join(', ')}]`;
                return `{${this.value.label}: ${vecStr}}`;
            
            default:
                return 'Unknown';
        }
    }
}