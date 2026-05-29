import { useEffect, useMemo, useState } from "react";
import type { AnswerRecord, Lesson, Question } from "./types";

type QuizStatus = "choosing" | "loading" | "active" | "finished";

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

function getCorrectAnswers(question: Question): string[] {
  return Array.isArray(question.answer) ? question.answer : [question.answer];
}

function checkAnswer(question: Question, studentAnswer: string): boolean {
  const normalizedStudentAnswer = normalizeAnswer(studentAnswer);

  return getCorrectAnswers(question).some(
    (answer) => normalizeAnswer(answer) === normalizedStudentAnswer,
  );
}

function App() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState<AnswerRecord | null>(
    null,
  );
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [status, setStatus] = useState<QuizStatus>("choosing");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLessons() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/lessons.json`);

        if (!response.ok) {
          throw new Error("Could not load the lesson list.");
        }

        const lessonData = (await response.json()) as Lesson[];
        setLessons(lessonData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load the lesson list.",
        );
      }
    }

    loadLessons();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const score = useMemo(
    () => answers.filter((answer) => answer.isCorrect).length,
    [answers],
  );

  async function startQuiz(lesson: Lesson) {
    setStatus("loading");
    setError("");
    setSelectedLesson(lesson);
    setStudentAnswer("");
    setSubmittedAnswer(null);
    setAnswers([]);
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/questions/${lesson.questionFile}`);

      if (!response.ok) {
        throw new Error(`Could not load questions for ${lesson.title}.`);
      }

      const questionData = (await response.json()) as Question[];
      setQuestions(shuffleArray(questionData));
      setStatus("active");
    } catch (loadError) {
      setStatus("choosing");
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load the questions.",
      );
    }
  }

  function submitAnswer() {
    if (!currentQuestion || !studentAnswer.trim()) {
      return;
    }

    const answerRecord: AnswerRecord = {
      question: currentQuestion,
      studentAnswer,
      isCorrect: checkAnswer(currentQuestion, studentAnswer),
    };

    setSubmittedAnswer(answerRecord);
    setAnswers((previousAnswers) => [...previousAnswers, answerRecord]);
  }

  function goToNextQuestion() {
    setStudentAnswer("");
    setSubmittedAnswer(null);

    if (currentQuestionIndex + 1 >= questions.length) {
      setStatus("finished");
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
  }

  function retryQuiz() {
    if (selectedLesson) {
      startQuiz(selectedLesson);
      return;
    }

    setStatus("choosing");
  }

  function chooseAnotherLesson() {
    setSelectedLesson(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setStudentAnswer("");
    setSubmittedAnswer(null);
    setAnswers([]);
    setStatus("choosing");
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">No login • No personal information</p>
        <h1>English Practice</h1>
        <p className="intro">
          Choose a lesson, answer randomized questions, and review your score at
          the end.
        </p>
      </section>

      {error && <p className="error-message">{error}</p>}

      {status === "choosing" && (
        <section className="card">
          <h2>Choose a lesson</h2>
          <div className="lesson-list">
            {lessons.map((lesson) => (
              <article className="lesson-card" key={lesson.id}>
                <div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                </div>
                <button type="button" onClick={() => startQuiz(lesson)}>
                  Start quiz
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {status === "loading" && (
        <section className="card">
          <p>Loading questions...</p>
        </section>
      )}

      {status === "active" && currentQuestion && (
        <section className="card quiz-card">
          <div className="quiz-header">
            <p>
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            {selectedLesson && <p>{selectedLesson.title}</p>}
          </div>

          <h2>{currentQuestion.prompt}</h2>

          {currentQuestion.type === "multiple-choice" ? (
            <div className="answer-options">
              {currentQuestion.choices.map((choice) => (
                <button
                  className={studentAnswer === choice ? "selected" : ""}
                  disabled={Boolean(submittedAnswer)}
                  key={choice}
                  type="button"
                  onClick={() => setStudentAnswer(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <label className="blank-answer-label">
              Your answer
              <input
                disabled={Boolean(submittedAnswer)}
                type="text"
                value={studentAnswer}
                onChange={(event) => setStudentAnswer(event.target.value)}
              />
            </label>
          )}

          {!submittedAnswer ? (
            <button
              className="primary-action"
              disabled={!studentAnswer.trim()}
              type="button"
              onClick={submitAnswer}
            >
              Check answer
            </button>
          ) : (
            <div
              className={`feedback ${
                submittedAnswer.isCorrect ? "correct" : "incorrect"
              }`}
            >
              <h3>{submittedAnswer.isCorrect ? "Correct!" : "Not quite."}</h3>
              {!submittedAnswer.isCorrect && (
                <p>
                  Correct answer: {getCorrectAnswers(currentQuestion).join(" / ")}
                </p>
              )}
              <p>{currentQuestion.explanation}</p>
              <button type="button" onClick={goToNextQuestion}>
                {currentQuestionIndex + 1 >= questions.length
                  ? "See final score"
                  : "Next question"}
              </button>
            </div>
          )}
        </section>
      )}

      {status === "finished" && (
        <section className="card results-card">
          <h2>Final score</h2>
          <p className="score">
            {score} / {questions.length}
          </p>

          <h3>Review</h3>
          <ol className="review-list">
            {answers.map((answerRecord) => (
              <li key={answerRecord.question.id}>
                <p className="review-question">{answerRecord.question.prompt}</p>
                <p>
                  Your answer: <strong>{answerRecord.studentAnswer}</strong>
                </p>
                <p>
                  Result:{" "}
                  <strong>
                    {answerRecord.isCorrect ? "Correct" : "Incorrect"}
                  </strong>
                </p>
                {!answerRecord.isCorrect && (
                  <p>
                    Correct answer:{" "}
                    {getCorrectAnswers(answerRecord.question).join(" / ")}
                  </p>
                )}
                <p>{answerRecord.question.explanation}</p>
              </li>
            ))}
          </ol>

          <div className="result-actions">
            <button type="button" onClick={retryQuiz}>
              Retry this lesson
            </button>
            <button type="button" onClick={chooseAnotherLesson}>
              Choose another lesson
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
