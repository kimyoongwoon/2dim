import { Visualizer } from './visualization/visualization.js';

class VisualizationPage {
    constructor() {
        const dataStr = localStorage.getItem('generatedData');
        if (!dataStr) {
            alert('생성된 데이터가 없습니다.');
            window.location.href = 'index.html';
            return;
        }
        this.currentData = JSON.parse(dataStr);
        this.visualizer = new Visualizer('vizChart');

        this.vizPanel = document.getElementById('vizPanel');
        this.xAxisSelect = document.getElementById('xAxis');
        this.yAxisSelect = document.getElementById('yAxis');
        this.colorSchemeSelect = document.getElementById('colorScheme');
        this.updateVizBtn = document.getElementById('updateVizBtn');
        this.pointCountSpan = document.getElementById('displayedCount');
        this.windowEnabledCheckbox = document.getElementById('windowEnabled');
        this.windowSizeInput = document.getElementById('windowSize');
        this.windowStartSlider = document.getElementById('windowStart');
        this.windowRangeSpan = document.getElementById('windowRange');
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) closeBtn.addEventListener('click', () => window.location.href = 'index.html');

        this.visualizer.setData(this.currentData);
        this.initializeVisualizationUI();
    }

    initializeVisualizationUI() {
        if (!this.vizPanel || !this.xAxisSelect || !this.yAxisSelect) return;
        this.vizPanel.style.display = 'block';
        this.xAxisSelect.innerHTML = '';
        this.yAxisSelect.innerHTML = '';

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

        if (this.currentData.metadata.dimensions === 1) {
            const valueOption = document.createElement('option');
            valueOption.value = 'value';
            valueOption.textContent = '값';
            this.yAxisSelect.appendChild(valueOption);
            this.yAxisSelect.value = 'value';
        } else {
            this.yAxisSelect.value = '1';
        }

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

        if (this.updateVizBtn) {
            const newUpdateVizBtn = this.updateVizBtn.cloneNode(true);
            this.updateVizBtn.parentNode.replaceChild(newUpdateVizBtn, this.updateVizBtn);
            this.updateVizBtn = newUpdateVizBtn;
            this.updateVizBtn.addEventListener('click', () => this.updateVisualization());
        }

        this.createDimensionFilters();

        if (this.windowEnabledCheckbox && this.windowSizeInput && this.windowStartSlider) {
            const newWindowEnabled = this.windowEnabledCheckbox.cloneNode(true);
            this.windowEnabledCheckbox.parentNode.replaceChild(newWindowEnabled, this.windowEnabledCheckbox);
            this.windowEnabledCheckbox = newWindowEnabled;

            const newWindowSize = this.windowSizeInput.cloneNode(true);
            this.windowSizeInput.parentNode.replaceChild(newWindowSize, this.windowSizeInput);
            this.windowSizeInput = newWindowSize;

            const newWindowStart = this.windowStartSlider.cloneNode(true);
            this.windowStartSlider.parentNode.replaceChild(newWindowStart, this.windowStartSlider);
            this.windowStartSlider = newWindowStart;
        }

        if (this.windowEnabledCheckbox) this.windowEnabledCheckbox.addEventListener('change', (e) => {
            this.visualizer.toggleWindow(e.target.checked);
            this.updateWindowControls();
            this.updateVisualization();
        });

        if (this.windowSizeInput) this.windowSizeInput.addEventListener('input', (e) => {
            const xDimIndex = parseInt(this.xAxisSelect.value || 0);
            this.visualizer.resizeWindow(parseFloat(e.target.value), xDimIndex);
            this.updateWindowControls();
            this.updateVisualization();
        });

        if (this.windowStartSlider) this.windowStartSlider.addEventListener('input', (e) => {
            const xDimIndex = parseInt(this.xAxisSelect.value || 0);
            this.visualizer.setWindowStart(parseFloat(e.target.value), xDimIndex);
            this.updateWindowControls();
            this.updateVisualization();
        });

        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener('click', () => {
                const step = this.visualizer.windowConfig.step || 1;
                const newSize = Math.max(step, this.visualizer.windowConfig.windowSize - step);
                const xDimIndex = parseInt(this.xAxisSelect.value || 0);
                this.visualizer.resizeWindow(newSize, xDimIndex);
                this.windowSizeInput.value = newSize;
                this.updateWindowControls();
                this.updateVisualization();
            });
        }

        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener('click', () => {
                const step = this.visualizer.windowConfig.step || 1;
                const newSize = this.visualizer.windowConfig.windowSize + step;
                const xDimIndex = parseInt(this.xAxisSelect.value || 0);
                this.visualizer.resizeWindow(newSize, xDimIndex);
                this.windowSizeInput.value = newSize;
                this.updateWindowControls();
                this.updateVisualization();
            });
        }

        this.updateWindowControls();
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

            const slider = document.getElementById(`filter-slider-${i}`);
            const valueSpan = document.getElementById(`filter-value-${i}`);

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueSpan.textContent = value.toFixed(2);
                this.visualizer.updateFilter(i, { value });
                this.updateVisualization();
            });

            const conditionBtns = filterItem.querySelectorAll('.condition-btn');
            conditionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const dim = parseInt(e.target.dataset.dim);
                    const condition = e.target.dataset.condition;
                    filterItem.querySelectorAll('.condition-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    e.target.classList.add('active');
                    this.visualizer.updateFilter(dim, { condition });
                    this.updateVisualization();
                });
            });
        }
    }

    updateWindowControls() {
        if (!this.visualizer || !this.windowEnabledCheckbox || !this.windowSizeInput || !this.windowStartSlider) return;

        const enabled = this.windowEnabledCheckbox.checked;
        this.windowSizeInput.disabled = !enabled;
        this.windowStartSlider.disabled = !enabled;

        if (enabled && this.visualizer.windowConfig) {
            const { xMin, xMax, windowSize } = this.visualizer.windowConfig;
            this.windowRangeSpan.textContent = `범위: ${xMin.toFixed(1)} ~ ${xMax.toFixed(1)}`;
            const xDimIndex = parseInt(this.xAxisSelect.value || 0);
            const min = this.currentData.metadata.dimRangeMin[xDimIndex];
            const max = this.currentData.metadata.dimRangeMax[xDimIndex];
            const range = max - min;
            if (range <= windowSize) {
                this.windowStartSlider.min = min;
                this.windowStartSlider.max = min;
                this.windowStartSlider.value = min;
                this.windowStartSlider.disabled = true;
            } else {
                this.windowStartSlider.disabled = false;
                this.windowStartSlider.min = min;
                this.windowStartSlider.max = max - windowSize;
                this.windowStartSlider.step = 'any';
                this.windowStartSlider.value = xMin;
            }
        } else {
            this.windowRangeSpan.textContent = '범위: 전체';
        }
    }

    updateVisualization() {
        if (!this.currentData) return;
        const xDimIndex = parseInt(this.xAxisSelect.value);
        const yValue = this.yAxisSelect.value;
        const yDimIndex = yValue === 'value' ? -1 : parseInt(yValue);
        const colorScheme = this.colorSchemeSelect.value;
        if (yDimIndex >= 0 && xDimIndex === yDimIndex) {
            alert('X축과 Y축은 서로 다른 차원을 선택해주세요.');
            return;
        }
        const displayedCount = this.visualizer.updateVisualization(xDimIndex, yDimIndex, colorScheme);
        this.pointCountSpan.textContent = `표시된 포인트: ${displayedCount}개`;
        this.updateWindowControls();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VisualizationPage();
});
