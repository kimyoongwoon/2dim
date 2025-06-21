// visualization/colorSchemes.js
/**
 * 시각화를 위한 색상 스킴 관리
 */
export class ColorSchemes {
    /**
     * 정규화된 값(0-1)을 색상으로 변환
     * @param {number} value - 0과 1 사이의 값
     * @param {string} scheme - 색상 스킴 이름
     * @returns {string} RGB 색상 문자열
     */
    static getColor(value, scheme = 'viridis') {
        // 0-1 범위로 클램프
        value = Math.max(0, Math.min(1, value));

        switch (scheme) {
            case 'viridis':
                return ColorSchemes.viridis(value);
            case 'plasma':
                return ColorSchemes.plasma(value);
            case 'coolwarm':
                return ColorSchemes.coolwarm(value);
            case 'rainbow':
                return ColorSchemes.rainbow(value);
            case 'turbo':
                return ColorSchemes.turbo(value);
            case 'inferno':
                return ColorSchemes.inferno(value);
            case 'magma':
                return ColorSchemes.magma(value);
            case 'cividis':
                return ColorSchemes.cividis(value);
            default:
                return ColorSchemes.viridis(value);
        }
    }

    /**
     * Viridis 색상 스킴
     * @param {number} t - 0과 1 사이의 값
     * @returns {string} RGB 색상 문자열
     */
    static viridis(t) {
        const r = Math.floor(255 * (0.267 + 0.004*t + 0.329*t*t - 0.446*t*t*t + 0.341*t*t*t*t));
        const g = Math.floor(255 * (0.005 + 1.399*t - 0.859*t*t + 0.135*t*t*t));
        const b = Math.floor(255 * (0.331 + 0.872*t - 1.773*t*t + 1.573*t*t*t));
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Plasma 색상 스킴
     * @param {number} t - 0과 1 사이의 값
     * @returns {string} RGB 색상 문자열
     */
    static plasma(t) {
        const r = Math.floor(255 * (0.05 + 2.53*t - 4.29*t*t + 3.09*t*t*t));
        const g = Math.floor(255 * (0.03 + 0.07*t + 0.76*t*t - 0.77*t*t*t));
        const b = Math.floor(255 * (0.53 + 1.28*t - 2.74*t*t + 1.92*t*t*t));
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Cool-Warm 색상 스킴
     * @param {number} t - 0과 1 사이의 값
     * @returns {string} RGB 색상 문자열
     */
    static coolwarm(t) {
        const r = Math.floor(255 * (0.23 + 0.76*t));
        const g = Math.floor(255 * (0.43 + 0.57*(1-2*Math.abs(t-0.5))));
        const b = Math.floor(255 * (0.78 - 0.77*t));
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Rainbow 색상 스킴
     * @param {number} t - 0과 1 사이의 값
     * @returns {string} RGB 색상 문자열
     */
    static rainbow(t) {
        const r = Math.floor(255 * Math.max(0, 2 - 6*Math.abs(t - 0.0)));
        const g = Math.floor(255 * Math.max(0, 2 - 6*Math.abs(t - 0.33)));
        const b = Math.floor(255 * Math.max(0, 2 - 6*Math.abs(t - 0.67)));
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Turbo 색상 스킴
     * @param {number} t - 0과 1 사이의 값
     * @returns {string} RGB 색상 문자열
     */
    static turbo(t) {
        const r = Math.floor(255 * Math.max(0, Math.min(1, 
            4.55*t - 1.82)));
        const g = Math.floor(255 * Math.max(0, Math.min(1, 
            2.36 - Math.abs(4.72*t - 2.36))));
        const b = Math.floor(255 * Math.max(0, Math.min(1, 
            3.64 - 4.55*t)));
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Inferno 색상 스킴
     * @param {number} t - 0과 1 사이의 값
     * @returns {string} RGB 색상 문자열
     */
    static inferno(t) {
        const r = Math.floor(255 * (-0.02 + 2.72*t - 3.47*t*t + 2.33*t*t*t));
        const g = Math.floor(255 * (0.01 + 0.28*t + 0.84*t*t - 1.01*t*t*t));
        const b = Math.floor(255 * (0.02 + 3.06*t - 8.55*t*t + 6.98*t*t*t));
        return `rgb(${Math.max(0, r)}, ${Math.max(0, g)}, ${Math.max(0, b)})`;
    }

    /**
     * Magma 색상 스킴
     * @param {number} t - 0과 1 사이의 값
     * @returns {string} RGB 색상 문자열
     */
    static magma(t) {
        const r = Math.floor(255 * (-0.02 + 2.62*t - 3.15*t*t + 2.11*t*t*t));
        const g = Math.floor(255 * (0.01 + 0.31*t + 0.74*t*t - 0.87*t*t*t));
        const b = Math.floor(255 * (0.02 + 2.63*t - 6.40*t*t + 4.82*t*t*t));
        return `rgb(${Math.max(0, r)}, ${Math.max(0, g)}, ${Math.max(0, b)})`;
    }

    /**
     * Cividis 색상 스킴 (색맹 친화적)
     * @param {number} t - 0과 1 사이의 값
     * @returns {string} RGB 색상 문자열
     */
    static cividis(t) {
        const r = Math.floor(255 * (0.00 + 0.44*t + 0.49*t*t));
        const g = Math.floor(255 * (0.14 + 0.50*t + 0.37*t*t));
        const b = Math.floor(255 * (0.28 + 0.75*t - 0.75*t*t));
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * 이산적 색상 팔레트 생성
     * @param {number} count - 색상 개수
     * @param {string} scheme - 색상 스킴 이름
     * @returns {string[]} RGB 색상 배열
     */
    static generatePalette(count, scheme = 'viridis') {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            colors.push(ColorSchemes.getColor(t, scheme));
        }
        return colors;
    }

    /**
     * 값의 범위에 따른 색상 매핑 함수 생성
     * @param {number} min - 최소값
     * @param {number} max - 최대값
     * @param {string} scheme - 색상 스킴 이름
     * @returns {Function} 값을 색상으로 변환하는 함수
     */
    static createColorMapper(min, max, scheme = 'viridis') {
        const range = max - min;
        if (range === 0) {
            return () => ColorSchemes.getColor(0.5, scheme);
        }
        
        return (value) => {
            const normalized = (value - min) / range;
            return ColorSchemes.getColor(normalized, scheme);
        };
    }

    /**
     * 사용 가능한 색상 스킴 목록
     * @returns {Object[]} 색상 스킴 정보 배열
     */
    static getAvailableSchemes() {
        return [
            { value: 'viridis', label: 'Viridis', description: '균일한 지각적 색상' },
            { value: 'plasma', label: 'Plasma', description: '보라색-분홍색 그라디언트' },
            { value: 'coolwarm', label: 'Cool-Warm', description: '파란색-빨간색 대비' },
            { value: 'rainbow', label: 'Rainbow', description: '무지개 색상' },
            { value: 'turbo', label: 'Turbo', description: '개선된 무지개' },
            { value: 'inferno', label: 'Inferno', description: '검정-빨강-노랑' },
            { value: 'magma', label: 'Magma', description: '검정-보라-분홍' },
            { value: 'cividis', label: 'Cividis', description: '색맹 친화적' }
        ];
    }

    /**
     * 색상을 RGBA로 변환
     * @param {string} rgbColor - RGB 색상 문자열
     * @param {number} alpha - 투명도 (0-1)
     * @returns {string} RGBA 색상 문자열
     */
    static toRGBA(rgbColor, alpha = 1) {
        return rgbColor.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }

    /**
     * 색상 대비 계산
     * @param {string} color1 - 첫 번째 색상
     * @param {string} color2 - 두 번째 색상
     * @returns {number} 대비 비율
     */
    static getContrast(color1, color2) {
        // RGB 값 추출
        const rgb1 = color1.match(/\d+/g).map(Number);
        const rgb2 = color2.match(/\d+/g).map(Number);
        
        // 상대 휘도 계산
        const lum1 = ColorSchemes.getLuminance(rgb1);
        const lum2 = ColorSchemes.getLuminance(rgb2);
        
        // 대비 비율 계산
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * RGB 값의 상대 휘도 계산
     * @param {number[]} rgb - RGB 값 배열
     * @returns {number} 상대 휘도
     */
    static getLuminance(rgb) {
        const [r, g, b] = rgb.map(val => {
            val = val / 255;
            return val <= 0.03928
                ? val / 12.92
                : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
}