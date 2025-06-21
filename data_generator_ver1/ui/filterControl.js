// ui/filterControls.js
import { globalEventBus } from '../utils/eventBus.js';

/**
 * 차원 필터 컨트롤 UI 컴포넌트
 */
export class FilterControls {
    constructor(containerId, eventBus = globalEventBus) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id '${containerId}' not found`);
        }
        
        this.eventBus = eventBus;
        this.filters = new Map();
        this.metadata = null;
    }

    /**
     * 필터 생성
     * @param {number} dimensions - 차원 수
     * @param {Object} metadata - 메타데이터
     */
    createFilters(dimensions, metadata) {
        this.clear();
        this.metadata = metadata;
        
        this.container.innerHTML = '<h3>차원 필터</h3>';
        
        for (let i = 0; i < dimensions; i++) {
            this.createFilterItem(i, metadata);
        }
    }

    /**
     * 개별 필터 아이템 생성
     * @param {number} index - 차원 인덱스
     * @param {Object} metadata - 메타데이터
     */
    createFilterItem(index, metadata) {
        const dimName = metadata.dimNames[index];
        const min = metadata.dimRangeMin[index];
        const max = metadata.dimRangeMax[index];
        const interval = metadata.dimInterval[index];
        
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';
        filterItem.innerHTML = `
            <h4>${dimName} (차원 ${index})</h4>
            <div class="filter-controls">
                <div class="filter-value-control">
                    <input type="range" 
                           id="filter-slider-${index}" 
                           min="${min}" 
                           max="${max}" 
                           step="${interval/10}" 
                           value="${(min + max) / 2}">
                    <span id="filter-value-${index}">${((min + max) / 2).toFixed(2)}</span>
                </div>
                <div class="filter-condition" data-dim="${index}">
                    <button class="condition-btn active" data-condition="any">모두</button>
                    <button class="condition-btn" data-condition="equal">=</button>
                    <button class="condition-btn" data-condition="greater">></button>
                    <button class="condition-btn" data-condition="less"><</button>
                </div>
            </div>
        `;
        
        this.container.appendChild(filterItem);
        
        // 필터 상태 저장
        this.filters.set(index, {
            dimName,
            min,
            max,
            value: (min + max) / 2,
            condition: 'any',
            tolerance: interval / 2
        });
        
        // 이벤트 리스너 설정
        this.setupFilterItemEvents(filterItem, index);
    }

    /**
     * 필터 아이템 이벤트 설정
     * @param {HTMLElement} filterItem - 필터 아이템 요소
     * @param {number} index - 차원 인덱스
     */
    setupFilterItemEvents(filterItem, index) {
        // 슬라이더 이벤트
        const slider = filterItem.querySelector(`#filter-slider-${index}`);
        const valueSpan = filterItem.querySelector(`#filter-value-${index}`);
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            valueSpan.textContent = value.toFixed(2);
            
            const filter = this.filters.get(index);
            filter.value = value;
            
            this.emitFilterChange(index, filter);
        });
        
        // 조건 버튼 이벤트
        const conditionBtns = filterItem.querySelectorAll('.condition-btn');
        conditionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const condition = e.target.dataset.condition;
                
                // 같은 차원의 다른 버튼들 비활성화
                filterItem.querySelectorAll('.condition-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                
                const filter = this.filters.get(index);
                filter.condition = condition;
                
                this.emitFilterChange(index, filter);
            });
        });
    }

    /**
     * 필터 변경 이벤트 발생
     * @param {number} index - 차원 인덱스
     * @param {Object} filter - 필터 정보
     */
    emitFilterChange(index, filter) {
        this.eventBus.emit('filterChanged', {
            dimIndex: index,
            filter: { ...filter }
        });
    }

    /**
     * 모든 필터 값 가져오기
     * @returns {Map} 필터 맵
     */
    getFilterValues() {
        return new Map(this.filters);
    }

    /**
     * 특정 차원의 필터 값 가져오기
     * @param {number} index - 차원 인덱스
     * @returns {Object|null} 필터 정보
     */
    getFilter(index) {
        return this.filters.get(index) || null;
    }

    /**
     * 특정 차원의 필터 업데이트
     * @param {number} index - 차원 인덱스
     * @param {Object} updates - 업데이트할 값
     */
    updateFilter(index, updates) {
        const filter = this.filters.get(index);
        if (!filter) return;
        
        Object.assign(filter, updates);
        
        // UI 업데이트
        if (updates.value !== undefined) {
            const slider = document.getElementById(`filter-slider-${index}`);
            const valueSpan = document.getElementById(`filter-value-${index}`);
            if (slider && valueSpan) {
                slider.value = updates.value;
                valueSpan.textContent = updates.value.toFixed(2);
            }
        }
        
        if (updates.condition !== undefined) {
            const filterItem = this.container.querySelector(`.filter-condition[data-dim="${index}"]`);
            if (filterItem) {
                filterItem.querySelectorAll('.condition-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.condition === updates.condition);
                });
            }
        }
    }

    /**
     * 특정 차원들의 조건을 'any'로 설정
     * @param {number[]} indices - 차원 인덱스 배열
     */
    setDimensionsToAny(indices) {
        indices.forEach(index => {
            this.updateFilter(index, { condition: 'any' });
            this.emitFilterChange(index, this.filters.get(index));
        });
    }

    /**
     * 모든 필터 초기화
     */
    resetAll() {
        this.filters.forEach((filter, index) => {
            const mid = (filter.min + filter.max) / 2;
            this.updateFilter(index, {
                value: mid,
                condition: 'any'
            });
            this.emitFilterChange(index, this.filters.get(index));
        });
    }

    /**
     * 특정 차원 필터 초기화
     * @param {number} index - 차원 인덱스
     */
    resetFilter(index) {
        const filter = this.filters.get(index);
        if (!filter) return;
        
        const mid = (filter.min + filter.max) / 2;
        this.updateFilter(index, {
            value: mid,
            condition: 'any'
        });
        this.emitFilterChange(index, filter);
    }

    /**
     * 필터 활성화/비활성화
     * @param {boolean} enabled - 활성화 여부
     */
    setEnabled(enabled) {
        const inputs = this.container.querySelectorAll('input, button');
        inputs.forEach(input => {
            input.disabled = !enabled;
        });
    }

    /**
     * 특정 차원 필터 활성화/비활성화
     * @param {number} index - 차원 인덱스
     * @param {boolean} enabled - 활성화 여부
     */
    setFilterEnabled(index, enabled) {
        const slider = document.getElementById(`filter-slider-${index}`);
        const buttons = this.container.querySelectorAll(
            `.filter-condition[data-dim="${index}"] button`
        );
        
        if (slider) slider.disabled = !enabled;
        buttons.forEach(btn => btn.disabled = !enabled);
    }

    /**
     * 필터 표시/숨김
     * @param {boolean} visible - 표시 여부
     */
    setVisible(visible) {
        this.container.style.display = visible ? 'block' : 'none';
    }

    /**
     * 화면 초기화
     */
    clear() {
        this.container.innerHTML = '';
        this.filters.clear();
        this.metadata = null;
    }

    /**
     * 필터 프리셋 적용
     * @param {Object} preset - 프리셋 설정
     */
    applyPreset(preset) {
        if (!preset || !preset.filters) return;
        
        preset.filters.forEach((filterConfig, index) => {
            if (this.filters.has(index)) {
                this.updateFilter(index, filterConfig);
                this.emitFilterChange(index, this.filters.get(index));
            }
        });
    }

    /**
     * 현재 필터 설정을 프리셋으로 내보내기
     * @returns {Object} 프리셋 객체
     */
    exportPreset() {
        const filters = [];
        this.filters.forEach((filter, index) => {
            filters[index] = {
                value: filter.value,
                condition: filter.condition
            };
        });
        
        return {
            filters,
            dimensions: this.filters.size
        };
    }
}