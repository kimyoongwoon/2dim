// main.js

import { ValueType }   from './core/valueTypes.js';
import { PointGrid }    from './core/pointGrid.js';
import { DataGenerator }from './data/dataGenerator.js';
import { Visualizer }    from './visualization/visualization.js';

class HighDimensionalDataApp {
    constructor() {
        this.generator = new DataGenerator();
        this.visualizer = new Visualizer('vizChart');
        this.currentData = null;
        this.currentGrid = null;
        
        this.initializeUI();
    }

    initializeUI() {
        // UI 요소 가져오기
        this.dimensionsInput = document.getElementById('dimensions');
        this.pointCountInput = document.getElementById('pointCount');
        this.valueTypeSelect = document.getElementById('valueType');
        this.vectorSizeInput = document.getElementById('vectorSize');
        this.vectorSizeGroup = document.getElementById('vectorSizeGroup');
        this.generateBtn = document.getElementById('generateBtn');
        this.dataOutput = document.getElementById('dataOutput');
        
        // 시각화 UI 요소
        this.vizPanel = document.getElementById('vizPanel');
        this.xAxisSelect = document.getElementById('xAxis');
        this.yAxisSelect = document.getElementById('yAxis');
        this.colorSchemeSelect = document.getElementById('colorScheme');
        this.updateVizBtn = document.getElementById('updateVizBtn');
        this.pointCountSpan = document.getElementById('displayedCount');        
        // 윈도우 컨트롤
        this.windowEnabledCheckbox = document.getElementById('windowEnabled');
        this.windowSizeInput = document.getElementById('windowSize');
        this.windowStartSlider = document.getElementById('windowStart');
        this.windowRangeSpan = document.getElementById('windowRange');
        
        // 이벤트 리스너 등록
        this.generateBtn.addEventListener('click', () => this.generateData());
        this.updateVizBtn.addEventListener('click', () => this.updateVisualization());
        
        // 값 타입 변경 시 벡터 크기 입력 표시/숨김
        this.valueTypeSelect.addEventListener('change', (e) => {
            const isVector = e.target.value === 'vector' || e.target.value === 'labelVector';
            this.vectorSizeGroup.style.display = isVector ? 'block' : 'none';
        });
        
        // X축 변경 시 윈도우 범위 업데이트
        this.xAxisSelect.addEventListener('change', () => {
            if (!this.currentData) return;
            const xDimIndex = parseInt(this.xAxisSelect.value);
            const min = this.currentData.metadata.dimRangeMin[xDimIndex];
            const max = this.currentData.metadata.dimRangeMax[xDimIndex];
            this.visualizer.windowConfig.xMin = min;
            this.visualizer.windowConfig.xMax = Math.min(min + this.visualizer.windowConfig.windowSize, max);
            this.visualizer.windowConfig.step = (max - min) / 20;
            this.updateWindowControls();
        });
        
        // 윈도우 컨트롤 이벤트
        this.windowEnabledCheckbox.addEventListener('change', (e) => {
            this.visualizer.toggleWindow(e.target.checked);
            this.updateWindowControls();
            this.updateVisualization();
        });

        this.windowSizeInput.addEventListener('input', (e) => {
            const xDimIndex = parseInt(this.xAxisSelect.value || 0);
            this.visualizer.resizeWindow(parseFloat(e.target.value), xDimIndex);
            this.updateWindowControls();
            this.updateVisualization();
        });

        this.windowStartSlider.addEventListener('input', (e) => {
            const xDimIndex = parseInt(this.xAxisSelect.value || 0);
            this.visualizer.setWindowStart(parseFloat(e.target.value), xDimIndex);
            this.updateWindowControls();
            this.updateVisualization();
        });
    }

    generateData() {
        const dimensions = parseInt(this.dimensionsInput.value);
        const pointCount = parseInt(this.pointCountInput.value);
        const valueType = this.valueTypeSelect.value;
        const vectorSize = parseInt(this.vectorSizeInput.value);

        // 이전 시각화 정리
        if (this.visualizer && this.visualizer.chart) {
            this.visualizer.destroy();
        }
        
        // 새 Visualizer 인스턴스 생성
        this.visualizer = new Visualizer('vizChart');

        // 데이터 생성
        const config = {
            dimensions,
            pointCount,
            valueType,
            vectorSize: (valueType === 'vector' || valueType === 'labelVector') ? vectorSize : undefined
        };

        this.currentData = this.generator.generatePoints(config);
        
        // 그리드 생성 및 데이터 추가
        this.currentGrid = new PointGrid(this.currentData.metadata.dimNames);
        this.currentData.points.forEach(point => {
            this.currentGrid.addPoint(point);
        });

        // 시각화 데이터 설정
        this.visualizer.setData(this.currentData);

        // 결과 표시
        this.displayData();
        
        // 시각화 UI 초기화
        this.initializeVisualizationUI();
        
        // 콘솔에 상세 정보 출력
        console.log('Generated Data:', this.currentData);
        console.log('Grid Dimensions:', this.currentGrid.getDims());
        console.log('Total Grid Points:', this.currentGrid.getAllPoints().length);
    }

    initializeVisualizationUI() {
        // 시각화 패널 표시
        this.vizPanel.style.display = 'block';
        
        // 축 선택 옵션 초기화
        this.xAxisSelect.innerHTML = '';
        this.yAxisSelect.innerHTML = '';
        
        // 이전 이벤트 리스너 제거를 위해 X축 선택 이벤트 재설정
        const newXAxisSelect = this.xAxisSelect.cloneNode(false);
        this.xAxisSelect.parentNode.replaceChild(newXAxisSelect, this.xAxisSelect);
        this.xAxisSelect = newXAxisSelect;
        
        for (let i = 0; i < this.currentData.metadata.dimensions; i++) {
            const dimName = this.currentData.metadata.dimNames[i];
            
            const xOption = document.createElement('option');
            xOption.value = i;
            xOption.textContent = dimName;
            this.xAxisSelect.appendChild(xOption);
            
            const yOption = document.createElement('option');
            yOption.value = i;
            yOption.textContent = dimName;
            this.yAxisSelect.appendChild(yOption);
        }
        
        // 기본값 설정 (X=0, Y=1)
        if (this.currentData.metadata.dimensions > 1) {
            this.yAxisSelect.value = '1';
        }
        
        // X축 변경 이벤트 리스너 재등록
        this.xAxisSelect.addEventListener('change', () => {
            if (!this.currentData) return;
            const xDimIndex = parseInt(this.xAxisSelect.value);
            const min = this.currentData.metadata.dimRangeMin[xDimIndex];
            const max = this.currentData.metadata.dimRangeMax[xDimIndex];
            this.visualizer.windowConfig.xMin = min;
            this.visualizer.windowConfig.xMax = Math.min(min + this.visualizer.windowConfig.windowSize, max);
            this.visualizer.windowConfig.step = (max - min) / 20;
            this.updateWindowControls();
        });
        
        // 시각화 업데이트 버튼 이벤트 재등록
        const newUpdateVizBtn = this.updateVizBtn.cloneNode(true);
        this.updateVizBtn.parentNode.replaceChild(newUpdateVizBtn, this.updateVizBtn);
        this.updateVizBtn = newUpdateVizBtn;
        
        this.updateVizBtn.addEventListener('click', () => this.updateVisualization());
        
        // 차원 필터 생성
        this.createDimensionFilters();
        
        // 윈도우 컨트롤 이벤트 리스너 재등록
        // 이전 리스너 제거를 위해 요소 복제
        const newWindowEnabled = this.windowEnabledCheckbox.cloneNode(true);
        this.windowEnabledCheckbox.parentNode.replaceChild(newWindowEnabled, this.windowEnabledCheckbox);
        this.windowEnabledCheckbox = newWindowEnabled;

        const newWindowSize = this.windowSizeInput.cloneNode(true);
        this.windowSizeInput.parentNode.replaceChild(newWindowSize, this.windowSizeInput);
        this.windowSizeInput = newWindowSize;

        const newWindowStart = this.windowStartSlider.cloneNode(true);
        this.windowStartSlider.parentNode.replaceChild(newWindowStart, this.windowStartSlider);
        this.windowStartSlider = newWindowStart;
        
        // 윈도우 컨트롤 이벤트 재등록
        this.windowEnabledCheckbox.addEventListener('change', (e) => {
            this.visualizer.toggleWindow(e.target.checked);
            this.updateWindowControls();
            this.updateVisualization();
        });

        this.windowSizeInput.addEventListener('input', (e) => {
            const xDimIndex = parseInt(this.xAxisSelect.value || 0);
            this.visualizer.resizeWindow(parseFloat(e.target.value), xDimIndex);
            this.updateWindowControls();
            this.updateVisualization();
        });

        this.windowStartSlider.addEventListener('input', (e) => {
            const xDimIndex = parseInt(this.xAxisSelect.value || 0);
            this.visualizer.setWindowStart(parseFloat(e.target.value), xDimIndex);
            this.updateWindowControls();
            this.updateVisualization();
        });
        
        // 윈도우 컨트롤 업데이트
        this.updateWindowControls();
        
        // 초기 시각화
        this.updateVisualization();
    }

    createDimensionFilters() {
        const filtersContainer = document.getElementById('dimensionFilters');
        filtersContainer.innerHTML = '<h3>차원 필터</h3>';
        
        for (let i = 0; i < this.currentData.metadata.dimensions; i++) {
            const dimName = this.currentData.metadata.dimNames[i];
            const min = this.currentData.metadata.dimRangeMin[i];
            const max = this.currentData.metadata.dimRangeMax[i];
            const interval = this.currentData.metadata.dimInterval[i];
            
            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';
            filterItem.innerHTML = `
                <h4>${dimName} (차원 ${i})</h4>
                <div class="filter-controls">
                    <div class="filter-value-control">
                        <input type="range" 
                               id="filter-slider-${i}" 
                               min="${min}" 
                               max="${max}" 
                               step="${interval/10}" 
                               value="${(min + max) / 2}">
                        <span id="filter-value-${i}">${((min + max) / 2).toFixed(2)}</span>
                    </div>
                    <div class="filter-condition">
                        <button class="condition-btn active" data-dim="${i}" data-condition="any">모두</button>
                        <button class="condition-btn" data-dim="${i}" data-condition="equal">=</button>
                        <button class="condition-btn" data-dim="${i}" data-condition="greater">></button>
                        <button class="condition-btn" data-dim="${i}" data-condition="less"><</button>
                    </div>
                </div>
            `;
            
            filtersContainer.appendChild(filterItem);
            
            // 슬라이더 이벤트
            const slider = document.getElementById(`filter-slider-${i}`);
            const valueSpan = document.getElementById(`filter-value-${i}`);
            
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueSpan.textContent = value.toFixed(2);
                this.visualizer.updateFilter(i, { value });
            });
            
            // 조건 버튼 이벤트
            const conditionBtns = filterItem.querySelectorAll('.condition-btn');
            conditionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const dim = parseInt(e.target.dataset.dim);
                    const condition = e.target.dataset.condition;
                    
                    // 같은 차원의 다른 버튼들 비활성화
                    filterItem.querySelectorAll('.condition-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    e.target.classList.add('active');
                    
                    this.visualizer.updateFilter(dim, { condition });
                });
            });
        }
    }

    updateWindowControls() {
        if (!this.visualizer) return;
        
        const enabled = this.windowEnabledCheckbox.checked;
        this.windowSizeInput.disabled = !enabled;
        this.windowStartSlider.disabled = !enabled;
        
        if (enabled && this.visualizer.windowConfig) {
            const { xMin, xMax, step, windowSize } = this.visualizer.windowConfig;
            this.windowRangeSpan.textContent = `범위: ${xMin.toFixed(1)} ~ ${xMax.toFixed(1)}`;
            const xDimIndex = parseInt(this.xAxisSelect.value || 0);
            const min = this.currentData.metadata.dimRangeMin[xDimIndex];
            const max = this.currentData.metadata.dimRangeMax[xDimIndex];
            this.windowStartSlider.min = min;
            this.windowStartSlider.max = max - windowSize;
            this.windowStartSlider.step = step;
            this.windowStartSlider.value = xMin;
        } else {
            this.windowRangeSpan.textContent = '범위: 전체';
        }
    }

    updateVisualization() {
        if (!this.currentData || !this.visualizer) return;
        
        const xDimIndex = parseInt(this.xAxisSelect.value);
        const yDimIndex = parseInt(this.yAxisSelect.value);
        const colorScheme = this.colorSchemeSelect.value;
        
        // 같은 차원 선택 방지
        if (xDimIndex === yDimIndex) {
            alert('X축과 Y축은 서로 다른 차원을 선택해주세요.');
            return;
        }
        
        // X축이 변경되었으면 윈도우 범위 업데이트
        const min = this.currentData.metadata.dimRangeMin[xDimIndex];
        const max = this.currentData.metadata.dimRangeMax[xDimIndex];
        this.visualizer.windowConfig.xMin = min;
        this.visualizer.windowConfig.xMax = Math.min(min + this.visualizer.windowConfig.windowSize, max);
        
        // 선택된 차원들은 필터에서 'any' 조건으로 설정
        this.visualizer.updateFilter(xDimIndex, { condition: 'any' });
        this.visualizer.updateFilter(yDimIndex, { condition: 'any' });
        
        // 시각화 업데이트
        const displayedCount = this.visualizer.updateVisualization(xDimIndex, yDimIndex, colorScheme);
        
        // 표시된 포인트 수 업데이트
        this.pointCountSpan.textContent = `표시된 포인트: ${displayedCount}개`;
        
        // 윈도우 범위 업데이트
        this.updateWindowControls();
    }

    displayData() {
        // 데이터 출력 영역 초기화
        this.dataOutput.innerHTML = '';

        // 메타데이터 표시
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'data-point';
        let metadataHTML = `
            <h3>데이터 메타정보</h3>
            <p><span class="coord-label">차원 수:</span> ${this.currentData.metadata.dimensions}</p>
            <p><span class="coord-label">차원 이름:</span> ${this.currentData.metadata.dimNames.join(', ')}</p>
            <p><span class="coord-label">생성된 포인트 수:</span> ${this.currentData.metadata.pointCount}</p>
            <p><span class="coord-label">값 타입:</span> ${this.currentData.metadata.valueType}</p>
        `;
        
        // 벡터 타입인 경우 벡터 크기 표시
        if (this.currentData.metadata.vectorSize) {
            metadataHTML += `<p><span class="coord-label">벡터 크기:</span> ${this.currentData.metadata.vectorSize}</p>`;
        }
        
        metadataDiv.innerHTML = metadataHTML;
        this.dataOutput.appendChild(metadataDiv);

        // 범위 정보 표시
        const rangeDiv = document.createElement('div');
        rangeDiv.className = 'data-point';
        let rangeHTML = '<h3>차원별 범위</h3>';
        for (let i = 0; i < this.currentData.metadata.dimensions; i++) {
            rangeHTML += `<p><span class="coord-label">${this.currentData.metadata.dimNames[i]}:</span> 
                [${this.currentData.metadata.dimRangeMin[i].toFixed(2)}, 
                ${this.currentData.metadata.dimRangeMax[i].toFixed(2)}] 
                (간격: ${this.currentData.metadata.dimInterval[i].toFixed(2)})</p>`;
        }
        rangeDiv.innerHTML = rangeHTML;
        this.dataOutput.appendChild(rangeDiv);

        // 처음 10개 포인트 표시
        const sampleDiv = document.createElement('div');
        sampleDiv.className = 'data-point';
        sampleDiv.innerHTML = '<h3>샘플 데이터 (처음 10개)</h3>';
        
        const sampleCount = Math.min(10, this.currentData.points.length);
        for (let i = 0; i < sampleCount; i++) {
            const point = this.currentData.points[i];
            const coordsStr = point.coordinateNum.map((coord, idx) => 
                `${point.dimNames[idx]}: ${coord.toFixed(2)}`
            ).join(', ');
            
            sampleDiv.innerHTML += `
                <p style="margin-left: 1rem;">
                    <span class="coord-label">Point ${i + 1}:</span> (${coordsStr}) → 
                    <span class="value-label">${point.value.toString()}</span>
                </p>
            `;
        }
        
        this.dataOutput.appendChild(sampleDiv);

        // JSON 데이터 다운로드 버튼 추가
        const downloadDiv = document.createElement('div');
        downloadDiv.className = 'data-point';
        downloadDiv.innerHTML = `
            <button id="downloadBtn" class="btn-primary">JSON 데이터 다운로드</button>
        `;
        this.dataOutput.appendChild(downloadDiv);

        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadData();
        });
    }

    downloadData() {
        if (!this.currentData) return;

        const dataStr = JSON.stringify(this.currentData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `high_dim_data_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new HighDimensionalDataApp();
});