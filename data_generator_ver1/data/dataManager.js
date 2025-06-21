// data/dataManager.js
import { PointGrid } from '../core/pointGrid.js';

/**
 * 데이터 상태 관리 클래스
 * 생성된 데이터와 그리드를 중앙에서 관리
 */
export class DataManager {
    constructor() {
        this.currentData = null;
        this.currentGrid = null;
        this.history = [];
        this.maxHistorySize = 10;
    }

    /**
     * 새 데이터 설정
     * @param {Object} data - 생성된 데이터
     */
    setData(data) {
        // 이전 데이터를 히스토리에 저장
        if (this.currentData) {
            this.saveToHistory();
        }

        this.currentData = data;
        
        // 새 그리드 생성
        this.currentGrid = new PointGrid(data.metadata.dimNames);
        data.points.forEach(point => {
            this.currentGrid.addPoint(point);
        });
    }

    /**
     * 현재 데이터 가져오기
     * @returns {Object|null} 현재 데이터
     */
    getData() {
        return this.currentData;
    }

    /**
     * 현재 그리드 가져오기
     * @returns {PointGrid|null} 현재 그리드
     */
    getGrid() {
        return this.currentGrid;
    }

    /**
     * 메타데이터 가져오기
     * @returns {Object|null} 메타데이터
     */
    getMetadata() {
        return this.currentData ? this.currentData.metadata : null;
    }

    /**
     * 포인트 배열 가져오기
     * @returns {Array} 포인트 배열
     */
    getPoints() {
        return this.currentData ? this.currentData.points : [];
    }

    /**
     * 데이터 초기화
     */
    clearData() {
        this.currentData = null;
        this.currentGrid = null;
    }

    /**
     * 히스토리에 저장
     */
    saveToHistory() {
        if (!this.currentData) return;

        this.history.push({
            data: this.currentData,
            grid: this.currentGrid,
            timestamp: new Date()
        });

        // 최대 크기 유지
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * 히스토리에서 복원
     * @param {number} index - 히스토리 인덱스
     */
    restoreFromHistory(index) {
        if (index < 0 || index >= this.history.length) {
            throw new Error('Invalid history index');
        }

        const historyItem = this.history[index];
        this.currentData = historyItem.data;
        this.currentGrid = historyItem.grid;
    }

    /**
     * 히스토리 목록 가져오기
     * @returns {Array} 히스토리 정보 배열
     */
    getHistoryList() {
        return this.history.map((item, index) => ({
            index,
            timestamp: item.timestamp,
            pointCount: item.data.points.length,
            dimensions: item.data.metadata.dimensions,
            valueType: item.data.metadata.valueType
        }));
    }

    /**
     * 데이터 유효성 확인
     * @returns {boolean} 데이터 존재 여부
     */
    hasData() {
        return this.currentData !== null;
    }

    /**
     * 차원 정보 가져오기
     * @returns {Object|null} 차원 정보
     */
    getDimensionInfo() {
        if (!this.currentData) return null;

        const metadata = this.currentData.metadata;
        return {
            count: metadata.dimensions,
            names: metadata.dimNames,
            ranges: metadata.dimNames.map((name, i) => ({
                name,
                min: metadata.dimRangeMin[i],
                max: metadata.dimRangeMax[i],
                interval: metadata.dimInterval[i]
            }))
        };
    }

    /**
     * 특정 차원의 범위 가져오기
     * @param {number} dimIndex - 차원 인덱스
     * @returns {Object|null} 차원 범위 정보
     */
    getDimensionRange(dimIndex) {
        if (!this.currentData || dimIndex < 0 || dimIndex >= this.currentData.metadata.dimensions) {
            return null;
        }

        const metadata = this.currentData.metadata;
        return {
            name: metadata.dimNames[dimIndex],
            min: metadata.dimRangeMin[dimIndex],
            max: metadata.dimRangeMax[dimIndex],
            interval: metadata.dimInterval[dimIndex]
        };
    }
}