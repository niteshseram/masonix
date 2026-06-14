export const demoFeedItems = Array.from({ length: 48 }, (_, itemIndex) => {
  const authors = [
    { name: 'Mira Chen', handle: '@mira' },
    { name: 'Noah Reed', handle: '@noah' },
    { name: 'Ava Patel', handle: '@ava' },
    { name: 'Theo Grant', handle: '@theo' },
  ];
  const templates = [
    {
      topic: 'Launch',
      body: 'Published a new collection and watched the feed stay smooth while content streamed in.',
      note: 'The longest cards now include remarks, labels, and metadata so measurement has real work to do.',
      tags: ['release', 'virtual'],
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
    },
    {
      topic: 'Renderer',
      body: 'Moved the card footer into the renderer so the layout stayed focused on placement.',
      tags: ['composition'],
      gradient: 'linear-gradient(135deg, #059669, #34d399)',
    },
    {
      topic: 'Scroll seek',
      body:
        'The placeholder pass made fast scrolling feel calmer on lower-end devices without changing item positions.',
      note: 'Placeholders keep the measured size while the user is moving quickly.',
      tags: ['placeholders', 'velocity', 'perf'],
      gradient: 'linear-gradient(135deg, #be123c, #fb7185)',
    },
    {
      topic: 'Hydration',
      body: 'Known media dimensions removed the last visible jump during hydration.',
      tags: ['ssr'],
      gradient: 'linear-gradient(135deg, #7c3aed, #c084fc)',
    },
    {
      topic: 'Panels',
      body:
        'Container breakpoints made the same component work in the dashboard, the public page, and a constrained review panel.',
      note: 'This is the kind of uneven editorial card that should create a taller measured item.',
      tags: ['container', 'dashboard'],
      gradient: 'linear-gradient(135deg, #ca8a04, #facc15)',
    },
    {
      topic: 'QA',
      body: 'Jump controls landed on the requested item after the custom scroll area offset was included.',
      tags: ['scroll ref', 'testing', 'offset'],
      gradient: 'linear-gradient(135deg, #0f766e, #2dd4bf)',
    },
  ];
  const author = authors[itemIndex % authors.length];
  const template = templates[itemIndex % templates.length];

  return {
    id: `feed-${itemIndex}`,
    author: author.name,
    handle: author.handle,
    topic: template.topic,
    body: template.body,
    note: itemIndex % 3 === 1 ? undefined : template.note,
    tags: itemIndex % 4 === 0 ? template.tags.slice(0, 1) : template.tags,
    metric: `${120 + itemIndex * 9}`,
    gradient: template.gradient,
  };
});
