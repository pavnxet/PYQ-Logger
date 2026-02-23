# Exam Prep Dashboard

A comprehensive dashboard for managing exam preparation questions, organized by Subject and Chapter.

## $\color{red}{\text{I plan to return and continue development at a later date. ⏳}}$

## Features

*   **Hierarchical Management**: Organize questions by Subject > Chapter.
*   **Question Bank**: View, filter, and search questions.
*   **Manual Entry**: Add questions one by one with a rich form.
*   **Bulk Import**:
    *   **CSV Import**: Upload CSV files with column mapping.
    *   **Text Paste**: Paste questions in a standard text format.
*   **Metadata Management**: Add/Delete Subjects and Chapters via Settings.
*   **PDF Export**: Select questions ("Bucket") and export them as a PDF (Question Paper + Answer Key).
*   **Profile Stats**: View activity statistics.

## Getting Started

### Prerequisites

*   Node.js 18+
*   npm

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials (optional if using mock data):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*Note: The application currently runs with a Mock Data layer (`src/lib/mockData.ts`) by default. To switch to Supabase, you would need to uncomment the Supabase client usage in the data fetching functions.*

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Schema

The required database schema for Supabase is documented in `schema.sql`.

## Text Import Format

When using "Paste Text" import, use the following format:

```text
1. What is the capital of France?
A) Berlin
B) Paris
C) Rome
D) Madrid
Answer: B

2. Next question...
```
