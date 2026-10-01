import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav.jsx';

export default function HowItWorks() {
  return (
    <div className="public">
      <PublicNav />
      <article className="doc">
        <h1>How Lumen recommends stories</h1>
        <p className="lead">Lumen is a hybrid recommender. It combines content-based filtering (what a story is about) with behavioural signals (what you do) and simple context (freshness and popularity).</p>

        <h2>1. Text processing pipeline</h2>
        <p>When a story is added, the server runs it through the same steps every time:</p>
        <ol>
          <li><b>Tokenise</b> the title and body into lowercase words.</li>
          <li><b>Remove stop words</b> such as "the", "and" and "said".</li>
          <li><b>Stem</b> words with a lightweight suffix stripper, so "companies" and "company" match.</li>
          <li><b>Count terms</b> and weight them by TF-IDF: <code>(1 + log tf) × idf</code>, then normalise to unit length.</li>
          <li><b>Extract</b> keywords, a 3-sentence extractive summary, sentiment (lexicon based) and reading time.</li>
        </ol>

        <h2>2. Learning your profile</h2>
        <p>Your profile is a weighted bag of terms plus a score for each category. Every action adds the story's vector to your profile, scaled by how strong the signal is. Older signals fade by 3 percent each time you act.</p>
        <table className="doc-table">
          <thead><tr><th>Action</th><th>Weight</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td>Open a story</td><td>+1</td><td>Weak interest</td></tr>
            <tr><td>Read for 20+ seconds</td><td>+2</td><td>Engaged reading</td></tr>
            <tr><td>Like or save</td><td>+3</td><td>Explicit approval</td></tr>
            <tr><td>Not interested</td><td>−3</td><td>Explicit rejection, story is hidden</td></tr>
          </tbody>
        </table>

        <h2>3. Ranking</h2>
        <pre className="formula">score = 0.40 × cosine(profile, story)
      + 0.30 × category affinity
      + 0.20 × exp(−age in days / 6)
      + 0.10 × log(1 + views + 3 likes + 2 saves) / max</pre>
        <p>Stories you have already opened are multiplied by 0.35 so new content rises to the top. The match percentage on each card is the score relative to the best candidate in your feed.</p>

        <h2>4. Similar stories</h2>
        <p>On each article page, the most similar stories are found with cosine similarity between TF-IDF vectors, with a small bonus for the same category.</p>

        <h2>5. Cold start</h2>
        <p>New users choose interests during onboarding. Those categories seed the profile with the average vector of their stories. Until you read something, the feed leans on freshness and popularity.</p>

        <h2>System architecture</h2>
        <div className="arch">
          <div><b>React</b><span>Pages, routing, charts</span></div>
          <div><b>Express API</b><span>Auth, feed, tracking</span></div>
          <div><b>NLP + Recommender</b><span>TF-IDF, scoring</span></div>
          <div><b>MongoDB</b><span>Users, articles, events</span></div>
        </div>

        <h2>Limitations and next steps</h2>
        <p>Stemming is rule-based and sentiment uses a small lexicon, so results are approximate. The index is held in memory, which suits thousands of articles. Natural next steps are sentence embeddings, a vector database, collaborative filtering across users and A/B testing of the weights.</p>
        <p><Link className="btn primary" to="/register">Try it yourself</Link></p>
      </article>
    </div>
  );
}
