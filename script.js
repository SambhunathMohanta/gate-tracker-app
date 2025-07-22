document.addEventListener('DOMContentLoaded', () => {
    // --- INITIAL DATA & CONFIGURATION ---

    const motivationalQuotes = [
        "Believe you can and you're halfway there.",
        "The secret to getting ahead is getting started.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Don't watch the clock; do what it does. Keep going."
    ];

    // Default syllabus structure
    const initialSyllabus = {
        "Engineering Mathematics": ["Linear Algebra", "Calculus", "Differential Equations", "Complex Variables", "Probability and Statistics"],
        "Network Theory": ["Network Analysis", "Network Theorems", "Two-Port Networks", "Transient Analysis"],
        "Signals & Systems": ["Continuous-time signals", "LTI systems", "Fourier Series", "Fourier Transform", "Laplace Transform", "Z-Transform"],
        "Control Systems": ["Basic Control System Components", "Feedback Principle", "Stability Analysis (Routh-Hurwitz, Nyquist)", "Root Locus", "Bode Plots"],
        "Electrical Machines": ["DC Machines", "Transformers", "Three-phase Induction Motors", "Synchronous Machines"],
        "Power Systems": ["Power Generation Concepts", "Transmission and Distribution", "Fault Analysis", "Load Flow Studies", "Stability"],
        "Power Electronics": ["Diode Rectifiers", "Thyristors", "DC-DC Converters", "Inverters"],
        "Analog & Digital Electronics": ["Diodes, BJTs, MOSFETs", "Operational Amplifiers", "Boolean Algebra", "Combinational and Sequential Circuits", "ADC & DAC"],
        "Electromagnetics": ["Maxwell's Equations", "Wave Propagation", "Transmission Lines", "Antennas"],
        "General Aptitude": ["Verbal Ability", "Numerical Ability", "Quantitative Aptitude"]
    };

    let studyData = {};

    // --- CORE FUNCTIONS ---

    function initializeApp() {
        loadData();
        renderSyllabus();
        updateProgress();
        displayRandomQuote();
        loadNotes();
        addEventListeners();
    }
    
    // Renders the entire syllabus structure in the HTML
    function renderSyllabus() {
        const container = document.getElementById('syllabus-container');
        container.innerHTML = ''; // Clear existing content

        for (const subject in studyData) {
            const section = document.createElement('div');
            section.className = 'subject-section';

            // Create header (for accordion)
            const header = document.createElement('div');
            header.className = 'subject-header';
            header.innerHTML = `${subject} <span class="arrow">▼</span>`;
            header.onclick = () => {
                const content = section.querySelector('.subject-content');
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    content.style.padding = "0 15px";
                    header.querySelector('.arrow').style.transform = "rotate(0deg)";
                } else {
                    // Set padding before expanding for smooth animation
                    content.style.padding = "15px";
                    content.style.maxHeight = content.scrollHeight + "px";
                    header.querySelector('.arrow').style.transform = "rotate(-180deg)";
                }
            };

            // Create content area
            const content = document.createElement('div');
            content.className = 'subject-content';

            const topicList = document.createElement('ul');
            topicList.className = 'topic-list';

            studyData[subject].topics.forEach((topic, index) => {
                const li = document.createElement('li');
                li.className = 'topic-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = topic.completed;
                checkbox.id = `topic-${subject}-${index}`;
                checkbox.onchange = () => toggleTopicCompletion(subject, index);

                const label = document.createElement('label');
                label.htmlFor = `topic-${subject}-${index}`;
                label.textContent = topic.name;
                if(topic.completed) label.classList.add('completed');
                
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '✖';
                deleteBtn.className = 'delete-btn';
                deleteBtn.onclick = () => removeTopic(subject, index);

                li.appendChild(checkbox);
                li.appendChild(label);
                li.appendChild(deleteBtn);
                topicList.appendChild(li);
            });

            // Add new topic input form
            const editControls = document.createElement('div');
            editControls.className = 'edit-controls';
            
            const newTopicInput = document.createElement('input');
            newTopicInput.type = 'text';
            newTopicInput.placeholder = 'Add new topic...';
            
            const addBtn = document.createElement('button');
            addBtn.textContent = 'Add';
            addBtn.onclick = () => addTopic(subject, newTopicInput);
            
            editControls.appendChild(newTopicInput);
            editControls.appendChild(addBtn);

            content.appendChild(topicList);
            content.appendChild(editControls);
            section.appendChild(header);
            section.appendChild(content);
            container.appendChild(section);
        }
    }

    // Toggles a topic's completion status
    function toggleTopicCompletion(subject, index) {
        studyData[subject].topics[index].completed = !studyData[subject].topics[index].completed;
        saveData();
        updateProgress();
        // Re-render to update style of the label
        renderSyllabus(); 
    }
    
    // Adds a new topic to a subject
    function addTopic(subject, inputElement) {
        const topicName = inputElement.value.trim();
        if (topicName) {
            studyData[subject].topics.push({ name: topicName, completed: false });
            inputElement.value = '';
            saveData();
            renderSyllabus();
        }
    }
    
    // Removes a topic from a subject
    function removeTopic(subject, index) {
        if(confirm(`Are you sure you want to delete "${studyData[subject].topics[index].name}"?`)) {
            studyData[subject].topics.splice(index, 1);
            saveData();
            renderSyllabus();
            updateProgress();
        }
    }

    // Updates the main progress bar
    function updateProgress() {
        let totalTopics = 0;
        let completedTopics = 0;

        for (const subject in studyData) {
            totalTopics += studyData[subject].topics.length;
            completedTopics += studyData[subject].topics.filter(t => t.completed).length;
        }

        const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        
        document.getElementById('progress-percent').textContent = `${percentage}%`;
        document.getElementById('progress-bar-inner').style.width = `${percentage}%`;
    }

    // Displays a random motivational quote
    function displayRandomQuote() {
        const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        document.getElementById('motivational-quote').textContent = quote;
    }
    
    // --- DATA PERSISTENCE (using Local Storage) ---
    
    function saveData() {
        localStorage.setItem('gateStudyData', JSON.stringify(studyData));
    }
    
    function loadData() {
        const savedData = localStorage.getItem('gateStudyData');
        if (savedData) {
            studyData = JSON.parse(savedData);
        } else {
            // First time use: structure the initial data
            studyData = {};
            for (const subject in initialSyllabus) {
                studyData[subject] = {
                    topics: initialSyllabus[subject].map(name => ({ name: name, completed: false }))
                };
            }
        }
    }
    
    function saveNotes() {
        const notes = document.getElementById('notes-formulas').value;
        localStorage.setItem('gateNotes', notes);
        alert('Notes saved!');
    }
    
    function loadNotes() {
        const savedNotes = localStorage.getItem('gateNotes');
        if (savedNotes) {
            document.getElementById('notes-formulas').value = savedNotes;
        }
    }
    
    // --- EVENT LISTENERS ---
    
    function addEventListeners() {
        document.getElementById('save-notes-btn').addEventListener('click', saveNotes);
        // Note: other event listeners are added dynamically during render
    }

    // --- START THE APP ---
    initializeApp();
});