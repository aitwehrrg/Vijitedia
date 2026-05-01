import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseCard } from "./course-card";
import { Course } from "@/types/flowsheet";

const mockCourse: Course = {
    id: "TEST001",
    type: "core",
    code: "R5TE1001T",
    title: "Test Course Title",
    credits: 3,
    prereqs: [],
};

describe("CourseCard", () => {
    it("renders course code", () => {
        render(<CourseCard course={mockCourse} status="default" />);
        expect(screen.getByText("R5TE1001T")).toBeInTheDocument();
    });

    it("renders course title", () => {
        render(<CourseCard course={mockCourse} status="default" />);
        expect(screen.getByText("Test Course Title")).toBeInTheDocument();
    });

    it("renders course credits", () => {
        render(<CourseCard course={mockCourse} status="default" />);
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("shows '??' when code is missing", () => {
        const courseNoCode: Course = { ...mockCourse, code: undefined };
        render(<CourseCard course={courseNoCode} status="default" />);
        expect(screen.getByText("??")).toBeInTheDocument();
    });

    it("shows 'Untitled Course' when title is missing", () => {
        const courseNoTitle: Course = { ...mockCourse, title: undefined };
        render(<CourseCard course={courseNoTitle} status="default" />);
        expect(screen.getByText("Untitled Course")).toBeInTheDocument();
    });

    it("shows 0 when credits are missing", () => {
        const courseNoCredits: Course = { ...mockCourse, credits: undefined };
        render(<CourseCard course={courseNoCredits} status="default" />);
        expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("applies hovered variant styles", () => {
        const { container } = render(
            <CourseCard course={mockCourse} status="hovered" />
        );
        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain("border-l-primary");
    });

    it("applies prereq variant styles", () => {
        const { container } = render(
            <CourseCard course={mockCourse} status="prereq" />
        );
        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain("border-l-amber-500");
    });

    it("applies postreq variant styles", () => {
        const { container } = render(
            <CourseCard course={mockCourse} status="postreq" />
        );
        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain("border-l-blue-500");
    });

    it("applies correct dark mode styles for prereq", () => {
        const { container } = render(
            <CourseCard course={mockCourse} status="prereq" />
        );
        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain("dark:bg-amber-500/10");
        expect(card.className).toContain("dark:ring-amber-500/30");
    });

    it("applies correct dark mode styles for postreq", () => {
        const { container } = render(
            <CourseCard course={mockCourse} status="postreq" />
        );
        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain("dark:bg-blue-500/10");
        expect(card.className).toContain("dark:ring-blue-500/30");
    });
});
