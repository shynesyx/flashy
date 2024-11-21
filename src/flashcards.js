const dbmgr = require('./db');
const db = dbmgr.db;

function fetch(query) {
    const stmt = db.prepare(query);
    const res = stmt.all();
    return res;
}

function getSubjects() {
    const sql = 'SELECT subject_id, subject_name FROM subject;';
    return fetch(sql);
};

function getCards(subjectId) {
    updateStatusBar('getting cards for ' + subjectId + ' ... ');
    const sql = `SELECT front, back FROM card WHERE subject_id = ${subjectId};`;
    return fetch(sql);
};

function addEntryToDatabase(tableName, data) {
    try {
        const sql = `INSERT INTO ${tableName} (${Object.keys(data).join(', ')}) VALUES (${Object.keys(data).map(() => '?').join(', ')})`;
        const stmt = db.prepare(sql);
        const info = stmt.run(...Object.values(data));
        return info.lastInsertRowid;
    } catch (error) {
        throw error;
    } finally {
        // db.close();
    }
}

function addCardToDatabase(frontText, backText, subjectId) {
    // Prepare data object with front and back text
    const cardData = {
        subject_id: subjectId,
        front: frontText,
        back: backText,
    };

    try {
        // Call the addEntryToDatabase function with appropriate parameters
        const tableName = 'card';
        const lastInsertedId = addEntryToDatabase(tableName, cardData);
        console.log(`Card successfully added with ID: ${lastInsertedId}`);
        // Handle successful addition (e.g., clear input fields, show success message)
    } catch (error) {
        console.error('Error adding card to database:', error);
        // Handle errors (e.g., display error message to the user)
    }
}

function addSubjectToDatabase(subjectName) {
    const today = new Date();
    const formattedDate = today.toString();

    const subjectData = {
        subject_name: subjectName,
        date_created: formattedDate,
        date_accessed: formattedDate
    };

    console.log(formattedDate);

    addEntryToDatabase('subject', subjectData);
}


function addNewCardButton(container, subjectId) {
    // Create the front input
    const frontInput = document.createElement('input');
    frontInput.type = 'text';
    frontInput.placeholder = 'Front';
    frontInput.classList.add('new-card-input', 'front');

    // Create the back input
    const backInput = document.createElement('input');
    backInput.type = 'text';
    backInput.placeholder = 'Back';
    backInput.classList.add('new-card-input', 'back');

    // Create the button
    const newCardButton = document.createElement('button');
    newCardButton.classList.add('new-card');
    newCardButton.type = 'button';
    newCardButton.id = 'new-card-button';
    newCardButton.textContent = 'New Card';
    newCardButton.addEventListener('click', () => {
        console.log('you clicked on ' + newCardButton.id);
        const frontText = frontInput.value;
        const backText = backInput.value;
        // Call the addCardToDatabase function with user input
        addCardToDatabase(frontText, backText, subjectId);
        // Clear the input fields after adding the card (optional)
        frontInput.value = '';
        backInput.value = '';
        populateCards(subjectId);
    });

    console.log('ready to add new card to ' +subjectId);

    // Append the elements to the container
    container.appendChild(frontInput);
    container.appendChild(backInput);
    container.appendChild(newCardButton);
}

function createCard(frontText, backText) {
    const card = document.createElement('li');
    card.classList.add('card');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    cardFront.textContent = frontText;

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.textContent = backText;

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    return card;
}


function createList(parent, clear=true) {
    // Clear content
    if (clear) {
        parent.innerHTML = '';
    }

    // Create list and return
    const ul = document.createElement('ul');
    ul.setAttribute('id', parent.id.split('-')[0] + '-list');
    parent.appendChild(ul);

    return ul;
}


function createInput(container, inputType, inputClass, placeholderText) {
    const input = document.createElement('input');
    input.type = inputType;
    input.classList.add(inputClass);
    input.placeholder = placeholderText;

    container.appendChild(input);

    return input;
}

function createNewSubjectBox(parent) {
    return createInput(parent, 'text', 'input-subject', 'New Subject');
}

exports.populateSubjects = () => {
    const subjectContainer = document.getElementById('subject-container');

    // Add input box for new subject
    const newSubject = createNewSubjectBox(subjectContainer);
    newSubject.addEventListener('keyup', function onEvent(e) {
        if (e.keyCode === 13) {
            const subjectName = newSubject.value;
            console.log('Added new subject: ', subjectName);
            addSubjectToDatabase(subjectName);
            exports.populateSubjects();
        };
    });

    // Populate the list of subjects
    const subjectList = createList(subjectContainer, clear=false);
    const subjects = getSubjects();

    for (const subject of subjects) {
        const li = document.createElement('li');
        li.textContent = subject['subject_name'];
        const subjectId = subject['subject_id'];
        console.log(subjectId);

        // additional setting of the list item
        li.classList.add('subject-item');
        li.addEventListener('click', () => {
            console.log('you clicked on', li.textContent);
            populateCards(subjectId);
        });

        subjectList.appendChild(li);
    }
};


populateCards = (subjectId) => {
    console.log('populating cards ...');
    const cards = getCards(subjectId);
    cardContainer = document.getElementById('card-container');
    const cardList = createList(cardContainer);
    console.log(cardContainer.id.split('-')[0]);

    // Create the list of cards
    for (const cardContent of cards) {
        const frontText = cardContent['front'];
        const backText = cardContent['back'];
        const card = createCard(frontText, backText);
        cardList.appendChild(card);
    }

    cardList.addEventListener('click', (event) => {
        if (event.target.classList.contains('card-front')) {
            const card = event.target.parentElement;
            card.classList.toggle('flipped');
            setTimeout(() => {
                card.classList.toggle('flipped');
            }, 2000);
        }
        if (event.target.classList.contains('card-back')) {
            const card = event.target.parentElement;
            card.classList.toggle('flipped');
        }
    });

    // Add button as well input boxes
    addNewCardButton(cardContainer, subjectId);
};


function updateStatusBar(message, milliseconds = 2000) {
    statusBar = document.querySelector('.status-bar');
    statusBar.textContent = message;
    setTimeout(() => {
        statusBar.textContent = '';
    }, milliseconds);
};

