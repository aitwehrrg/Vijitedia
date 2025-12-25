# Vijitedia

**Vijitedia** is an interactive academic planning tool designed for engineering students at the **Veermata Jijabai Technological Institute (VJTI)**. It features a dynamic curriculum flowsheet for visualizing course dependencies and a robust CGPA calculator with predictive capabilities.

---

## Project Structure

```text
app
├── calculator
│   ├── [programId]
│   │   └── page.tsx      # Client-side calculator logic
│   └── page.tsx          # Calculator landing page
├── flowsheet
│   ├── [programId]
│   │   └── page.tsx      # Interactive flowsheet canvas
│   └── page.tsx          # Flowsheet landing page
├── favicon.ico
├── globals.css
├── layout.tsx
└── page.tsx              # Main landing page
components
├── ui/                   # ShadCN components (badge, button, etc.)
├── course-card.tsx       # Renders individual course blocks
└── elective-card.tsx     # Renders interactive elective slots
data
├── majors/               # Degree specific data
├── grades.ts             # Grade point mapping (AA = 10.0)
├── minors.ts             # Minor definitions
└── programs.ts           # Main curriculum data structure
```

## How it works

### 1. Prerequisite & Postrequisite Visualization

The flowsheet treats the curriculum as a directed graph where nodes are courses and edges are dependencies.
- **Prerequisites**: These are defined explicitly in the `data/programs.ts` file. Each course has a `prereqs` array containing the IDs of courses that must be taken first.
- **Postrequisites**: These are calculated inversely at runtime. The system scans all courses to see which ones list the current course as a prerequisite.
- **Visualization**: The app uses SVG lines to connect these courses. It calculates the exact screen coordinates of the HTML elements (using `getBoundingClientRect`) to draw smooth Bézier curves between dependent cards.

### 2. CGPA Calculation

The Cumulative Grade Point Average (CGPA) is calculated using a standard credit-weighted mean.

$$ \text{CGPA} = \frac{\sum (G_i \times C_i)}{\sum C_i} $$

Where:
- $G_i$​ = Grade points earned in a specific course (e.g., AA = 10.0, AB = 9.0).
- $C_i$​ = The credit value of that course.

The calculator runs entirely on the client side and persists data using the browser's `localStorage` so users don't lose their inputs on refresh.

### 3. CGPA Prediction

The predictor helps students understand what grades they need in the future to hit a specific goal. It solves for the **Required Average** based on the total credits defined in the degree program.

$$ \text{Required Avg} = \frac{(\text{Target} \times C_{\text{total}}) - P_{\text{earned}}}{C_{\text{remaining}}} $$

Where:
- $C_{\text{total}}$​ = Total credits in the entire degree program.
- $P_{\text{earned}}$​ = Total grade points currently accumulated.
- $C_{\text{remaining}}$​ = Credits left to complete.

If the result is >10.0 or <0.0, the interface marks the target as mathematically impossible.

---