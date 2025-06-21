// ui/controlPanel.js
import { globalEventBus } from '../utils/eventBus.js';

/**
 * 데이터 생성 컨트롤 패널 UI 컴포넌트
 */
export class ControlPanel {
    constructor(config) {
        this.elements = {
            dimensions: document.getElementById(config.dimensionsId || 'dimensions'),
            pointCount: document.getElementById(config.pointCountId || 'pointCount'),
            valueType: document.getElementById(config.valueTypeId || 'valueType'),
            vectorSize: document.getElementById(config.vectorSizeId || 'vectorSize'),
            vectorSizeGroup: document.getElementById(config.vectorSizeGroupId || 'vectorSizeGroup'),
            generateBtn: document.getElementById(config.generateBtnId || 'generateBtn')
        };

        this.validateElements();
        this.initializeEventListeners();
        this.eventBus = config.eventBus || globalEventBus;
    }

    /**
     * 요소 검증
     */
    validateElements() {
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element && key !== 'vectorSize' && key !== 'vectorSizeGroup') {
                console.warn(`Element '${key}' not found`);
            }
        }
    }

    /**
     * 이벤트 리스너 초기화
     */
    initializeEventListeners() {
        // 값 타입 변경 시 벡터 크기 입력 표시/숨김
        if (this.elements.valueType) {
            this.elements.valueType.addEventListener('change', (e) => {
                this.handleValueTypeChange(e.target.value);
            });
        }

        // 생성 버튼 클릭
        if (this.elements.generateBtn) {
            this.elements.generateBtn.addEventListener('click', () => {
                this.handleGenerate();
            });
        }

        // 엔터 키 지원
        const inputs = [
            this.elements.dimensions,
            this.elements.pointCount,
            this.elements.vectorSize
        ].filter(el => el);

        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleGenerate();
                }
            });
        });
    }

    /**
     * 값 타입 변경 처리
     * @param {string} valueType - 선택된 값 타입
     */
    handleValueTypeChange(valueType) {
        const isVector = valueType === 'vector' || valueType === 'labelVector';
        this.showVectorSizeInput(isVector);
        
        this.eventBus.emit('valueTypeChanged', { valueType, isVector });
    }

    /**
     * 벡터 크기 입력 표시/숨김
     * @param {boolean} show - 표시 여부
     */
    showVectorSizeInput(show) {
        if (this.elements.vectorSizeGroup) {
            this.elements.vectorSizeGroup.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * 데이터 생성 처리
     */
    handleGenerate() {
        const config = this.getConfiguration();
        
        // 유효성 검사
        const validation = this.validateConfiguration(config);
        if (!validation.valid) {
            this.eventBus.emit('validationError', validation.error);
            alert(validation.error);
            return;
        }

        // 생성 버튼 비활성화
        this.setGenerateButtonState(false, '생성 중...');

        // 데이터 생성 요청 이벤트 발생
        this.eventBus.emit('generateData', config);
    }

    /**
     * 현재 설정 가져오기
     * @returns {Object} 설정 객체
     */
    getConfiguration() {
        const valueType = this.getValueType();
        const isVector = valueType === 'vector' || valueType === 'labelVector';

        return {
            dimensions: this.getDimensions(),
            pointCount: this.getPointCount(),
            valueType: valueType,
            vectorSize: isVector ? this.getVectorSize() : undefined
        };
    }

    /**
     * 설정 유효성 검사
     * @param {Object} config - 설정 객체
     * @returns {Object} 유효성 검사 결과
     */
    validateConfiguration(config) {
        if (config.dimensions < 2 || config.dimensions > 10) {
            return { valid: false, error: '차원 수는 2에서 10 사이여야 합니다.' };
        }

        if (config.pointCount < 1 || config.pointCount > 10000) {
            return { valid: false, error: '포인트 수는 1에서 10000 사이여야 합니다.' };
        }

        if (config.vectorSize !== undefined) {
            if (config.vectorSize < 2 || config.vectorSize > 10) {
                return { valid: false, error: '벡터 크기는 2에서 10 사이여야 합니다.' };
            }
        }

        return { valid: true };
    }

    /**
     * 차원 수 가져오기
     * @returns {number} 차원 수
     */
    getDimensions() {
        return parseInt(this.elements.dimensions?.value || 3);
    }

    /**
     * 포인트 개수 가져오기
     * @returns {number} 포인트 개수
     */
    getPointCount() {
        return parseInt(this.elements.pointCount?.value || 100);
    }

    /**
     * 값 타입 가져오기
     * @returns {string} 값 타입
     */
    getValueType() {
        return this.elements.valueType?.value || 'double';
    }

    /**
     * 벡터 크기 가져오기
     * @returns {number} 벡터 크기
     */
    getVectorSize() {
        return parseInt(this.elements.vectorSize?.value || 3);
    }

    /**
     * 차원 수 설정
     * @param {number} value - 차원 수
     */
    setDimensions(value) {
        if (this.elements.dimensions) {
            this.elements.dimensions.value = value;
        }
    }

    /**
     * 포인트 개수 설정
     * @param {number} value - 포인트 개수
     */
    setPointCount(value) {
        if (this.elements.pointCount) {
            this.elements.pointCount.value = value;
        }
    }

    /**
     * 값 타입 설정
     * @param {string} value - 값 타입
     */
    setValueType(value) {
        if (this.elements.valueType) {
            this.elements.valueType.value = value;
            this.handleValueTypeChange(value);
        }
    }

    /**
     * 벡터 크기 설정
     * @param {number} value - 벡터 크기
     */
    setVectorSize(value) {
        if (this.elements.vectorSize) {
            this.elements.vectorSize.value = value;
        }
    }

    /**
     * 생성 버튼 상태 설정
     * @param {boolean} enabled - 활성화 여부
     * @param {string} [text] - 버튼 텍스트 (선택적)
     */
    setGenerateButtonState(enabled, text) {
        if (this.elements.generateBtn) {
            this.elements.generateBtn.disabled = !enabled;
            if (text) {
                this.elements.generateBtn.textContent = text;
            } else {
                this.elements.generateBtn.textContent = '데이터 생성';
            }
        }
    }

    /**
     * 모든 입력 활성화/비활성화
     * @param {boolean} enabled - 활성화 여부
     */
    setAllInputsEnabled(enabled) {
        const inputs = [
            this.elements.dimensions,
            this.elements.pointCount,
            this.elements.valueType,
            this.elements.vectorSize
        ].filter(el => el);

        inputs.forEach(input => {
            input.disabled = !enabled;
        });
    }

    /**
     * 설정 초기화
     */
    reset() {
        this.setDimensions(3);
        this.setPointCount(100);
        this.setValueType('double');
        this.setVectorSize(3);
        this.showVectorSizeInput(false);
    }

    /**
     * 프리셋 적용
     * @param {Object} preset - 프리셋 설정
     */
    applyPreset(preset) {
        if (preset.dimensions) this.setDimensions(preset.dimensions);
        if (preset.pointCount) this.setPointCount(preset.pointCount);
        if (preset.valueType) this.setValueType(preset.valueType);
        if (preset.vectorSize) this.setVectorSize(preset.vectorSize);
    }
}