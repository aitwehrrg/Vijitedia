# Vijitedia

**Vijitedia** is an interactive academic planning tool designed for engineering students at the **Veermata Jijabai Technological Institute (VJTI)**. It features a dynamic curriculum flowsheet for visualizing course dependencies and a robust CGPA calculator with predictive capabilities.

---

## Project Structure

```text
├── app
│   ├── calculator
│   │   ├── [programId]
│   │   │   ├── calculator-client.tsx     # Client-side calculator logic
│   │   │   └── page.tsx                  # Server wrapper for calculator
│   │   └── page.tsx                      # Calculator landing page
│   ├── flowsheet
│   │   ├── [programId]
│   │   │   ├── flowsheet-client.tsx      # Interactive canvas & state manager
│   │   │   └── page.tsx                  # Server wrapper for flowsheet
│   │   └── page.tsx                      # Flowsheet landing page
│   ├── fonts/                            # Local font files
│   ├── globals.css                       # Global styles & Tailwind directives
│   ├── layout.tsx                        # Root application layout
│   ├── not-found.tsx                     # 404 Error page
│   └── page.tsx                          # Main landing page
├── components
│   ├── flowsheet/                        # Flowsheet modular components
│   ├── ui/                               # Reusable ShadCN components
│   ├── course-card.tsx                   # Renders individual course blocks
│   ├── elective-card.tsx                 # Renders interactive elective slots
│   ├── honors-slot.tsx                   # Renders honors degree slots
│   └── minor-slot.tsx                    # Renders minor degree slots
├── data
│   ├── majors/                           # Degree-specific JSON data
│   ├── electives.ts                      # Elective pool definitions
│   ├── grades.ts                         # Grade point mapping (AA = 10.0)
│   ├── honors.ts                         # Honors program definitions
│   ├── minors.ts                         # Minor degree definitions
│   └── programs.ts                       # Main curriculum registry
├── lib
│   └── utils.ts                          # Utility functions
├── types
│   └── flowsheet.ts                      # TypeScript interfaces (Course, Program)
├── package.json
└── ... (config files)
```

## How it works

### 1. Data Structures

The curriculum is modeled as a **Directed Acyclic Graph (DAG)**.
- **Nodes**: Represent Courses (Core, Electives, or Minor slots).
- **Edges**: Represent Dependencies (Prerequisites).

The data is stored in a normalized JSON structure within `data/programs.ts`:
```ts
interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  prereqs?: string[];
  type: "core" | "elective" | "minor";
  // ...
}
```

### 2. Flowsheet

The visualization logic in `flowsheet/[programId]/page.tsx` handles the graph traversal and rendering.

#### A. Dependency Resolution

The graph relationships are determined at runtime:
- **Prerequisites (Incoming Edges)**: Defined explicitly in the `prereqs` array of a course object.
- **Postrequisites (Outgoing Edges)**: Calculated via an inverted index lookup. The system iterates through the course map to find which nodes list the _current_ node as a prerequisite.

#### B. Dynamic Node Swapping

The application optimizes graph traversal by pre-computing relationship maps.
- Instead of iterating through the entire node array ($\mathcal{O}(N)$) during every render cycle to determine connectivity, the system generates a **Relationship Set** for the active node upon interaction.
- Child components determine their rendering state (e.g., `prereq`, `postreq`, `default`) via constant-time `Set.has()` lookups ($\mathcal{O}(1)$), significantly reducing the computational overhead during rapid state changes.

#### C. Bézier Curve Rendering

Connections are drawn using an SVG overlay that sits on top of the HTML grid.
1. **Coordinate Mapping**: The app uses `getBoundingClientRect()` to find the exact DOM position of the Source (Prereq) and Target (Current) cards relative to the container.
2. **Path Calculation**: A Cubic Bézier curve is generated: $$B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$$
- $P_0$​: Right edge of the Prerequisite card.
- $P_3$​: Left edge of the Target card.
- $P_1$​, $P_2$​ (Control Points): Calculated dynamically based on the horizontal distance ($\Delta x$) between cards to create a smooth "S" shape.

```ts
// Simplified logic for control points
const intensity = Math.min(Math.abs(dx) * 0.5, 120);
const path = `M ${start.x} ${start.y} 
              C ${start.x + intensity} ${start.y}, 
                ${end.x - intensity} ${end.y}, 
                ${end.x} ${end.y}`;
```

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