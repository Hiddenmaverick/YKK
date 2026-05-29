# YKK-v2 English Practice

A simple English practice website for Japanese high school students.

This site is designed to be simple and safe:

- No login
- No database
- No backend
- No analytics
- No student names, student numbers, emails, or personal information
- Teacher-editable lesson and question files in `public/data`

The site is configured for GitHub Pages as a project site at `/YKK-v2/`.

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the site:

```bash
npm run build
```

## Add a lesson

Edit this file:

```text
public/data/lessons.json
```

Each lesson needs:

```json
{
  "id": "lesson-01",
  "title": "Lesson 1: Introductions and Be Verbs",
  "description": "Practice greetings, simple introductions, and am/is/are.",
  "questionFile": "lesson-01.json"
}
```

Then create the matching question file in:

```text
public/data/questions/
```

For example:

```text
public/data/questions/lesson-01.json
```

## Add a multiple-choice question

Use this format inside a question file:

```json
{
  "id": "lesson-01-q1",
  "type": "multiple-choice",
  "prompt": "Choose the correct sentence.",
  "choices": [
    "She is my friend.",
    "She are my friend.",
    "She am my friend.",
    "She be my friend."
  ],
  "answer": "She is my friend.",
  "explanation": "Use “is” with “she,” “he,” or “it.”"
}
```

## Add a fill-in-the-blank question

Use this format:

```json
{
  "id": "lesson-01-q2",
  "type": "fill-in-the-blank",
  "prompt": "Fill in the blank: I _____ from Japan.",
  "answer": ["am", "'m"],
  "explanation": "Use “am” with “I”: I am from Japan."
}
```

The `answer` field can be one string:

```json
"answer": "am"
```

Or multiple accepted strings:

```json
"answer": ["am", "'m"]
```

Student answers are checked without caring about capital letters or extra spaces at the beginning or end.

## Important teacher notes

- Do not add student names, student numbers, emails, or other personal information.
- Do not add copyrighted textbook content unless you have permission.
- Keep question IDs unique.
- If the site stops loading after editing JSON, check for missing commas or quotation marks.
