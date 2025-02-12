import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Instructions() {
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [markdownContent, setMarkdownContent] = useState<string>('');

  // List of available lessons
  const lessons = ['lesson_1.md']; // Add more lessons as needed

  useEffect(() => {
    if (selectedLesson) {
      // Fetch and load the markdown content
      fetch(`/content/${selectedLesson}`)
        .then((response) => response.text())
        .then((content) => setMarkdownContent(content))
        .catch((error) => console.error('Error loading markdown:', error));
    }
  }, [selectedLesson]);

  return (
    <div className="h-full">
      <h2 className="text-xl font-bold mb-4">Instructions</h2>
      
      {/* Lesson selector dropdown */}
      <select
        value={selectedLesson}
        onChange={(e) => setSelectedLesson(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="">Select a lesson</option>
        {lessons.map((lesson) => (
          <option key={lesson} value={lesson}>
            {lesson}
          </option>
        ))}
      </select>

      {/* Markdown content */}
      <div className="prose">
        {selectedLesson ? (
          <ReactMarkdown>{markdownContent}</ReactMarkdown>
        ) : (
          <p>Please select a lesson to begin...</p>
        )}
      </div>
    </div>
  );
} 