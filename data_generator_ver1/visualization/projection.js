// projection.js
import { ValueType } from '../core/valueTypes.js';
import { ColorSchemes } from './colorSchemes.js';

/**
 * 고차원 데이터를 2D로 정사영하고 필터링하는 클래스
 */
export class ProjectionEngine {
    constructor() {
        this.points = [];
        this.metadata = null;
        this.filters = new Map(); // 차원별 필터 조건
    }

    /**
     * 데이터 설정
     */
    setData(data) {
        this.points = data.points;
        this.metadata = data.metadata;
        this.initializeFilters();
    }

    /**
     * 필터 초기화
     */
    initializeFilters() {
        this.filters.clear();
        for (let i = 0; i < this.metadata.dimensions; i++) {
            this.filters.set(i, {
                dimName: this.metadata.dimNames[i],
                min: this.metadata.dimRangeMin[i],
                max: this.metadata.dimRangeMax[i],
                value: (this.metadata.dimRangeMin[i] + this.metadata.dimRangeMax[i]) / 2,
                condition: 'any', // 'any', 'equal', 'greater', 'less'
                tolerance: this.metadata.dimInterval[i] / 2
            });
        }
    }

    /**
     * 필터 조건 업데이트
     */
    updateFilter(dimIndex, updates) {
        const filter = this.filters.get(dimIndex);
        Object.assign(filter, updates);
    }

    /**
     * 포인트가 필터 조건을 만족하는지 확인
     */
    passesFilters(point, excludeDims = []) {
        for (let i = 0; i < point.dimNumber; i++) {
            if (excludeDims.includes(i)) continue;

            const filter = this.filters.get(i);
            const coord = point.coordinateNum[i];

            switch (filter.condition) {
                case 'equal':
                    if (Math.abs(coord - filter.value) > filter.tolerance) {
                        return false;
                    }
                    break;
                case 'greater':
                    if (coord <= filter.value) {
                        return false;
                    }
                    break;
                case 'less':
                    if (coord >= filter.value) {
                        return false;
                    }
                    break;
                case 'any':
                    // 모든 값 허용
                    break;
            }
        }
        return true;
    }

    /**
     * 2D 정사영 수행
     */
    project2D(xDimIndex, yDimIndex, windowConfig = null) {
        const projectedPoints = [];
        
        // 투영할 차원은 필터에서 제외
        const excludeDims = [xDimIndex, yDimIndex];

        for (const point of this.points) {
            // 필터 조건 확인
            if (!this.passesFilters(point, excludeDims)) {
                continue;
            }

            const x = point.coordinateNum[xDimIndex];
            const y = point.coordinateNum[yDimIndex];

            // 윈도우 범위 확인
            if (windowConfig) {
                if (x < windowConfig.xMin || x > windowConfig.xMax) {
                    continue;
                }
            }

            projectedPoints.push({
                x,
                y,
                originalPoint: point,
                label: this.getPointLabel(point)
            });
        }

        return projectedPoints;
    }

    /**
     * 포인트 라벨 생성
     */
    getPointLabel(point) {
        const coordStr = point.coordinateNum.map((c, i) => 
            `${point.dimNames[i]}: ${c.toFixed(2)}`
        ).join(', ');
        
        return `(${coordStr}) → ${point.value.toString()}`;
    }

    /**
     * 값에 따른 색상 계산
     */
    getPointColor(point, colorScheme = 'viridis') {
        let normalizedValue = 0;

        // 값 타입에 따라 정규화
        switch (point.value.type) {
            case ValueType.DOUBLE:
                // 모든 포인트의 min/max를 찾아서 정규화
                const values = this.points
                    .filter(p => p.value.type === ValueType.DOUBLE)
                    .map(p => p.value.value);
                const min = Math.min(...values);
                const max = Math.max(...values);
                normalizedValue = (point.value.value - min) / (max - min);
                break;
            
            case ValueType.VECTOR:
                // 벡터의 크기(norm) 사용
                const norm = Math.sqrt(
                    point.value.value.reduce((sum, v) => sum + v * v, 0)
                );
                normalizedValue = Math.min(norm / 100, 1); // 임의의 스케일
                break;
            
            case ValueType.RANGE:
                // 범위의 중간값 사용
                const mid = (point.value.value[0] + point.value.value[1]) / 2;
                normalizedValue = (mid + 100) / 200; // -100~100 가정
                break;
            
            case ValueType.LABEL_NUMBER:
                normalizedValue = (point.value.value.number + 100) / 200;
                break;
            
            case ValueType.LABEL_VECTOR:
                const vecNorm = Math.sqrt(
                    point.value.value.vector.reduce((sum, v) => sum + v * v, 0)
                );
                normalizedValue = Math.min(vecNorm / 50, 1);
                break;
        }

        // 색상 스킴에 따라 RGB 계산
        return ColorSchemes.getColor(normalizedValue, colorScheme);
    }

    /**
     * 정규화된 값(0-1)을 색상으로 변환
     */
    
    /**
     * 윈도우 범위 내의 데이터 통계
     */
    getWindowStats(xDimIndex, windowConfig) {
        let count = 0;
        let xMin = Infinity;
        let xMax = -Infinity;

        for (const point of this.points) {
            const x = point.coordinateNum[xDimIndex];
            if (windowConfig && (x < windowConfig.xMin || x > windowConfig.xMax)) {
                continue;
            }
            count++;
            xMin = Math.min(xMin, x);
            xMax = Math.max(xMax, x);
        }

        return { count, xMin, xMax };
    }
}