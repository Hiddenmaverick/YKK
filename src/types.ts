export type Lesson = {
  id: string;
  title: string;
  description: string;
  questionFile: string;
};

export type MultipleChoiceQuestion = {
  id: string;
  type: "multiple-choice";
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export type FillBlankQuestion = {
  id: string;
  type: "fill-blank";
  prompt: string;
  answer: string | string[];
  explanation: string;
};

export type Question = MultipleChoiceQuestion | FillBlankQuestion;

export type AnswerRecord = {
  question: Question;
  studentAnswer: string;
  isCorrect: boolean;
};
