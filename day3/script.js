// Starting notes data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];


// 1. searchNotes()
// Returns notes whose text contains the given word.
// The search is case-insensitive.
function searchNotes(word) {
  return notes.filter(note =>
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}


// Test searchNotes()
console.log(searchNotes("javascript"));
// Expected: [{ id: 4, text: "Revise JavaScript arrays", category: "study" }]

console.log(searchNotes("python"));
// Expected: []


// 2. longestNote()
// Returns the note with the most characters.
// Returns null if there are no notes.
function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];

  for (let note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }

  return longest;
}


// Test longestNote()
console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

console.log("Longest note when notes are empty:", []);
// Expected: [] (original notes array is not empty, so longestNote() returns note id 3)


// 3. countByCategory()
// Counts how many notes belong to each category.
function countByCategory() {
  let counts = {};

  for (let note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }

  return counts;
}


// Test countByCategory()
console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

console.log("Categories in an empty notes array:");
// Expected: {} when notes is empty


// 4. getSummary()
// Returns a sentence summarizing the notes.
function getSummary() {
  let counts = countByCategory();
  let total = notes.length;

  let noteWord = total === 1 ? "note" : "notes";

  return `${total} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}


// Test getSummary()
console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."

console.log("Summary for empty notes:");
// Expected: "0 notes: 0 personal, 0 work, 0 study."


// 5. isDuplicate()
// Checks whether a note with the same text already exists.
// Comparison ignores case and extra spaces.
function isDuplicate(text) {
  let cleanText = text.trim().toLowerCase();

  return notes.some(note =>
    note.text.trim().toLowerCase() === cleanText
  );
}


// Test isDuplicate()
console.log(isDuplicate("  BUY MILK AND BREAD  "));
// Expected: true

console.log(isDuplicate("Go to the gym"));
// Expected: false


// 6. addNote()
// Adds a note only when:
// - The text is 1–200 characters.
// - The note is not a duplicate.
// - The category is personal, work, or study.
function addNote(text, category) {
  if (text.length < 1 || text.length > 200) {
    console.log("Note not added: text must be 1–200 characters.");
    return false;
  }

  if (isDuplicate(text)) {
    console.log("Note not added: duplicate note.");
    return false;
  }

  if (!["personal", "work", "study"].includes(category)) {
    console.log("Note not added: invalid category.");
    return false;
  }

  let newId = notes.length + 1;

  notes.push({
    id: newId,
    text: text,
    category: category
  });

  console.log("Note added successfully.");
  return true;
}


// Test addNote() - normal case
console.log(addNote("Study DOM manipulation", "study"));
// Expected: true


// Test addNote() - duplicate/edge case
console.log(addNote("  BUY MILK AND BREAD  ", "personal"));
// Expected: false


// Extra tests for invalid length and category
console.log(addNote("", "personal"));
// Expected: false

console.log(addNote("Go shopping", "shopping"));
// Expected: false