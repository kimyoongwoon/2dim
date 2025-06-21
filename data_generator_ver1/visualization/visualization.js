// visualization.js
import { ProjectionEngine } from './projection.js';

/**
 * Chart.js를 사용한 2D 시각화 클래스
 */
export class Visualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chart = null;
        this.projectionEngine = new ProjectionEngine();
        
        // 윈도우 설정
        this.windowConfig = {
            enabled: true,
            xMin: -100,
            xMax: 100,
            windowSize: 50,
            step: 10
        };

        // 차트 기본 설정
        this.chartConfig = {
            type: 'scatter',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // 성능을 위해 애니메이션 비활성화
                interaction: {
                    mode: 'point'
                },
                plugins: {
                    title: {
                        display: true,
                        text: '2D 정사영 시각화'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const point = context.raw;
                                return point.label || `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'X 축'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Y 축'
                        }
                    }
                }
            }
        };
    }

    /**
     * 데이터 설정
     */
    setData(data) {
        this.projectionEngine.setData(data);
        // 윈도우 범위는 X축 선택 시 업데이트되므로 여기서는 기본값만 설정
        const min = data.metadata.dimRangeMin[0];
        const max = data.metadata.dimRangeMax[0];
        this.windowConfig.xMin = min;
        this.windowConfig.xMax = Math.min(min + this.windowConfig.windowSize, max);
        this.windowConfig.step = (max - min) / 20;
    }

    /**
     * 시각화 업데이트
     */
    updateVisualization(xDimIndex, yDimIndex, colorScheme = 'viridis') {
        // 2D 정사영 수행
        const projectedPoints = this.projectionEngine.project2D(
            xDimIndex, 
            yDimIndex,
            this.windowConfig.enabled ? this.windowConfig : null
        );

        // 데이터셋 생성
        const datasets = this.createDatasets(projectedPoints, colorScheme);

        // 차트 업데이트 또는 생성
        if (this.chart) {
            this.chart.data.datasets = datasets;
            this.chart.options.scales.x.title.text = 
                this.projectionEngine.metadata.dimNames[xDimIndex];
            this.chart.options.scales.y.title.text = 
                this.projectionEngine.metadata.dimNames[yDimIndex];
            
            // 윈도우가 활성화된 경우 x축 범위 설정
            if (this.windowConfig.enabled) {
                this.chart.options.scales.x.min = this.windowConfig.xMin;
                this.chart.options.scales.x.max = this.windowConfig.xMax;
            } else {
                delete this.chart.options.scales.x.min;
                delete this.chart.options.scales.x.max;
            }
            
            this.chart.update('none'); // 애니메이션 없이 업데이트
        } else {
            this.chartConfig.data.datasets = datasets;
            this.chartConfig.options.scales.x.title.text = 
                this.projectionEngine.metadata.dimNames[xDimIndex];
            this.chartConfig.options.scales.y.title.text = 
                this.projectionEngine.metadata.dimNames[yDimIndex];
            
            this.chart = new Chart(this.ctx, this.chartConfig);
        }

        return projectedPoints.length;
    }

    /**
     * 데이터셋 생성
     */
    createDatasets(projectedPoints, colorScheme) {
        // 값 타입별로 그룹화
        const pointsByType = new Map();
        
        for (const point of projectedPoints) {
            const type = point.originalPoint.value.type;
            if (!pointsByType.has(type)) {
                pointsByType.set(type, []);
            }
            pointsByType.get(type).push(point);
        }

        const datasets = [];
        
        // 각 타입별로 데이터셋 생성
        for (const [type, points] of pointsByType) {
            const data = points.map(p => ({
                x: p.x,
                y: p.y,
                label: p.label
            }));

            const colors = points.map(p => 
                this.projectionEngine.getPointColor(p.originalPoint, colorScheme)
            );

            datasets.push({
                label: type,
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('rgb', 'rgba').replace(')', ', 0.8)')),
                borderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6,
                showLine: false
            });
        }

        return datasets;
    }

    /**
     * 윈도우 이동
     */
    moveWindow(direction, xDimIndex = 0) {
        const step = direction === 'left' ? -this.windowConfig.step : this.windowConfig.step;
        this.windowConfig.xMin += step;
        this.windowConfig.xMax += step;

        // 범위 제한
        const metadata = this.projectionEngine.metadata;
        if (metadata && xDimIndex < metadata.dimensions) {
            const min = metadata.dimRangeMin[xDimIndex];
            const max = metadata.dimRangeMax[xDimIndex];
            
            if (this.windowConfig.xMin < min) {
                this.windowConfig.xMin = min;
                this.windowConfig.xMax = min + this.windowConfig.windowSize;
            }
            if (this.windowConfig.xMax > max) {
                this.windowConfig.xMax = max;
                this.windowConfig.xMin = max - this.windowConfig.windowSize;
            }
        }
    }

    /**
     * 윈도우 크기 변경
     */
    resizeWindow(newSize, xDimIndex = 0) {
        this.windowConfig.windowSize = newSize;
        this.windowConfig.xMax = this.windowConfig.xMin + newSize;
        
        // 범위 초과 확인
        const metadata = this.projectionEngine.metadata;
        if (metadata && xDimIndex < metadata.dimensions) {
            const max = metadata.dimRangeMax[xDimIndex];
            if (this.windowConfig.xMax > max) {
                this.windowConfig.xMax = max;
                this.windowConfig.xMin = Math.max(
                    metadata.dimRangeMin[xDimIndex], 
                    max - newSize
                );
            }
        }
    }

    /**
     * 윈도우 토글
     */
    toggleWindow(enabled) {
        this.windowConfig.enabled = enabled;
    }

    /**
     * 필터 업데이트
     */
    updateFilter(dimIndex, updates) {
        this.projectionEngine.updateFilter(dimIndex, updates);
    }

    /**
     * 차트 제거
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}