// ui/dataDisplay.js
/**
 * 데이터 표시 전용 UI 컴포넌트
 * 생성된 데이터의 정보를 화면에 표시
 */
export class DataDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id '${containerId}' not found`);
        }
    }

    /**
     * 데이터 표시
     * @param {Object} data - 표시할 데이터
     * @param {Object} grid - 그리드 정보
     */
    display(data, grid) {
        this.clear();
        
        if (!data) {
            this.showEmptyState();
            return;
        }

        this.displayMetadata(data.metadata);
        this.displayRanges(data.metadata);
        this.displaySamplePoints(data.points, 10);
        
        if (grid) {
            this.displayGridInfo(grid);
        }
    }

    /**
     * 메타데이터 표시
     * @param {Object} metadata - 메타데이터
     */
    displayMetadata(metadata) {
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'data-point';
        
        let html = `
            <h3>데이터 메타정보</h3>
            <p><span class="coord-label">차원 수:</span> ${metadata.dimensions}</p>
            <p><span class="coord-label">차원 이름:</span> ${metadata.dimNames.join(', ')}</p>
            <p><span class="coord-label">생성된 포인트 수:</span> ${metadata.pointCount}</p>
            <p><span class="coord-label">값 타입:</span> ${this.getValueTypeLabel(metadata.valueType)}</p>
        `;
        
        // 벡터 타입인 경우 벡터 크기 표시
        if (metadata.vectorSize) {
            html += `<p><span class="coord-label">벡터 크기:</span> ${metadata.vectorSize}</p>`;
        }
        
        metadataDiv.innerHTML = html;
        this.container.appendChild(metadataDiv);
    }

    /**
     * 차원별 범위 표시
     * @param {Object} metadata - 메타데이터
     */
    displayRanges(metadata) {
        const rangeDiv = document.createElement('div');
        rangeDiv.className = 'data-point';
        
        let html = '<h3>차원별 범위</h3>';
        for (let i = 0; i < metadata.dimensions; i++) {
            html += `
                <p>
                    <span class="coord-label">${metadata.dimNames[i]}:</span> 
                    [${metadata.dimRangeMin[i].toFixed(2)}, ${metadata.dimRangeMax[i].toFixed(2)}] 
                    (간격: ${metadata.dimInterval[i].toFixed(2)})
                </p>
            `;
        }
        
        rangeDiv.innerHTML = html;
        this.container.appendChild(rangeDiv);
    }

    /**
     * 샘플 포인트 표시
     * @param {Array} points - 포인트 배열
     * @param {number} limit - 표시할 최대 개수
     */
    displaySamplePoints(points, limit = 10) {
        const sampleDiv = document.createElement('div');
        sampleDiv.className = 'data-point';
        
        const sampleCount = Math.min(limit, points.length);
        let html = `<h3>샘플 데이터 (처음 ${sampleCount}개)</h3>`;
        
        for (let i = 0; i < sampleCount; i++) {
            const point = points[i];
            const coordsStr = point.coordinateNum.map((coord, idx) => 
                `${point.dimNames[idx]}: ${coord.toFixed(2)}`
            ).join(', ');
            
            html += `
                <p style="margin-left: 1rem;">
                    <span class="coord-label">Point ${i + 1}:</span> 
                    (${coordsStr}) → 
                    <span class="value-label">${point.value.toString()}</span>
                </p>
            `;
        }
        
        sampleDiv.innerHTML = html;
        this.container.appendChild(sampleDiv);
    }

    /**
     * 그리드 정보 표시
     * @param {Object} grid - 그리드 객체
     */
    displayGridInfo(grid) {
        const gridDiv = document.createElement('div');
        gridDiv.className = 'data-point';
        
        const gridPoints = grid.getAllPoints();
        const dims = grid.getDims();
        
        gridDiv.innerHTML = `
            <h3>그리드 정보</h3>
            <p><span class="coord-label">그리드 크기:</span> ${dims.join(' × ')}</p>
            <p><span class="coord-label">그리드에 저장된 포인트 수:</span> ${gridPoints.length}</p>
            <p><span class="coord-label">총 그리드 셀 수:</span> ${dims.reduce((a, b) => a * b, 1)}</p>
            <p><span class="coord-label">채움률:</span> ${(gridPoints.length / dims.reduce((a, b) => a * b, 1) * 100).toFixed(1)}%</p>
        `;
        
        this.container.appendChild(gridDiv);
    }

    /**
     * 화면 초기화
     */
    clear() {
        this.container.innerHTML = '';
    }

    /**
     * 빈 상태 표시
     */
    showEmptyState() {
        this.container.innerHTML = `
            <div class="data-point empty-state">
                <p style="text-align: center; color: var(--text-secondary);">
                    데이터가 없습니다. 위의 설정을 사용하여 데이터를 생성해주세요.
                </p>
            </div>
        `;
    }

    /**
     * 로딩 상태 표시
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="data-point loading-state">
                <p style="text-align: center;">
                    <span class="loading-spinner"></span>
                    데이터 생성 중...
                </p>
            </div>
        `;
    }

    /**
     * 에러 표시
     * @param {string} message - 에러 메시지
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="data-point error-state">
                <p style="color: #dc2626;">
                    <strong>오류:</strong> ${message}
                </p>
            </div>
        `;
    }

    /**
     * 값 타입 레이블 가져오기
     * @param {string} type - 값 타입
     * @returns {string} 한글 레이블
     */
    getValueTypeLabel(type) {
        const labels = {
            'double': '단일 실수',
            'vector': '벡터',
            'range': '범위 [min, max]',
            'labelNumber': '레이블-숫자 쌍',
            'labelVector': '레이블-벡터 쌍'
        };
        return labels[type] || type;
    }

    /**
     * 통계 정보 표시
     * @param {Object} stats - 통계 정보
     */
    displayStatistics(stats) {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'data-point';
        
        let html = '<h3>통계 정보</h3>';
        
        stats.dimensionStats.forEach(stat => {
            html += `
                <div style="margin-bottom: 0.5rem;">
                    <p><span class="coord-label">${stat.name}:</span></p>
                    <p style="margin-left: 1rem; font-size: 0.875rem;">
                        실제 범위: [${stat.min.toFixed(2)}, ${stat.max.toFixed(2)}]<br>
                        평균: ${stat.mean.toFixed(2)}
                    </p>
                </div>
            `;
        });
        
        statsDiv.innerHTML = html;
        this.container.appendChild(statsDiv);
    }
}