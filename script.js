const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const micButton = document.getElementById("mic-button");
const cameraButton = document.getElementById("camera-button");
const uploadButton = document.getElementById("upload-button");
const attachInput = document.getElementById("attach-input");
const scrollButton = document.getElementById("scroll-button");
const cameraPanel = document.getElementById("camera-panel");
const cameraVideo = document.getElementById("camera-video");
const captureButton = document.getElementById("capture-button");
const closeCameraButton = document.getElementById("close-camera");
const rateUsStars = document.getElementById("rate-us-stars");

const chatHistory = [];
let recorder = null;
let recordedChunks = [];
let cameraStream = null;

const grammarDB = {
  noun: {
    name: "Noun",
    level: "A1",
    emoji: "📘",
    definition: "A word that names a person, place, thing, or idea.",
    rules: "Nouns are subjects or objects in sentences. They can be countable (cat, cats) or uncountable (water, information).",
    examples: ["The teacher is kind.", "My phone is on the table.", "Friendship is important."],
    commonMistakes: ["❌ informations → ✓ information (uncountable)", "❌ peoples → ✓ people", "❌ advices → ✓ advice"],
    tip: "Remember: Countable nouns take 'a/an' or can be plural. Uncountable nouns are singular.",
    keywords: ["noun", "nouns", "person", "place", "thing", "idea", "naming word", "what is a noun", "define noun", "countable", "uncountable"]
  },
  verb: {
    name: "Verb",
    level: "A1",
    emoji: "🏃",
    definition: "A word that describes an action, state, or occurrence.",
    rules: "Verbs change form based on subject (I go, he goes) and tense (go, went, will go).",
    examples: ["I run every morning.", "She plays the piano.", "They have finished their homework."],
    commonMistakes: ["❌ he go → ✓ he goes", "❌ i am go → ✓ i am going", "❌ she dont know → ✓ she doesn't know"],
    tip: "For present simple: add -s/-es for he/she/it. For past: regular verbs add -ed; irregular verbs change form.",
    keywords: ["verb", "verbs", "run", "play", "do", "action word", "doing word", "what is a verb"]
  },
  adjective: {
    name: "Adjective",
    level: "A1",
    emoji: "✨",
    definition: "A word that describes or modifies a noun.",
    rules: "Adjectives usually come before the noun (big house) or after 'be' (The house is big). Order matters: size, age, color.",
    examples: ["The blue sky is beautiful.", "She has three red apples.", "The weather is cold and wet."],
    commonMistakes: ["❌ house big → ✓ a big house", "❌ the weather is beautifuls → ✓ the weather is beautiful"],
    tip: "Adjectives are not affected by singular/plural nouns: one big dog, three big dogs.",
    keywords: ["adjective", "adjectives", "describing word", "what describes", "color", "size", "beautiful", "big"]
  },
  gerund: {
    name: "Gerund",
    level: "A2",
    emoji: "🎯",
    definition: "A verb form ending in -ing that acts as a noun.",
    rules: "Use gerunds after verbs like: like, enjoy, hate, love, prefer, stop. Also after prepositions.",
    examples: ["I enjoy playing tennis.", "She is interested in learning Spanish.", "Swimming is good for your health."],
    commonMistakes: ["❌ I like to play tennis (possible but gerund is better)", "❌ I enjoy to swim → ✓ I enjoy swimming"],
    tip: "Gerunds are verbs acting as nouns. Use them after: enjoy, like, hate, practice, suggest, avoid.",
    keywords: ["gerund", "gerunds", "ing form", "-ing", "playing", "swimming", "running", "verb noun"]
  },
  infinitive: {
    name: "Infinitive",
    level: "A2",
    emoji: "🔵",
    definition: "The base form of a verb, usually preceded by 'to' (to go, to eat, to sleep).",
    rules: "Use infinitives after: want, would like, need, hope, plan, decide, promise, try. Also after adjectives.",
    examples: ["I want to travel the world.", "She needs to study for the exam.", "It is difficult to learn French."],
    commonMistakes: ["❌ I want go → ✓ I want to go", "❌ I try to not fail → ✓ I try not to fail"],
    tip: "Infinitive vs Gerund: 'I like to swim' (one-time) vs 'I like swimming' (general habit).",
    keywords: ["infinitive", "to go", "to eat", "to be", "base form", "to-infinitive", "why use to"]
  },
  "phrasal verb": {
    name: "Phrasal Verb",
    level: "A2",
    emoji: "⚡",
    definition: "A combination of a verb + adverb/preposition with a meaning different from individual words.",
    rules: "Some are separable (put on/put off): 'put on a shirt' or 'put a shirt on'. Others are not (look after): 'look after children' (not 'look children after').",
    examples: ["Wake up! (get out of bed)", "Turn off the light. (stop it)", "Look after my dog. (care for)", "I'm looking for my keys. (searching)"],
    commonMistakes: ["❌ wake the up → ✓ wake up", "❌ turn the off light → ✓ turn off the light (for non-separable)"],
    tip: "Phrasal verbs are VERY common in English! Common ones: turn on/off, put on/off, get up, go out, look after, look for, run out of.",
    keywords: ["phrasal verb", "phrasal verbs", "verb particle", "turn on", "turn off", "put on", "get up", "look after", "wake up"]
  },
  "relative clause": {
    name: "Relative Clause",
    level: "B1",
    emoji: "🔗",
    definition: "A clause that describes or gives more information about a noun, starting with who/which/that/where.",
    rules: "Use 'who' for people, 'which' for things, 'that' for both. Use 'where' for places. Put the clause after the noun it describes.",
    examples: ["The student who won the prize is happy.", "The book which I read was excellent.", "I like people that are honest.", "The café where we met is closed."],
    commonMistakes: ["❌ The person that I met him → ✓ The person that I met", "❌ The girl who she is my friend → ✓ The girl who is my friend"],
    tip: "Do not repeat the noun after the relative pronoun. Choose: who (people), which (things), that (both), where (places).",
    keywords: ["relative clause", "who", "which", "that", "where", "describing clause", "subordinate clause"]
  },
  conjunction: {
    name: "Conjunction",
    level: "A2",
    emoji: "🔀",
    definition: "A word that connects two words, phrases, or clauses (and, but, or, because, although, while).",
    rules: "Coordinating conjunctions (and, but, or) connect equal things. Subordinating conjunctions (because, although, if) connect main and dependent clauses.",
    examples: ["I like tea and coffee.", "She is rich but unhappy.", "We stayed because it was raining.", "Although she was tired, she kept working."],
    commonMistakes: ["❌ I like tea and also coffee (redundant)", "❌ Because it was raining, so we stayed (wrong structure)"],
    tip: "Common conjunctions: and, but, or (coordinating); because, although, while, if, when (subordinating). Don't use both 'because' and 'so' together.",
    keywords: ["conjunction", "conjunctions", "and", "but", "or", "because", "although", "connecting word"]
  },
  "question tag": {
    name: "Question Tag",
    level: "B1",
    emoji: "❓",
    definition: "A short question at the end of a statement to confirm or check information (isn't it?, do you?, won't they?).",
    rules: "If statement is positive, tag is negative (and vice versa). Use the same auxiliary verb as the statement.",
    examples: ["You're tired, aren't you?", "She doesn't like fish, does she?", "They will come, won't they?", "It's beautiful, isn't it?"],
    commonMistakes: ["❌ You are happy, are you? → ✓ You are happy, aren't you?", "❌ She goes, doesn't he? → ✓ She goes, doesn't she?"],
    tip: "Match the auxiliary verb and keep the opposite polarity. Present: are/aren't, does/doesn't. Past: was/wasn't, did/didn't.",
    keywords: ["question tag", "tag question", "isn't it", "won't they", "do you", "auxiliary verb", "confirmation"]
  },
  preposition: {
    name: "Preposition",
    level: "A1",
    emoji: "📍",
    definition: "A word showing the relationship between a noun and other words (in, on, at, under, between, during, after).",
    rules: "Prepositions of place: in, on, at, under, beside, between, inside. Prepositions of time: at, on, in, during, after, before.",
    examples: ["The book is on the table.", "She arrives at 8 AM.", "We met during the conference.", "Put the ball under the bed."],
    commonMistakes: ["❌ on the morning → ✓ in the morning", "❌ at Monday → ✓ on Monday", "❌ the key of the door → ✓ the key to the door"],
    tip: "Time: 'at 5 o'clock', 'on Monday', 'in July'. Place: 'at home', 'on the table', 'in the box'.",
    keywords: ["preposition", "prepositions", "in", "on", "at", "under", "between", "during", "location", "time"]
  },
  pronoun: {
    name: "Pronoun",
    level: "A1",
    emoji: "👤",
    definition: "A word that replaces a noun to avoid repetition (I, you, he, she, it, we, they, me, him, her).",
    rules: "Subject pronouns: I, you, he, she, it, we, they. Object pronouns: me, you, him, her, it, us, them. Possessive: my, your, his, her, its, our, their.",
    examples: ["I am happy. You are happy too.", "He gave her the book. She thanked him.", "We met them yesterday. They helped us."],
    commonMistakes: ["❌ Him and me are friends → ✓ He and I are friends", "❌ Give the book to I → ✓ Give the book to me"],
    tip: "Use subject pronouns (I, he, she) as the subject of a sentence. Use object pronouns (me, him, her) after verbs or prepositions.",
    keywords: ["pronoun", "pronouns", "he", "she", "it", "they", "me", "you", "subject pronoun", "object pronoun"]
  },
  "present simple": {
    name: "Present Simple",
    level: "A1",
    emoji: "⏱️",
    definition: "The tense for habits, facts, routines, and permanent states.",
    rules: "For I/you/we/they: use base verb. For he/she/it: add -s or -es. Questions: 'Do you go?' Negatives: 'I don't go.'",
    examples: ["I go to school every day.", "She plays tennis on Saturdays.", "Water boils at 100°C.", "They don't like coffee."],
    commonMistakes: ["❌ he go → ✓ he goes", "❌ she play tennis → ✓ she plays tennis", "❌ do he like it? → ✓ does he like it?"],
    tip: "Remember: he/she/it adds -s. 'He go' is WRONG. Use present simple for facts, habits, and routines.",
    keywords: ["present simple", "simple present", "do", "does", "every day", "always", "habit", "fact"]
  },
  "present continuous": {
    name: "Present Continuous",
    level: "A1",
    emoji: "🎬",
    definition: "The tense for actions happening RIGHT NOW or currently in progress.",
    rules: "Form: am/is/are + verb-ing. Questions: 'Are you studying?' Negatives: 'I'm not studying.'",
    examples: ["I am learning English right now.", "They are playing football.", "She is reading a book.", "We aren't watching TV."],
    commonMistakes: ["❌ I am study → ✓ I am studying", "❌ she is go → ✓ she is going"],
    tip: "Use NOW, AT THIS MOMENT with present continuous. Use present simple for habits. 'I play tennis' (usually) vs 'I am playing' (now).",
    keywords: ["present continuous", "present progressive", "ing", "now", "right now", "at this moment", "currently"]
  },
  "past simple": {
    name: "Past Simple",
    level: "A1",
    emoji: "📚",
    definition: "The tense for completed actions in the past. It's finished and we're not doing it anymore.",
    rules: "Regular verbs: add -ed (played, studied). Irregular: change form (went, saw, ate). Questions: 'Did you go?' Negatives: 'I didn't go.'",
    examples: ["I visited my aunt yesterday.", "She went to the market.", "They didn't watch the movie.", "Where did you go last week?"],
    commonMistakes: ["❌ I go to Paris last year → ✓ I went to Paris last year", "❌ she didn't saw him → ✓ she didn't see him"],
    tip: "Past simple is for finished actions. Use 'did' to form questions and negatives (don't add -ed to the main verb).",
    keywords: ["past simple", "yesterday", "last week", "ago", "did", "irregular verbs", "completed action"]
  },
  "future forms": {
    name: "Future Forms",
    level: "A2",
    emoji: "🚀",
    definition: "Different ways to talk about the future: 'will', 'be going to', and present continuous for arrangements.",
    rules: "'Will' for predictions/decisions (I will call). 'Going to' for plans (I'm going to study). Present continuous for fixed arrangements (We are meeting tomorrow).",
    examples: ["I will call you later.", "She is going to study tonight.", "We are meeting at 7 PM tomorrow.", "It will rain tomorrow."],
    commonMistakes: ["❌ I will going to study → ✓ I will study OR I am going to study", "❌ he will goes → ✓ he will go"],
    tip: "'Will' = instant decision or prediction. 'Going to' = plan you already made. Present continuous = fixed appointment.",
    keywords: ["future", "will", "going to", "be going to", "tomorrow", "next week", "shall", "future tense"]
  },
  conditional: {
    name: "Conditional",
    level: "B1",
    emoji: "🔄",
    definition: "Sentences with 'if' showing cause and effect, or imaginary situations.",
    rules: "1st: 'If + present, will + verb' (possible). 2nd: 'If + past, would + verb' (imaginary). 3rd: 'If + had, would have' (impossible - past).",
    examples: ["If it rains, I will stay home.", "If I were rich, I would travel the world.", "If they had left earlier, they would have arrived on time."],
    commonMistakes: ["❌ If I will go, I will be happy → ✓ If I go, I will be happy", "❌ If I was rich → ✓ If I were rich (formal)"],
    tip: "First conditional (real future) vs Second conditional (unreal now) vs Third conditional (impossible past).",
    keywords: ["conditional", "if", "first conditional", "second conditional", "third conditional", "would", "could"]
  },
  auxiliary: {
    name: "Auxiliary Verbs",
    level: "A1",
    emoji: "🔧",
    definition: "Helping verbs used with main verbs to form tenses, questions, negatives, and passives (am/is/are/do/does/did/have/has).",
    rules: "Use 'do/does/did' for questions and negatives in simple tenses. Use be/have as auxiliaries for continuous/perfect tenses and passive constructions.",
    examples: ["Do you like coffee?", "She is reading a book.", "They have finished."],
    commonMistakes: ["❌ He don't like → ✓ He doesn't like", "❌ I am go → ✓ I am going"],
    tip: "Remember: 'do' for questions in present simple, 'did' for past simple. 'Be' and 'have' change with tense and subject.",
    keywords: ["auxiliary", "auxiliaries", "do", "does", "did", "have", "has", "am", "is", "are"]
  },
  "present perfect": {
    name: "Present Perfect",
    level: "A2",
    emoji: "⏳",
    definition: "Uses 'have/has' + past participle to link past actions to the present.",
    rules: "Use for experiences, past actions with present relevance, and actions that started in the past and continue. Form: have/has + past participle.",
    examples: ["I have visited London.", "She has just finished her homework.", "We have lived here for five years."],
    commonMistakes: ["❌ I have went → ✓ I have gone", "❌ I have 2010 → ✓ I went in 2010 (use past simple for finished past time)"],
    tip: "Use present perfect for 'ever/never/already/just/yet' contexts.",
    keywords: ["present perfect", "have done", "has done", "have/has + past participle", "have you ever"]
  },
  "past perfect": {
    name: "Past Perfect",
    level: "B1",
    emoji: "⏮️",
    definition: "Uses 'had' + past participle to show an action completed before another past action.",
    rules: "Use past perfect for the earlier of two past actions. Form: had + past participle.",
    examples: ["She had left before I arrived.", "They had finished the work when he called."],
    commonMistakes: ["❌ I had went → ✓ I had gone"],
    tip: "If you mention a clear past time (yesterday, in 2010), prefer past simple unless ordering must be explicit.",
    keywords: ["past perfect", "had gone", "had + past participle", "before", "already"]
  },
  imperative: {
    name: "Imperative",
    level: "A1",
    emoji: "⚠️",
    definition: "Commands, instructions, or requests using the base verb (Sit down!, Don't move!).",
    rules: "Use base verb for positive commands. Use 'don't' + base verb for negatives. Use 'please' for politeness.",
    examples: ["Sit down!", "Don't talk during the lesson.", "Please pass the salt."],
    commonMistakes: ["❌ You sit down! → ✓ Sit down!"],
    tip: "Imperatives often omit the subject 'you'. Tone changes politeness.",
    keywords: ["imperative", "command", "order", "sit down", "don't", "please"]
  },
  "passive voice": {
    name: "Passive Voice",
    level: "B1",
    emoji: "🔁",
    definition: "The subject receives the action: form is 'be' + past participle (The cake was eaten).",
    rules: "Use passive when the doer is unknown or unimportant. Tenses: am/is/are/was/were + past participle; perfect and modals combine with 'been'.",
    examples: ["The letter was written by John.", "The room is cleaned every day.", "The project has been completed."],
    commonMistakes: ["❌ The cake eaten by John → ✓ The cake was eaten by John"],
    tip: "Passive focuses on the action or receiver, not the actor.",
    keywords: ["passive", "passive voice", "was written", "is cleaned", "been"]
  },
  "reported speech": {
    name: "Reported Speech",
    level: "B1",
    emoji: "💬",
    definition: "Also called indirect speech: report what someone said, often shifting tenses back.",
    rules: "Backshift tenses when reporting past statements (present → past, past → past perfect). Use 'said (that)' or reporting verbs like 'told', 'asked'.",
    examples: ["He said (that) he was tired.", "She told me she would come later."],
    commonMistakes: ["❌ He says he went → ✓ He said he had gone (if original was past)"],
    tip: "When reporting questions, we often use 'if/whether' and change word order to statement form.",
    keywords: ["reported speech", "indirect speech", "said", "told", "reported" ]
  },
  adverb: {
    name: "Adverb",
    level: "A2",
    emoji: "🕒",
    definition: "Words that modify verbs, adjectives, or other adverbs: time, manner, frequency, degree.",
    rules: "Place adverbs of manner after the verb or before the main verb depending on type. Frequency adverbs usually before the main verb but after 'be'.",
    examples: ["She runs quickly.", "He often visits.", "They arrived yesterday."],
    commonMistakes: ["❌ He speaks quick → ✓ He speaks quickly"],
    tip: "Time (yesterday/now), manner (quickly), frequency (always/sometimes). Positioning differs by adverb type.",
    keywords: ["adverb", "adverbs", "quickly", "always", "sometimes", "yesterday", "now"]
  },
  "sentence types": {
    name: "Sentence Types",
    level: "A1",
    emoji: "🔤",
    definition: "Different forms: statements, questions, negatives, exclamations.",
    rules: ["Statement: subject + verb + object.", "Question: auxiliary + subject + verb.", "Negative: add not after auxiliary.", "Exclamation: use ! and strong intonation."],
    examples: ["She likes apples.", "Do you like apples?", "I do not like apples.", "What a beautiful day!"],
    commonMistakes: ["❌ You like? → ✓ Do you like?"],
    tip: "Recognise sentence type by word order and punctuation.",
    keywords: ["statement", "question", "negative", "exclamation", "sentence types"]
  },
  "question types": {
    name: "Question Types",
    level: "A1",
    emoji: "❓",
    definition: "WH questions, yes/no questions, and indirect questions.",
    rules: "WH questions use question words and invert auxiliary + subject. Yes/No questions invert auxiliary and subject. Indirect questions use reporting verbs + question word + statement order.",
    examples: ["Where do you live?", "Did you go?", "Can you tell me where he lives?"],
    commonMistakes: ["❌ Where he lives? → ✓ Where does he live?"],
    tip: "Use auxiliaries (do/does/did) for simple tenses in questions.",
    keywords: ["wh questions", "yes/no questions", "indirect questions", "where", "why", "how"]
  },
  articles: {
    name: "Articles",
    level: "A2",
    emoji: "📝",
    definition: "Use of 'a', 'an', 'the' and zero article in English.",
    rules: "Use 'a/an' for non-specific singular nouns; 'the' for specific nouns; zero article for uncountable or plural when general.",
    examples: ["I saw a dog.", "The dog you saw was mine.", "Water is essential."],
    commonMistakes: ["❌ I saw the dog (when introducing new info) → ✓ I saw a dog"],
    tip: "Choose 'a' before consonant sounds, 'an' before vowel sounds. Use 'the' when the listener knows the referent.",
    keywords: ["a an the", "articles", "zero article", "specific", "general"]
  },
  "prepositions advanced": {
    name: "Prepositions (Advanced)",
    level: "A2",
    emoji: "📍",
    definition: "Prepositions showing time, place, movement and common collocations.",
    rules: "Distinguish prepositions of time (at/on/in), place (in/on/at), and movement (to/into/onto). Learn common collocations (interested in, good at).",
    examples: ["She arrived at 5 pm.", "He walked into the room.", "I'm good at tennis."],
    commonMistakes: ["❌ at Monday → ✓ on Monday", "❌ in the bus → ✓ on the bus (depends on variety)"],
    tip: "Memorise common collocations and note regional variations (on the weekend vs at the weekend).",
    keywords: ["preposition", "movement", "collocation", "on the bus", "in the car", "arrive at"]
  },
  "pronoun types": {
    name: "Pronoun Types",
    level: "A1",
    emoji: "👥",
    definition: "Subject, object, possessive and reflexive pronouns and their uses.",
    rules: "Subject: I/you/he... Object: me/you/him... Possessive adjectives: my/your... Possessive pronouns: mine/yours. Reflexive: myself/yourself.",
    examples: ["She gave it to me.", "That book is mine.", "He hurt himself."],
    commonMistakes: ["❌ Give the book to I → ✓ Give the book to me"],
    tip: "Use reflexive pronouns only when subject and object are same.",
    keywords: ["subject pronoun", "object pronoun", "possessive", "reflexive", "my mine yourself"]
  },
  "confusing words": {
    name: "Common Confusing Words",
    level: "A2",
    emoji: "⚖️",
    definition: "Pairs and sets of words often mixed up (its/it's, there/their/they're, much/many).",
    rules: "Learn meaning and usage: 'its' = possessive, 'it's' = it is. 'There' = place, 'their' = possessive, 'they're' = they are.",
    examples: ["It's time to go.", "Their house is big.", "How many apples? How much water?"],
    commonMistakes: ["❌ Its raining → ✓ It's raining", "❌ Their going home → ✓ They're going home"],
    tip: "When in doubt, expand contractions: 'it's' = 'it is'. Check if possession is needed for 'its'.",
    keywords: ["its vs it's", "there their they're", "much vs many", "do vs make", "say vs tell"]
  },
  modals: {
    name: "Modal Verbs",
    level: "A2",
    emoji: "🔔",
    definition: "Verbs that express ability, permission, obligation, possibility or advice (can, could, may, might, must, should, would).",
    rules: "Modals are followed by base verb. 'Must' expresses strong obligation; 'should' gives advice; 'may/might' express possibility.",
    examples: ["You must stop.", "You should study.", "She might come later."],
    commonMistakes: ["❌ You mustn't to go → ✓ You mustn't go"],
    tip: "Modals do not change form for different subjects and are followed by the base verb.",
    keywords: ["must", "mustn't", "should", "shouldn't", "may", "might", "could", "would", "can", "cannot"]
  },
  punctuation: {
    name: "Punctuation Rules",
    level: "A1",
    emoji: "✍️",
    definition: "Basic rules for full stops, commas, question marks, and apostrophes.",
    rules: "Use full stop to end statements. Commas separate items or clauses. Question marks end questions. Apostrophes show possession or contractions.",
    examples: ["She said, 'Hello.'", "I can't go.", "John's book is here."],
    commonMistakes: ["❌ Its a cat → ✓ It's a cat (contraction)", "❌ Johns book → ✓ John's book (possession)"],
    tip: "Practice punctuation by reading sentences aloud to hear natural pauses.",
    keywords: ["period", "comma", "question mark", "apostrophe", "punctuation"]
  }
};

sendButton.addEventListener("click", handleSend);
userInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSend();
  }
});
micButton.addEventListener("click", toggleRecording);
uploadButton.addEventListener("click", () => attachInput.click());
attachInput.addEventListener("change", handleAttachment);
cameraButton.addEventListener("click", openCamera);
captureButton.addEventListener("click", takePhoto);
closeCameraButton.addEventListener("click", closeCamera);
chatWindow.addEventListener("scroll", handleScroll);
scrollButton.addEventListener("click", () => {
  chatWindow.scrollTop = chatWindow.scrollHeight;
  scrollButton.classList.remove("visible");
});
rateUsStars.addEventListener("click", handleRateUsStar);

function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = "";
  addMessage("user", text);
  addMessage("ai", "AI is thinking…", { status: "typing" });

  requestAIResponse(text);
}

function addMessage(role, content, meta = {}) {
  const message = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    status: meta.status || "normal",
    timestamp: new Date().toISOString(),
    attachmentType: meta.attachmentType || null,
    attachmentURL: meta.attachmentURL || null,
    attachmentName: meta.attachmentName || null
  };

  chatHistory.push(message);
  renderChat();
  return message;
}

function updateMessage(id, patch) {
  const index = chatHistory.findIndex(message => message.id === id);
  if (index === -1) return;

  chatHistory[index] = { ...chatHistory[index], ...patch };
  renderChat();
}

function renderChat() {
  chatWindow.innerHTML = chatHistory
    .map(message => {
      const isUser = message.role === "user";
      const classes = `message ${isUser ? "user" : "ai"}`;

      if (message.status === "typing") {
        return `
          <div class="${classes}">
            <div class="typing-indicator">
              <span class="label">AI</span>
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        `;
      }

      const attachmentHtml = renderAttachment(message);

      return `
        <article class="${classes}">
          <div class="label">${isUser ? "You" : "AI"}</div>
          <p>${escapeHtml(message.content).replace(/\n/g, "<br>")}</p>
          ${attachmentHtml}
        </article>
      `;
    })
    .join("");

  scrollToBottom();
}

function renderAttachment(message) {
  if (!message.attachmentType || !message.attachmentURL) return "";

  if (message.attachmentType === "image") {
    return `<img class="attachment-image" src="${message.attachmentURL}" alt="${escapeHtml(message.attachmentName || "Image")}" />`;
  }

  if (message.attachmentType === "video") {
    return `<video class="attachment-video" controls src="${message.attachmentURL}"></video>`;
  }

  if (message.attachmentType === "audio") {
    return `<audio class="attachment-audio" controls src="${message.attachmentURL}"></audio>`;
  }

  return `<div class="attachment-file">File: ${escapeHtml(message.attachmentName || "Attachment")}</div>`;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function requestAIResponse(prompt) {
  const typingIndex = chatHistory.findIndex(message => message.status === "typing" && message.role === "ai");
  const typingMessage = chatHistory[typingIndex];

  showLoading(true);

  try {
    const aiText = await callAI(prompt);

    if (typingMessage) {
      updateMessage(typingMessage.id, {
        content: aiText,
        status: "normal"
      });
    } else {
      addMessage("ai", aiText);
    }
  } catch (error) {
    console.error(error);
    if (typingMessage) {
      updateMessage(typingMessage.id, {
        content: "Sorry, something went wrong. Try again.",
        status: "normal"
      });
    }
  } finally {
    showLoading(false);
  }
}

function callAI(message) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(englishAI(message));
    }, 700);
  });
}

function detectTopic(input) {
  const normalized = input.toLowerCase();

  // Collect all keyword matches with their lengths
  const matches = [];
  
  for (const topicKey of Object.keys(grammarDB)) {
    const topic = grammarDB[topicKey];
    for (const keyword of topic.keywords) {
      if (normalized.includes(keyword)) {
        matches.push({ topicKey, keyword, length: keyword.length });
      }
    }
  }

  // If we have matches, return the one with the longest keyword (most specific)
  if (matches.length > 0) {
    matches.sort((a, b) => b.length - a.length);
    return matches[0].topicKey;
  }

  // Fallback: check if topic key itself is in the input
  for (const topicKey of Object.keys(grammarDB)) {
    if (normalized.includes(topicKey)) {
      return topicKey;
    }
  }

  return null;
}

function detectIntent(input) {
  const s = input.toLowerCase();
  if (/check|correct|grammar check|fix my|what's wrong|is this correct|error/.test(s)) return 'grammar_check';
  if (/rewrite|paraphrase|improve|edit|make it better|rephrase|fix this sentence/.test(s)) return 'rewrite';
  if (/write an essay|essay about|compose an essay|generate an essay|write about/.test(s)) return 'essay';
  if (/chat|talk|conversation|have a chat|practice speaking|speak with me/.test(s)) return 'conversation';
  if (/suggest|advice|how to improve|writing coach|feedback on my/.test(s)) return 'coach';
  return null;
}

function buildErrorsMap() {
  const map = new Map();
  for (const topicKey of Object.keys(grammarDB)) {
    const topic = grammarDB[topicKey];
    if (!topic.commonMistakes) continue;
    for (const entry of topic.commonMistakes) {
      const parts = entry.split('→');
      if (parts.length === 2) {
        const wrong = parts[0].replace(/[^a-zA-Z0-9\s']/g, '').trim().toLowerCase();
        const correct = parts[1].replace(/[^a-zA-Z0-9\s']/g, '').trim();
        if (wrong) map.set(wrong, correct);
      }
    }
  }
  // Add a few explicit common confusions
  map.set("its raining", "It's raining");
  map.set("its a cat", "It's a cat");
  map.set("their going", "they're going");
  return map;
}

function grammarCheck(text) {
  const normalized = text.toLowerCase();
  const errors = [];
  const map = buildErrorsMap();
  for (const [wrong, correct] of map.entries()) {
    const pattern = new RegExp('\\b' + wrong.replace(/\s+/g, '\\s+') + '\\b', 'i');
    if (pattern.test(normalized)) {
      errors.push({ wrong, correct });
    }
  }

  // Simple subject-verb agreement quick checks
  if (/\b(he|she|it)\s+\w+\b/i.test(text)) {
    const m = text.match(/\b(he|she|it)\s+(\w+)\b/i);
    if (m && !/s$/.test(m[2]) && !/be|have|do|does|is|are|was|were/.test(m[2])) {
      errors.push({ wrong: `${m[1]} ${m[2]}`, correct: `${m[1]} ${m[2]}s` });
    }
  }

  return errors;
}

function rewriteImproved(text) {
  let out = text.trim();
  const map = buildErrorsMap();
  for (const [wrong, correct] of map.entries()) {
    const pattern = new RegExp('\\b' + wrong.replace(/\s+/g, '\\s+') + '\\b', 'ig');
    out = out.replace(pattern, correct);
  }
  out = out.charAt(0).toUpperCase() + out.slice(1);
  if (!/[.!?]$/.test(out)) out += '.';
  return out;
}

function generateEssay(topicText) {
  const title = topicText.replace(/write an essay about|write about|essay about/i, '').trim() || 'the topic';
  return `Title: ${title}\n\n` +
    `Introduction:\nA short introduction to ${title}, explaining why it matters and setting the context.\n\n` +
    `Body:\nParagraph 1 — Explain the main idea and give an example.\nParagraph 2 — Provide details, reasons, or evidence.\n\n` +
    `Conclusion:\nSummarise the main points and provide a closing thought or suggestion.\n`;
}

function englishAI(input) {
  const intent = detectIntent(input);

  if (intent === 'grammar_check') {
    const errors = grammarCheck(input);
    if (errors.length === 0) {
      return "✅ No obvious errors found. Suggestions: keep sentences clear, check punctuation, and watch common confusions like its/it's.";
    }

    let out = "🔎 Grammar Check Results:\n\n";
    for (const e of errors) {
      out += `• Found: "${e.wrong}" → Suggest: "${e.correct}"\n`;
    }
    out += "\n✍️ Suggestions: Apply the suggested corrections and re-run the check. For more help, ask 'Explain corrections'.";
    return out;
  }

  if (intent === 'rewrite') {
    const text = input.replace(/^(rewrite|paraphrase|rephrase|improve)[:\s]*/i, '').trim();
    if (!text) {
      return "Send the sentence or paragraph you'd like me to rewrite.";
    }
    const improved = rewriteImproved(text);
    return `✏️ Improved version:\n\n${improved}\n\n💡 Tip: If you want a more formal or shorter version, say 'Make it formal' or 'Shorten it'.`;
  }

  if (intent === 'essay') {
    return generateEssay(input);
  }

  if (intent === 'conversation' || intent === 'coach') {
    return "Sure — let's practice. What's your goal today? (e.g., improve grammar, practice speaking, write an essay)";
  }

  // Default: topic explanation
  const topicKey = detectTopic(input);
  if (!topicKey) {
    return "Sorry, I don't recognize that topic. Try asking about:\n\n📝 Basics: noun, verb, adjective, adverb, pronoun, preposition, articles\n\n⏱️ Tenses: present simple, present continuous, past simple, past continuous, present perfect, past perfect, future forms\n\n🔄 Complex: conditional, gerund, infinitive, phrasal verb, relative clause, conjunction, question tag, imperative, passive voice, reported speech\n\n💡 Other: comparison, modals, question words, confusing words, punctuation, sentence types, question types, pronoun types";
  }

  const topic = grammarDB[topicKey];
  const examples = topic.examples.map(example => `• ${example}`).join("\n");
  const mistakes = topic.commonMistakes ? topic.commonMistakes.map(m => `  ${m}`).join("\n") : "";

  let response = `${topic.emoji} ${topic.name.toUpperCase()} [${topic.level}]\n`;
  response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  response += `📚 Definition:\n${topic.definition}\n\n`;
  response += `📋 Rules:\n${topic.rules}\n\n`;
  response += `💡 Examples:\n${examples}\n\n`;
  
  if (mistakes) {
    response += `⚠️ Common Mistakes:\n${mistakes}\n\n`;
  }
  
  response += `🎯 Tip:\n${topic.tip}`;

  return response;
}

function showLoading(isLoading) {
  sendButton.disabled = isLoading;
  if (isLoading) {
    sendButton.textContent = "Sending…";
  } else {
    sendButton.textContent = "Send";
  }
}

function toggleRecording() {
  if (recorder) {
    recorder.stop();
    micButton.textContent = "🎤";
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(stream => {
      recorder = new MediaRecorder(stream);
      recordedChunks = [];

      recorder.addEventListener("dataavailable", event => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        addMessage("user", "Voice recording attached.", {
          attachmentType: "audio",
          attachmentURL: url,
          attachmentName: "voice-recording.webm"
        });
        stream.getTracks().forEach(track => track.stop());
        recorder = null;
      });

      recorder.start();
      micButton.textContent = "⏹️";
    })
    .catch(() => {
      addMessage("ai", "Microphone access was denied or is unavailable.");
    });
}

function handleAttachment(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  let type = "file";

  if (file.type.startsWith("image/")) type = "image";
  if (file.type.startsWith("video/")) type = "video";
  if (file.type.startsWith("audio/")) type = "audio";

  addMessage("user", `Uploaded ${file.name}`, {
    attachmentType: type,
    attachmentURL: url,
    attachmentName: file.name
  });
  attachInput.value = "";
}

async function openCamera() {
  cameraPanel.classList.add("open");

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraVideo.srcObject = cameraStream;
  } catch (error) {
    addMessage("ai", "Camera access was denied or is unavailable.");
    closeCamera();
  }
}

function takePhoto() {
  if (!cameraVideo.videoWidth) return;

  const canvas = document.createElement("canvas");
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/png");

  addMessage("user", "Captured photo.", {
    attachmentType: "image",
    attachmentURL: dataUrl,
    attachmentName: "camera-photo.png"
  });

  closeCamera();
}

function closeCamera() {
  cameraPanel.classList.remove("open");
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

function handleScroll() {
  const shouldShow = chatWindow.scrollTop + chatWindow.clientHeight < chatWindow.scrollHeight - 20;
  scrollButton.classList.toggle("visible", shouldShow);
}

function handleRateUsStar(event) {
  const star = event.target.closest(".rate-star");
  if (!star) return;

  const rating = Number(star.dataset.rating);
  
  // Update all stars up to the clicked one
  rateUsStars.querySelectorAll(".rate-star").forEach(s => {
    s.classList.toggle("active", Number(s.dataset.rating) <= rating);
  });

  // Reset after a brief delay for visual feedback
  setTimeout(() => {
    rateUsStars.querySelectorAll(".rate-star").forEach(s => s.classList.remove("active"));
  }, 300);
}

renderChat();
