import { Lesson } from "@/types/lesson";

export const unit01: Lesson = {
  id: "grammar-unit-1",
  courseId: "grammar-beginner",
  title: "Present Continuous",
  description: "I am doing / She is working / They are playing",
  order: 1,

  sections: [
    {
      id: "intro",
      type: "INTRO",
      title: "Study this example",
      order: 1,
      content: "Sarah is driving to work. She is on her way to work right now.",
      image: "/assets/lesson/car-driving.jpg",
    },

    {
      id: "grammar",
      type: "GRAMMAR",
      title: "Form",
      order: 2,
      content:
        "am / is / are + verb-ing\n\nI am reading\nShe is cooking\nThey are playing",
    },

    {
      id: "example",
      type: "EXAMPLE",
      title: "Examples",
      order: 3,
      content: "He is working now\nWe are studying English\nIt is raining",
      image: "/assets/lesson/study.jpg",
    },

    {
      id: "practice",
      type: "PRACTICE",
      title: "Practice",
      order: 4,
      content: "Fill the blank:\n\nShe ____ reading a book.\n( is / are / am )",
    },

    {
      id: "quiz",
      type: "QUIZ",
      title: "Check your understanding",
      order: 5,
      content: "5 questions quiz will start here",
    },
  ],
};
