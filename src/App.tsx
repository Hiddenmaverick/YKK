import { useEffect, useMemo, useState } from "react";
import type { AnswerRecord, Lesson, Question } from "./types";

type Screen = "lesson-list" | "loading" | "quiz" | "results";

const lessonsUrl = `${import.meta.env.BASE_URL}data/lessons.json`;

function getQuestionsUrl(questionFile: string): string {
  return `${import.meta.env.BASE_URL}data/questions/${questionFile}`;
}

function shuffleQuestions(questions: Question[]): Question[] {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function getAcceptedAnswers(question: Question): string[] {
  return Array.isArray(question.answer) ? question.answer : [question.answer];
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

function isCorrectAnswer(question: Question, studentAnswer: string): boolean {
  const normalizedStudentAnswer = normalizeAnswer(studentAnswer);

  return getAcceptedAnswers(question).some(
    (acceptedAnswer) => normalizeAnswer(acceptedAnswer) === normalizedStudentAnswer,
  );
}

function App() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [checkedAnswer, setCheckedAnswer] = useState<AnswerRecord | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [screen, setScreen] = useState<Screen>("lesson-list");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLessons() {
      try {
        const lessonsResponse = await fetch(lessonsUrl);

        if (!lessonsResponse.ok) {
          throw new Error("Could not load lessons.");
        }

        const loadedLessons = (await lessonsResponse.json()) as Lesson[];
        setLessons(loadedLessons);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load lessons.",
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
    setScreen("loading");
    setErrorMessage("");
    setSelectedLesson(lesson);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setStudentAnswer("");
    setCheckedAnswer(null);
    setAnswers([]);

    try {
      const questionsResponse = await fetch(getQuestionsUrl(lesson.questionFile));

      if (!questionsResponse.ok) {
        throw new Error(`Could not load questions for ${lesson.title}.`);
      }

      const loadedQuestions = (await questionsResponse.json()) as Question[];
      setQuestions(shuffleQuestions(loadedQuestions));
      setScreen("quiz");
    } catch (error) {
      setScreen("lesson-list");
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load questions.",
      );
    }
  }

  function checkAnswer() {
    if (!currentQuestion || !studentAnswer.trim()) {
      return;
    }

    const answerRecord: AnswerRecord = {
      question: currentQuestion,
      studentAnswer,
      isCorrect: isCorrectAnswer(currentQuestion, studentAnswer),
    };

    setCheckedAnswer(answerRecord);
    setAnswers((previousAnswers) => [...previousAnswers, answerRecord]);
  }

  function showNextQuestion() {
    setStudentAnswer("");
    setCheckedAnswer(null);

    if (currentQuestionIndex + 1 >= questions.length) {
      setScreen("results");
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
  }

  function chooseAnotherLesson() {
    setSelectedLesson(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setStudentAnswer("");
    setCheckedAnswer(null);
    setAnswers([]);
    setScreen("lesson-list");
  }

  function retryLesson() {
    if (selectedLesson) {
      startQuiz(selectedLesson);
    }
  }

  return (
    <main className="app">
      <section className="hero">
        <p className="privacy-note">No login. No personal information.</p>
        <h1>English Practice</h1>
        <p>
          Choose a lesson, answer randomized questions, and review your answers
          at the end.
        </p>
      </section>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {screen === "lesson-list" && (
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

      {screen === "loading" && (
        <section className="card">
          <p>Loading questions...</p>
        </section>
      )}

      {screen === "quiz" && currentQuestion && (
        <section className="card quiz-card">
          <div className="quiz-meta">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            {selectedLesson && <span>{selectedLesson.title}</span>}
          </div>

          <h2>{currentQuestion.prompt}</h2>

          {currentQuestion.type === "multiple-choice" ? (
            <div className="choices">
              {currentQuestion.choices.map((choice) => (
                <button
                  className={studentAnswer === choice ? "selected" : ""}
                  disabled={checkedAnswer !== null}
                  key={choice}
                  type="button"
                  onClick={() => setStudentAnswer(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <label className="text-answer">
              Your answer
              <input
                disabled={checkedAnswer !== null}
                type="text"
                value={studentAnswer}
                onChange={(event) => setStudentAnswer(event.target.value)}
              />
            </label>
          )}

          {checkedAnswer === null ? (
            <button
              className="primary-button"
              disabled={!studentAnswer.trim()}
              type="button"
              onClick={checkAnswer}
            >
              Check answer
            </button>
          ) : (
            <div
              className={`feedback ${checkedAnswer.isCorrect ? "correct" : "incorrect"}`}
            >
              <h3>{checkedAnswer.isCorrect ? "Correct!" : "Not quite."}</h3>
              {!checkedAnswer.isCorrect && (
                <p>
                  Correct answer: {getAcceptedAnswers(currentQuestion).join(" / ")}
                </p>
              )}
              <p>{currentQuestion.explanation}</p>
              <button type="button" onClick={showNextQuestion}>
                {currentQuestionIndex + 1 === questions.length
                  ? "See final score"
                  : "Next question"}
              </button>
            </div>
          )}
        </section>
      )}

      {screen === "results" && (
        <section className="card results-card">
          <h2>Final score</h2>
          <p className="score">
            {score} / {questions.length}
          </p>

          <h3>Review</h3>
          <ol className="review-list">
            {answers.map((answerRecord) => (
              <li key={answerRecord.question.id}>
                <p className="review-prompt">{answerRecord.question.prompt}</p>
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
                    {getAcceptedAnswers(answerRecord.question).join(" / ")}
                  </p>
                )}
                <p>{answerRecord.question.explanation}</p>
              </li>
            ))}
          </ol>

          <div className="button-row">
            <button type="button" onClick={retryLesson}>
              Retry
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
