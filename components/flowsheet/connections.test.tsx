import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ConnectionLines, Connection } from "./connections";

describe("ConnectionLines", () => {
    it("renders nothing when connections array is empty", () => {
        const { container } = render(<ConnectionLines connections={[]} />);
        expect(container.querySelector("svg")).toBeNull();
    });

    it("renders an SVG when connections are provided", () => {
        const connections: Connection[] = [
            {
                start: { x: 0, y: 0 },
                end: { x: 100, y: 100 },
                type: "prereq",
            },
        ];
        const { container } = render(
            <ConnectionLines connections={connections} />
        );
        expect(container.querySelector("svg")).not.toBeNull();
    });

    it("renders one path per connection", () => {
        const connections: Connection[] = [
            {
                start: { x: 0, y: 0 },
                end: { x: 100, y: 50 },
                type: "prereq",
            },
            {
                start: { x: 10, y: 10 },
                end: { x: 200, y: 100 },
                type: "postreq",
            },
        ];
        const { container } = render(
            <ConnectionLines connections={connections} />
        );
        const paths = container.querySelectorAll("path:not(defs path)");
        // defs contain 2 marker paths, so we count paths outside defs
        expect(paths.length).toBe(2);
    });

    it("renders prereq connections with dashed stroke", () => {
        const connections: Connection[] = [
            {
                start: { x: 0, y: 0 },
                end: { x: 100, y: 50 },
                type: "prereq",
            },
        ];
        const { container } = render(
            <ConnectionLines connections={connections} />
        );
        const path = container.querySelector(
            "svg > path"
        ) as SVGPathElement | null;
        expect(path).not.toBeNull();
        expect(path!.getAttribute("stroke-dasharray")).toBe("5,5");
        expect(path!.getAttribute("stroke")).toBe("#f59e0b");
    });

    it("renders postreq connections with solid stroke", () => {
        const connections: Connection[] = [
            {
                start: { x: 0, y: 0 },
                end: { x: 100, y: 50 },
                type: "postreq",
            },
        ];
        const { container } = render(
            <ConnectionLines connections={connections} />
        );
        const path = container.querySelector(
            "svg > path"
        ) as SVGPathElement | null;
        expect(path).not.toBeNull();
        expect(path!.getAttribute("stroke-dasharray")).toBe("0");
        expect(path!.getAttribute("stroke")).toBe("#3b82f6");
    });

    it("sets correct markerEnd for each connection type", () => {
        const connections: Connection[] = [
            {
                start: { x: 0, y: 0 },
                end: { x: 100, y: 50 },
                type: "prereq",
            },
            {
                start: { x: 10, y: 10 },
                end: { x: 200, y: 100 },
                type: "postreq",
            },
        ];
        const { container } = render(
            <ConnectionLines connections={connections} />
        );
        const paths = container.querySelectorAll("svg > path");
        expect(paths[0].getAttribute("marker-end")).toBe(
            "url(#arrow-prereq)"
        );
        expect(paths[1].getAttribute("marker-end")).toBe(
            "url(#arrow-postreq)"
        );
    });

    it("defines both arrow markers in the SVG defs", () => {
        const connections: Connection[] = [
            {
                start: { x: 0, y: 0 },
                end: { x: 100, y: 50 },
                type: "prereq",
            },
        ];
        const { container } = render(
            <ConnectionLines connections={connections} />
        );
        expect(container.querySelector("#arrow-prereq")).not.toBeNull();
        expect(container.querySelector("#arrow-postreq")).not.toBeNull();
    });

    it("generates correct cubic bezier path data", () => {
        const connections: Connection[] = [
            {
                start: { x: 10, y: 20 },
                end: { x: 110, y: 50 },
                type: "prereq",
            },
        ];
        const { container } = render(
            <ConnectionLines connections={connections} />
        );
        const path = container.querySelector(
            "svg > path"
        ) as SVGPathElement | null;
        const d = path!.getAttribute("d")!;
        // Must start at start point
        expect(d).toContain("M 10 20");
        // Must use C (cubic bezier) to end point
        expect(d).toContain("110 50");
    });
});
