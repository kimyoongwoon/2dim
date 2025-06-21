// data/dataExporter.js
/**
 * 데이터 내보내기 클래스
 * JSON, CSV 등 다양한 형식으로 데이터를 내보내기
 */
export class DataExporter {
    /**
     * JSON 형식으로 내보내기
     * @param {Object} data - 내보낼 데이터
     * @param {boolean} pretty - 보기 좋게 포맷팅 여부
     * @returns {string} JSON 문자열
     */
    exportJSON(data, pretty = true) {
        if (!data) {
            throw new Error('No data to export');
        }
        return JSON.stringify(data, null, pretty ? 2 : 0);
    }

    /**
     * CSV 형식으로 내보내기
     * @param {Object} data - 내보낼 데이터
     * @returns {string} CSV 문자열
     */
    exportCSV(data) {
        if (!data || !data.points || data.points.length === 0) {
            throw new Error('No data to export');
        }

        const metadata = data.metadata;
        const points = data.points;
        
        // 헤더 생성
        const headers = [...metadata.dimNames];
        
        // 값 타입에 따라 헤더 추가
        switch (metadata.valueType) {
            case 'double':
                headers.push('value');
                break;
            case 'vector':
                for (let i = 0; i < (metadata.vectorSize || 3); i++) {
                    headers.push(`value_${i}`);
                }
                break;
            case 'range':
                headers.push('min', 'max');
                break;
            case 'labelNumber':
                headers.push('label', 'number');
                break;
            case 'labelVector':
                headers.push('label');
                for (let i = 0; i < (metadata.vectorSize || 3); i++) {
                    headers.push(`value_${i}`);
                }
                break;
        }

        // CSV 행 생성
        const rows = [headers.join(',')];
        
        points.forEach(point => {
            const row = [...point.coordinateNum];
            
            // 값 추가
            switch (point.value.type) {
                case 'double':
                    row.push(point.value.value);
                    break;
                case 'vector':
                    row.push(...point.value.value);
                    break;
                case 'range':
                    row.push(point.value.value[0], point.value.value[1]);
                    break;
                case 'labelNumber':
                    row.push(`"${point.value.value.label}"`, point.value.value.number);
                    break;
                case 'labelVector':
                    row.push(`"${point.value.value.label}"`, ...point.value.value.vector);
                    break;
            }
            
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }

    /**
     * 메타데이터만 내보내기
     * @param {Object} metadata - 메타데이터
     * @returns {string} JSON 문자열
     */
    exportMetadata(metadata) {
        if (!metadata) {
            throw new Error('No metadata to export');
        }
        
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            metadata: metadata
        }, null, 2);
    }

    /**
     * 파일 다운로드
     * @param {string} content - 파일 내용
     * @param {string} filename - 파일명
     * @param {string} mimeType - MIME 타입
     */
    downloadFile(content, filename, mimeType = 'application/json') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * JSON 파일로 다운로드
     * @param {Object} data - 데이터
     * @param {string} [filenamePrefix='data'] - 파일명 접두사
     */
    downloadJSON(data, filenamePrefix = 'data') {
        const content = this.exportJSON(data);
        const filename = `${filenamePrefix}_${Date.now()}.json`;
        this.downloadFile(content, filename, 'application/json');
    }

    /**
     * CSV 파일로 다운로드
     * @param {Object} data - 데이터
     * @param {string} [filenamePrefix='data'] - 파일명 접두사
     */
    downloadCSV(data, filenamePrefix = 'data') {
        const content = this.exportCSV(data);
        const filename = `${filenamePrefix}_${Date.now()}.csv`;
        this.downloadFile(content, filename, 'text/csv');
    }

    /**
     * 요약 정보 생성
     * @param {Object} data - 데이터
     * @returns {Object} 요약 정보
     */
    generateSummary(data) {
        if (!data) return null;

        const metadata = data.metadata;
        const points = data.points;

        // 각 차원별 통계
        const dimensionStats = metadata.dimNames.map((name, i) => {
            const values = points.map(p => p.coordinateNum[i]);
            return {
                name,
                min: Math.min(...values),
                max: Math.max(...values),
                mean: values.reduce((a, b) => a + b, 0) / values.length,
                configuredMin: metadata.dimRangeMin[i],
                configuredMax: metadata.dimRangeMax[i],
                interval: metadata.dimInterval[i]
            };
        });

        return {
            generatedAt: new Date().toISOString(),
            totalPoints: points.length,
            dimensions: metadata.dimensions,
            valueType: metadata.valueType,
            vectorSize: metadata.vectorSize,
            dimensionStats
        };
    }

    /**
     * 포인트 서브셋 내보내기
     * @param {Object} data - 전체 데이터
     * @param {number} start - 시작 인덱스
     * @param {number} count - 개수
     * @returns {Object} 서브셋 데이터
     */
    exportSubset(data, start = 0, count = 100) {
        if (!data || !data.points) return null;

        const subset = {
            ...data,
            points: data.points.slice(start, start + count),
            metadata: {
                ...data.metadata,
                pointCount: Math.min(count, data.points.length - start),
                isSubset: true,
                subsetStart: start,
                totalPoints: data.points.length
            }
        };

        return subset;
    }
}