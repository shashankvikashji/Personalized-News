const nlp = require('../nlp');
// Runs the NLP pipeline once at ingest time and stores the results with the article.
exports.buildArticle = ({ title, content, category, source, url, publishedAt, image }) => {
  const text = `${title}. ${content}`;
  return {
    title, content, category, source: source || 'Lumen Wire', url: url || undefined, image: image || undefined,
    publishedAt: publishedAt || new Date(),
    excerpt: content.length > 170 ? content.slice(0, 167).replace(/\s+\S*$/, '') + '…' : content,
    summary: nlp.summarize(content, 3),
    keywords: nlp.keywords(text, 6),
    terms: nlp.termCounts(`${title}. ${title}. ${title}. ${content}`),
    sentiment: nlp.sentiment(text),
    readingTime: nlp.readingTime(content),
  };
};
