// dataGenerator.js
import { ValueType, ValueVariant  } from '../core/valueTypes.js';
import { PointResult } from '../core/pointResult.js';
import { PointGrid   } from '../core/pointGrid.js';
/**
 * 고차원 데이터를 랜덤으로 생성하는 클래스
 */
export class DataGenerator {
    constructor() {
        this.defaultDimNames = ['X', 'Y', 'Z', 'W', 'V', 'U', 'T', 'S', 'R', 'Q'];
        this.labels = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
        this.vectorComponentNames = ['x', 'y', 'z', 'w', 'v', 'u', 't', 's', 'r', 'q'];
    }

    /**
     * 랜덤 값 생성 (min과 max 사이)
     */
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * 정규분포 랜덤 값 생성 (Box-Muller 변환)
     */
    randomGaussian(mean = 0, std = 1) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * std + mean;
    }

    /**
     * ValueVariant 생성
     */
    generateValue(type, dimensions = 3, vectorSize = null) {
        switch (type) {
            case ValueType.DOUBLE:
                return new ValueVariant(type, this.randomGaussian(50, 20));
            
            case ValueType.VECTOR:
                // vectorSize가 지정되면 그 크기로, 아니면 랜덤
                const vSize = vectorSize || Math.floor(this.randomBetween(2, dimensions + 2));
                const vector = Array(vSize).fill(0).map(() => this.randomGaussian(0, 10));
                return new ValueVariant(type, vector);
            
            case ValueType.RANGE:
                const min = this.randomBetween(-100, 0);
                const max = this.randomBetween(0, 100);
                return new ValueVariant(type, [min, max]);
            
            case ValueType.LABEL_NUMBER:
                const label = this.labels[Math.floor(Math.random() * this.labels.length)];
                const number = this.randomGaussian(100, 30);
                return new ValueVariant(type, { label, number });
            
            case ValueType.LABEL_VECTOR:
                const labelV = this.labels[Math.floor(Math.random() * this.labels.length)];
                // vectorSize가 지정되면 그 크기로, 아니면 랜덤
                const lvSize = vectorSize || Math.floor(this.randomBetween(2, dimensions + 1));
                const vectorV = Array(lvSize).fill(0).map(() => this.randomGaussian(0, 5));
                return new ValueVariant(type, { label: labelV, vector: vectorV });
            
            default:
                throw new Error(`Unknown value type: ${type}`);
        }
    }

    /**
     * 고차원 데이터 포인트 생성
     */
    generatePoints(config) {
        const {
            dimensions = 3,
            pointCount = 100,
            valueType = ValueType.DOUBLE,
            vectorSize = null,
            rangeMin = -100,
            rangeMax = 100,
            intervalRatio = 0.1  // 범위의 몇 %를 간격으로 할 것인가
        } = config;

        // 차원 이름 설정
        const dimNames = this.defaultDimNames.slice(0, dimensions);
        
        // 각 차원의 범위와 간격을 한 번만 설정 (모든 포인트가 공유)
        const dimRangeMin = Array(dimensions).fill(0).map(() => 
            this.randomBetween(rangeMin, rangeMin + (rangeMax - rangeMin) * 0.3)
        );
        const dimRangeMax = Array(dimensions).fill(0).map((_, i) => 
            this.randomBetween(dimRangeMin[i] + (rangeMax - rangeMin) * 0.4, rangeMax)
        );
        const dimInterval = dimRangeMax.map((max, i) => 
            (max - dimRangeMin[i]) * intervalRatio
        );

        // 포인트 생성
        const points = [];
        for (let i = 0; i < pointCount; i++) {
            // 각 차원의 좌표 생성
            const coordinateNum = dimRangeMin.map((min, idx) => {
                const max = dimRangeMax[idx];
                const interval = dimInterval[idx];
                
                // 일부는 정확한 그리드 위치에, 일부는 랜덤 위치에
                if (Math.random() < 0.7) {
                    // 그리드에 정렬된 위치
                    const steps = Math.floor((max - min) / interval);
                    const step = Math.floor(Math.random() * steps); // steps가 아닌 steps-1까지
                    const coord = min + step * interval;
                    // 범위를 벗어나지 않도록 보장
                    return Math.min(coord, max);
                } else {
                    // 완전 랜덤 위치
                    return this.randomBetween(min, max);
                }
            });

            // 값 생성
            const value = this.generateValue(valueType, dimensions, vectorSize);

            // PointResult 생성 - 모든 포인트가 동일한 메타데이터 사용
            const point = new PointResult({
                dimNumber: dimensions,
                dimNames: dimNames,
                dimRangeMin: dimRangeMin,
                dimRangeMax: dimRangeMax,
                dimInterval: dimInterval,
                coordinateNum: coordinateNum,
                value: value
            });

            points.push(point);
        }

        return {
            points,
            metadata: {
                dimensions,
                dimNames,
                dimRangeMin,
                dimRangeMax,
                dimInterval,
                valueType,
                vectorSize,
                pointCount
            }
        };
    }

    /**
     * 특정 패턴을 가진 데이터 생성 (테스트용)
     */
    generatePatternedData(config) {
        const {
            dimensions = 3,
            gridSize = 5,  // 각 차원당 그리드 포인트 수
            valueType = ValueType.DOUBLE,
            vectorSize = null,
            pattern = 'sphere'  // sphere, wave, random
        } = config;

        const dimNames = this.defaultDimNames.slice(0, dimensions);
        const dimRangeMin = Array(dimensions).fill(-50);
        const dimRangeMax = Array(dimensions).fill(50);
        const dimInterval = dimRangeMax.map((max, i) => 
            (max - dimRangeMin[i]) / (gridSize - 1)
        );

        const points = [];
        
        // 재귀적으로 모든 그리드 포인트 생성
        const generateGridPoints = (dimIndex, coords) => {
            if (dimIndex === dimensions) {
                // 패턴에 따른 값 계산
                let value;
                
                switch (pattern) {
                    case 'sphere':
                        // 원점으로부터의 거리에 기반한 값
                        const distance = Math.sqrt(coords.reduce((sum, c) => sum + c * c, 0));
                        value = new ValueVariant(ValueType.DOUBLE, 100 * Math.exp(-distance / 30));
                        break;
                    
                    case 'wave':
                        // 사인파 조합
                        const waveValue = coords.reduce((sum, c, i) => 
                            sum + Math.sin(c / 10) * Math.cos(coords[(i + 1) % dimensions] / 15), 0
                        );
                        value = new ValueVariant(ValueType.DOUBLE, waveValue * 50);
                        break;
                    
                    default:
                        // 랜덤
                        value = this.generateValue(valueType, dimensions, vectorSize);
                }

                const point = new PointResult({
                    dimNumber: dimensions,
                    dimNames: dimNames,
                    dimRangeMin: dimRangeMin,
                    dimRangeMax: dimRangeMax,
                    dimInterval: dimInterval,
                    coordinateNum: [...coords],
                    value: value
                });

                points.push(point);
                return;
            }

            // 현재 차원의 모든 그리드 포인트에 대해 재귀 호출
            for (let i = 0; i < gridSize; i++) {
                const coord = dimRangeMin[dimIndex] + i * dimInterval[dimIndex];
                coords[dimIndex] = coord;
                generateGridPoints(dimIndex + 1, coords);
            }
        };

        generateGridPoints(0, new Array(dimensions));

        return {
            points,
            metadata: {
                dimensions,
                dimNames,
                dimRangeMin,
                dimRangeMax,
                dimInterval,
                valueType,
                vectorSize,
                pointCount: points.length,
                pattern,
                gridSize
            }
        };
    }
}