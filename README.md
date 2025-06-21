# 2D Visualization Demo

This project contains a small data generator and visualization page.

## Prerequisites

- A modern web browser that supports ES modules.

## Usage

1. Open `data_generator_ver1/index.html` in your browser. Generate data with the **데이터 생성** button.
2. After data is generated, the **그래프 생성** button becomes enabled. Clicking it opens `visualization.html` to display the chart.
3. You can also directly open `data_generator_ver1/visualization.html` after generating data in the generator page.

## Optional: quick syntax check

If you have Node.js installed, you can perform a syntax check with:

```bash
node --check data_generator_ver1/main.js
node --check data_generator_ver1/visualizationPage.js
```

These commands parse the scripts without running them.
