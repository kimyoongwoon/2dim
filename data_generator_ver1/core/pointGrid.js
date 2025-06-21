// pointGrid.js
import { ValueVariant } from './valueTypes.js';

/**
 * GridState의 JavaScript 구현
 * PointGrid가 관리하는 내부 상태
 */
class GridState {
    constructor() {
        this.initialized = false;
        this.dimNumber = 0;
        this.dimNames = [];
        this.dimRangeMin = [];
        this.dimRangeMax = [];
        this.dimInterval = [];
        this.dims = [];
        this.data = [];
    }
}

/**
 * PointGrid의 JavaScript 구현
 * n차원 PointResult를 저장/조회할 수 있는 그리드 클래스
 */
export class PointGrid {
    constructor(names) {
        this.state = new GridState();
        this.state.dimNames = [...names];
    }

    /**
     * PointResult를 그리드에 추가
     * @param {PointResult} pr 추가할 PointResult
     */
    addPoint(pr) {
        if (!this.state.initialized) {
            this.initialize(pr);
        }

        const idx = new Array(this.state.dimNumber);
        for (let i = 0; i < this.state.dimNumber; i++) {
            const offset = pr.coordinateNum[i] - this.state.dimRangeMin[i];
            let index = Math.round(offset / this.state.dimInterval[i]);
            // 인덱스가 범위를 벗어나지 않도록 보장
            index = Math.max(0, Math.min(index, this.state.dims[i] - 1));
            idx[i] = index;
        }

        this.state.data[this.flatIndex(idx)] = pr.value;
    }

    /**
     * 실수 좌표로 값을 조회
     * @param {number[]} coords 차원별 실제 좌표값 배열
     * @returns {ValueVariant} 해당 위치의 값
     */
    getValueAtCoords(coords) {
        const idx = new Array(this.state.dimNumber);
        for (let i = 0; i < this.state.dimNumber; i++) {
            const offset = coords[i] - this.state.dimRangeMin[i];
            let index = Math.round(offset / this.state.dimInterval[i]);
            // 인덱스가 범위를 벗어나지 않도록 보장
            index = Math.max(0, Math.min(index, this.state.dims[i] - 1));
            idx[i] = index;
        }
        return this.getValueAtIndex(idx);
    }

    /**
     * 정수 인덱스로 값을 조회
     * @param {number[]} idx 차원별 정수 인덱스 배열
     * @returns {ValueVariant} 해당 위치의 값
     */
    getValueAtIndex(idx) {
        const flatIdx = this.flatIndex(idx);
        if (flatIdx < 0 || flatIdx >= this.state.data.length) {
            throw new Error('Index out of bounds');
        }
        return this.state.data[flatIdx];
    }

    /**
     * 차원 수 반환
     * @returns {number} 차원 수
     */
    getDimNumber() {
        return this.state.dimNumber;
    }

    /**
     * 각 축별 인덱스 개수 반환
     * @returns {number[]} 차원별 크기
     */
    getDims() {
        return [...this.state.dims];
    }

    /**
     * 축 이름 반환
     * @returns {string[]} 차원별 이름
     */
    getDimNames() {
        return [...this.state.dimNames];
    }

    /**
     * 모든 데이터 포인트 반환 (디버깅/시각화용)
     * @returns {Array} 모든 데이터 포인트
     */
    getAllPoints() {
        const points = [];
        const indices = new Array(this.state.dimNumber).fill(0);
        
        const addPoints = (dimIdx) => {
            if (dimIdx === this.state.dimNumber) {
                const coords = indices.map((idx, i) => 
                    this.state.dimRangeMin[i] + idx * this.state.dimInterval[i]
                );
                const value = this.state.data[this.flatIndex(indices)];
                if (value) {
                    points.push({
                        coordinates: coords,
                        indices: [...indices],
                        value: value
                    });
                }
                return;
            }
            
            for (let i = 0; i < this.state.dims[dimIdx]; i++) {
                indices[dimIdx] = i;
                addPoints(dimIdx + 1);
            }
        };
        
        if (this.state.initialized) {
            addPoints(0);
        }
        return points;
    }

    /**
     * 그리드 초기화
     * @private
     */
    initialize(pr) {
        this.state.dimNumber = pr.dimNumber;
        this.state.dimRangeMin = [...pr.dimRangeMin];
        this.state.dimRangeMax = [...pr.dimRangeMax];
        this.state.dimInterval = [...pr.dimInterval];

        this.state.dims = new Array(this.state.dimNumber);
        let total = 1;
        
        for (let i = 0; i < this.state.dimNumber; i++) {
            this.state.dims[i] = Math.floor(
                (this.state.dimRangeMax[i] - this.state.dimRangeMin[i]) / this.state.dimInterval[i]
            ) + 1;
            total *= this.state.dims[i];
        }

        this.state.data = new Array(total).fill(null);
        this.state.initialized = true;
    }

    /**
     * 다차원 인덱스를 1차원 인덱스로 변환
     * @private
     */
    flatIndex(idx) {
        let flat = 0;
        let stride = 1;
        
        for (let i = this.state.dimNumber - 1; i >= 0; i--) {
            flat += idx[i] * stride;
            stride *= this.state.dims[i];
        }
        
        return flat;
    }
}