import type { JSONContent } from '@tiptap/react';
import type { EditorAudiobook } from '../types/editor';

function paragraph(text: string): JSONContent {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

function headingAndParagraph(
  heading: string,
  body: string
): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: heading }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: body }],
      },
    ],
  };
}

export const EDITOR_MOCK_AUDIOBOOKS: EditorAudiobook[] = [
  {
    id: 'ab-authoring-1',
    title: 'The Great Epic',
    author: 'Ravi Sharma',
    chapters: [
      {
        id: 'ch-1',
        chapterNumber: 1,
        title: 'Introduction',
        pages: [
          {
            id: 'pg-1-1',
            pageNumber: 1,
            plainText: 'Welcome to the beginning of our journey.',
            richText: headingAndParagraph(
              'The Beginning',
              'Welcome to the beginning of our journey. This chapter sets the stage for everything that follows.'
            ),
          },
          {
            id: 'pg-1-2',
            pageNumber: 2,
            plainText: 'The elders gathered at dawn to share their wisdom.',
            richText: paragraph(
              'The elders gathered at dawn to share their wisdom with the young seekers who had traveled from distant villages.'
            ),
          },
        ],
      },
      {
        id: 'ch-2',
        chapterNumber: 2,
        title: 'The Journey Begins',
        pages: [
          {
            id: 'pg-2-1',
            pageNumber: 1,
            plainText: 'At sunrise, the caravan departed.',
            richText: paragraph(
              'At sunrise, the caravan departed through the mountain pass, carrying hopes and stories untold.'
            ),
          },
          {
            id: 'pg-2-2',
            pageNumber: 2,
            plainText: 'By midday they reached the river crossing.',
            richText: paragraph(
              'By midday they reached the river crossing where the ferryman waited with a knowing smile.'
            ),
          },
        ],
      },
    ],
  },
  {
    id: 'ab-authoring-2',
    title: 'Folk Tales of the Valley',
    author: 'Ananya Patel',
    chapters: [
      {
        id: 'ch-3',
        chapterNumber: 1,
        title: 'The Weaver\'s Song',
        pages: [
          {
            id: 'pg-3-1',
            pageNumber: 1,
            plainText: 'In a village by the river lived a weaver named Leela.',
            richText: paragraph(
              'In a village by the river lived a weaver named Leela, whose loom sang melodies only children could hear.'
            ),
          },
          {
            id: 'pg-3-2',
            pageNumber: 2,
            plainText: 'One evening a stranger arrived with a bundle of golden thread.',
            richText: paragraph(
              'One evening a stranger arrived with a bundle of golden thread that shimmered like captured starlight.'
            ),
          },
        ],
      },
      {
        id: 'ch-4',
        chapterNumber: 2,
        title: 'Monsoon Memories',
        pages: [
          {
            id: 'pg-4-1',
            pageNumber: 1,
            plainText: 'Rain drummed on tin roofs across the valley.',
            richText: paragraph(
              'Rain drummed on tin roofs across the valley as families gathered around lamps to tell old stories.'
            ),
          },
        ],
      },
    ],
  },
  {
    id: 'ab-authoring-3',
    title: 'Sanskrit Verses',
    author: 'Dr. Meera Iyer',
    chapters: [
      {
        id: 'ch-5',
        chapterNumber: 1,
        title: 'Invocation',
        pages: [
          {
            id: 'pg-5-1',
            pageNumber: 1,
            plainText: 'Om. May wisdom illuminate our path.',
            richText: headingAndParagraph(
              'Invocation',
              'Om. May wisdom illuminate our path as we begin this sacred recitation.'
            ),
          },
        ],
      },
    ],
  },
];
