# YKK English Practice

A simple student-facing English practice website for high school students.

This first version has:

- No login
- No database
- No backend
- No analytics
- No student names, numbers, emails, or personal information
- Lesson data stored in teacher-editable JSON files

## Run the website locally

Install the project tools:

```bash
npm install
```

Start the local development website:

```bash
npm run dev
```

Build the website for hosting:

```bash
npm run build
```

## How lessons work

The lesson list is in:

```text
public/data/lessons.json
```

Each lesson points to a question file. For example:

```json
{
  "id": "lesson-01",
  "title": "Lesson 1: Introductions and Basic Grammar",
  "description": "Practice simple greetings, be verbs, and everyday classroom English.",
  "questionFile": "lesson-01.json"
}
```

The matching question file is in:

```text
public/data/questions/lesson-01.json
```

## Add a multiple-choice question

Use this format inside a lesson question file:

```json
{
  "id": "lesson-01-q6",
  "type": "multiple-choice",
  "prompt": "Choose the correct sentence.",
  "choices": [
    "He is a student.",
    "He are a student.",
    "He am a student.",
    "He be a student."
  ],
  "answer": "He is a student.",
  "explanation": "Use “is” with “he,” “she,” or “it.”"
}
```

## Add a fill-in-the-blank question

Use this format:

```json
{
  "id": "lesson-01-q7",
  "type": "fill-blank",
  "prompt": "Fill in the blank: They _____ friends.",
  "answer": ["are", "'re"],
  "explanation": "Use “are” with “they.” The short form “they're” is also correct."
}
```

The `answer` can be one correct answer:

```json
"answer": "am"
```

Or several accepted answers:

```json
"answer": ["am", "'m"]
```

Student answers are checked without caring about capital letters or extra spaces at the beginning or end.

## Important editing tips

- Keep every question `id` unique.
- Put commas between questions.
- Use straight double quotation marks around JSON keys and text.
- Do not collect student names, student numbers, email addresses, or other personal information.
- If the website stops loading after editing a question file, check for a missing comma or quotation mark.
