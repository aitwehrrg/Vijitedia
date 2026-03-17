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
        expect(paths.length).toBe(2);
    });

    it("renders prereq connections with dashed stroke and correct color class", () => {
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
        const paths = container.querySelectorAll("svg path");
        const path = paths[2] as SVGPathElement | null;
        expect(path).not.toBeNull();
        expect(path!.getAttribute("stroke-dasharray")).toBe("5,5");
        expect(path!.getAttribute("stroke")).toBe("currentColor");
        expect(path!.className.baseVal).toContain("text-amber-500");
    });

    it("renders postreq connections with solid stroke and correct color class", () => {
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
        const paths = container.querySelectorAll("svg path");
        const path = paths[2] as SVGPathElement | null;
        expect(path).not.toBeNull();
        expect(path!.getAttribute("stroke-dasharray")).toBe("0");
        expect(path!.getAttribute("stroke")).toBe("currentColor");
        expect(path!.className.baseVal).toContain("text-blue-500");
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
        const paths = container.querySelectorAll("svg path");
        expect(paths[2].getAttribute("marker-end")).toBe(
            "url(#arrow-prereq)"
        );
        expect(paths[3].getAttribute("marker-end")).toBe(
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
        const paths = container.querySelectorAll("svg path");
        const path = paths[2] as SVGPathElement | null;
        const d = path!.getAttribute("d")!;
        expect(d).toContain("M 10 20");
        expect(d).toContain("110 50");
    });
});
