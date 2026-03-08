const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
    "She sells seashells by the seashore.",
    "Peter Piper picked a peck of pickled peppers.",
    "I scream, you scream, we all scream for ice cream.",
    "A big black bug bit a big black bear.",
    "The rain in Spain stays mainly in the plain.",
    "Red lorry, yellow lorry.",
    "Unique New York.",
    "Six slippery snails slid slowly seaward.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold.",
    "A penny saved is a penny earned.",
    "Actions speak louder than words.",
    "Better late than never.",
    "Don't count your chickens before they hatch.",
    "Every cloud has a silver lining.",
    "Fortune favors the bold.",
    "Good things come to those who wait.",
    "Haste makes waste."
];

// Game state variables
let selectedTime = 30; // Default 30 seconds
let timeLeft = selectedTime;
let timer;
let isTestActive = false;
let startTime;
let currentText = "";
let typedCharacters = 0;
let correctCharacters = 0;
let totalWords = 0;
let totalKeystrokes = 0; // Track all keystrokes including backspaces
let lastInputLength = 0; // Track previous input length to detect backspaces

// DOM elements
const sentenceElement = document.getElementById("sentence");
const input = document.getElementById("input");
const result = document.getElementById("result");
const accuracy = document.getElementById("accuracy");
const wordsTyped = document.getElementById("words-typed");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const testArea = document.getElementById("test-area");
const controls = document.getElementById("controls");

// Time option buttons
const time30Btn = document.getElementById("time-30");
const time60Btn = document.getElementById("time-60");
const time120Btn = document.getElementById("time-120");

// Event listeners for time selection
time30Btn.addEventListener("click", () => selectTime(30, time30Btn));
time60Btn.addEventListener("click", () => selectTime(60, time60Btn));
time120Btn.addEventListener("click", () => selectTime(120, time120Btn));

// Event listeners for start/stop buttons
startBtn.addEventListener("click", startTest);
stopBtn.addEventListener("click", stopTest);

// Input event listener
input.addEventListener("input", handleInput);

// Keydown event listener to track backspaces
input.addEventListener("keydown", handleKeydown);

function selectTime(time, button) {
    if (isTestActive) return; // Don't allow changing time during test
    
    selectedTime = time;
    timeLeft = time;
    timerDisplay.textContent = time;
    
    // Update active button styling
    document.querySelectorAll(".time-btn").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
}

function generateText() {
    // Generate enough text for the selected time duration
    let textLength = selectedTime * 10; // Approximate characters needed
    let generatedText = "";
    
    while (generatedText.length < textLength) {
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        generatedText += randomSentence + " ";
    }
    
    return generatedText.trim();
}

function startTest() {
    isTestActive = true;
    timeLeft = selectedTime;
    typedCharacters = 0;
    correctCharacters = 0;
    totalWords = 0;
    totalKeystrokes = 0; // Reset keystroke counter
    lastInputLength = 0; // Reset input length tracker
    
    // Generate new text for the test
    currentText = generateText();
    sentenceElement.textContent = currentText;
    
    // Show test area and enable input
    testArea.style.display = "block";
    input.disabled = false;
    input.value = "";
    input.focus();
    
    // Update button visibility
    startBtn.style.display = "none";
    stopBtn.style.display = "inline-block";
    
    // Disable time selection during test
    document.querySelectorAll(".time-btn").forEach(btn => btn.disabled = true);
    
    // Clear previous results
    result.textContent = "";
    accuracy.textContent = "";
    wordsTyped.textContent = "";
    
    // Start the timer
    startTime = Date.now();
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endTest();
    }
}

function stopTest() {
    if (isTestActive) {
        endTest();
    }
}

function endTest() {
    isTestActive = false;
    clearInterval(timer);
    
    // Disable input
    input.disabled = true;
    
    // Update button visibility
    startBtn.style.display = "inline-block";
    stopBtn.style.display = "none";
    
    // Re-enable time selection
    document.querySelectorAll(".time-btn").forEach(btn => btn.disabled = false);
    
    // Calculate and display results
    calculateResults();
}

function handleKeydown(event) {
    if (!isTestActive) return;
    
    // Count all keystrokes that produce a character or are backspace/delete
    if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
        totalKeystrokes++;
    }
}

function handleInput() {
    if (!isTestActive) return;
    
    const typedText = input.value;
    const currentInputLength = typedText.length;
    
    // Check if this was a backspace (input length decreased)
    if (currentInputLength < lastInputLength) {
        // Additional penalty for backspace - already counted in keydown
        // This helps ensure backspaces properly impact accuracy
    }
    
    lastInputLength = currentInputLength;
    typedCharacters = typedText.length;
    correctCharacters = 0;
    
    // Calculate correct characters
    for (let i = 0; i < typedText.length && i < currentText.length; i++) {
        if (typedText[i] === currentText[i]) {
            correctCharacters++;
        }
    }
    
    // Update real-time stats
    updateLiveStats();
    
    // Highlight text as user types
    highlightText(typedText);
}

function highlightText(typedText) {
    let highlightedText = "";
    
    for (let i = 0; i < currentText.length; i++) {
        if (i < typedText.length) {
            if (typedText[i] === currentText[i]) {
                highlightedText += `<span class="correct">${currentText[i]}</span>`;
            } else {
                highlightedText += `<span class="incorrect">${currentText[i]}</span>`;
            }
        } else if (i === typedText.length) {
            highlightedText += `<span class="current">${currentText[i]}</span>`;
        } else {
            highlightedText += currentText[i];
        }
    }
    
    sentenceElement.innerHTML = highlightedText;
}

function updateLiveStats() {
    const timeElapsed = (selectedTime - timeLeft) || 1; // Avoid division by zero
    const grossWPM = Math.round((correctCharacters / 5) / (timeElapsed / 60));
    
    // Calculate accuracy based on total keystrokes including backspaces
    const accuracyPercent = totalKeystrokes > 0 ? Math.round((correctCharacters / totalKeystrokes) * 100) : 100;
    const wordsCount = Math.floor(correctCharacters / 5);
    
    result.textContent = `Current Speed: ${grossWPM} WPM`;
    accuracy.textContent = `Accuracy: ${accuracyPercent}%`;
    wordsTyped.textContent = `Words Typed: ${wordsCount}`;
}

function calculateResults() {
    const timeElapsed = selectedTime - timeLeft;
    const totalTimeMinutes = selectedTime / 60;
    
    // Calculate WPM (Words Per Minute)
    const grossWPM = Math.round((correctCharacters / 5) / totalTimeMinutes);
    const netWPM = Math.round(((correctCharacters / 5) - ((typedCharacters - correctCharacters) / 5)) / totalTimeMinutes);
    
    // Calculate accuracy based on total keystrokes including backspaces
    const accuracyPercent = totalKeystrokes > 0 ? Math.round((correctCharacters / totalKeystrokes) * 100) : 100;
    
    // Calculate words typed
    const wordsCount = Math.floor(correctCharacters / 5);
    
    // Display final results
    result.innerHTML = `
        <strong>Test Complete!</strong><br>
        Gross Speed: ${grossWPM} WPM<br>
        Net Speed: ${netWPM} WPM<br>
        Test Duration: ${selectedTime}s<br>
        Total Keystrokes: ${totalKeystrokes}
    `;
    
    accuracy.innerHTML = `<strong>Accuracy: ${accuracyPercent}%</strong>`;
    wordsTyped.innerHTML = `<strong>Words Typed: ${wordsCount}</strong>`;
    
    // Reset the text display
    sentenceElement.innerHTML = currentText;
}

// Initialize display
timerDisplay.textContent = selectedTime;