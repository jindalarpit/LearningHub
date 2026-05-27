# LearningHub

An interactive interview preparation platform covering **DSA Patterns**, **Machine Learning**, and **System Design**. Built with React and Vite.

## Features

- **DSA Patterns** — 14 coding patterns with 120+ problems tagged by Google & Microsoft frequency
- **Machine Learning** — 16 modules from neural network foundations to production ML systems, with flashcards and quizzes
- **System Design** — 8 fundamentals + 12 case studies with interactive architecture animations
- Dashboard with progress tracking, streak counter, and weekly activity visualization
- Dark/light theme toggle
- Responsive design for desktop and mobile

## Tech Stack

- React 19
- Vite 6
- Pure CSS (no external UI library)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── App.jsx                  # Main app shell and dashboard
├── main.jsx                 # Entry point
├── dsa_app.jsx              # DSA Patterns course
├── ml_learning_app_new.jsx  # Machine Learning course
├── ml_content.js            # ML module content data
├── sd_app.jsx               # System Design course
├── sd_anims_1.jsx           # SD interactive animations (part 1)
├── sd_anims_2.jsx           # SD interactive animations (part 2)
├── sd_modules_1.js          # SD module content (part 1)
└── sd_modules_2.js          # SD module content (part 2)
```

## License

Private project — not licensed for redistribution.
