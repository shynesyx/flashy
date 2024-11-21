const { contextBridge } = require('electron');

const flashcards = require('./flashcards');

const populateSubjects = () => {
    return flashcards.populateSubjects();
};

contextBridge.exposeInMainWorld('api', {
    populateSubjects: populateSubjects
});
