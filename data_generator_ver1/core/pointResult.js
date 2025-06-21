// pointResult.js
import { ValueVariant } from './valueTypes.js';

/**
 * PointResult의 JavaScript 구현
 * 한 점(Point)의 메타데이터 + 결과를 담는 클래스
 */
export class PointResult {
    constructor(params) {
        this.dimNumber = params.dimNumber;
        this.dimNames = params.dimNames;
        this.dimRangeMin = params.dimRangeMin;
        this.dimRangeMax = params.dimRangeMax;
        this.dimInterval = params.dimInterval;
        this.coordinateNum = params.coordinateNum;
        this.value = params.value;
        
        this.validate();
    }

    validate() {
        // 차원 수 검증
        if (!Number.isInteger(this.dimNumber) || this.dimNumber < 1) {
            throw new Error('dimNumber must be a positive integer');
        }

        // 배열 길이 검증
        const arrays = [
            this.dimNames,
            this.dimRangeMin,
            this.dimRangeMax,
            this.dimInterval,
            this.coordinateNum
        ];

        arrays.forEach((arr, index) => {
            if (!Array.isArray(arr) || arr.length !== this.dimNumber) {
                const names = ['dimNames', 'dimRangeMin', 'dimRangeMax', 'dimInterval', 'coordinateNum'];
                throw new Error(`${names[index]} must be an array of length ${this.dimNumber}`);
            }
        });

        // 범위 검증
        for (let i = 0; i < this.dimNumber; i++) {
            if (this.dimRangeMin[i] >= this.dimRangeMax[i]) {
                throw new Error(`dimRangeMin[${i}] must be less than dimRangeMax[${i}]`);
            }
            if (this.dimInterval[i] <= 0) {
                throw new Error(`dimInterval[${i}] must be positive`);
            }
            if (this.coordinateNum[i] < this.dimRangeMin[i] || 
                this.coordinateNum[i] > this.dimRangeMax[i]) {
                throw new Error(`coordinateNum[${i}] must be within range [${this.dimRangeMin[i]}, ${this.dimRangeMax[i]}]`);
            }
        }

        // ValueVariant 검증
        if (!(this.value instanceof ValueVariant)) {
            throw new Error('value must be an instance of ValueVariant');
        }
    }

    toString() {
        const coords = this.coordinateNum.map((coord, i) => 
            `${this.dimNames[i]}: ${coord.toFixed(4)}`
        ).join(', ');
        
        return `Point(${coords}) => ${this.value.toString()}`;
    }

    toJSON() {
        return {
            dimNumber: this.dimNumber,
            dimNames: this.dimNames,
            dimRangeMin: this.dimRangeMin,
            dimRangeMax: this.dimRangeMax,
            dimInterval: this.dimInterval,
            coordinateNum: this.coordinateNum,
            value: {
                type: this.value.type,
                value: this.value.value
            }
        };
    }

    static fromJSON(json) {
        const value = new ValueVariant(json.value.type, json.value.value);
        return new PointResult({
            ...json,
            value
        });
    }
}