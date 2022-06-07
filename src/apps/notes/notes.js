const chalk = require('chalk');
const fs = require('fs');

// $ node app.js add --title="t" --body="b"
const addNote = (title, body) => {
    const notes = loadNotes();

    // const duplicateNotes = notes.filter((note) => note.title === title);
    const duplicateNote = notes.find((note) => note.title === title);

    // to debug, run 'node inspect app.js add --title="Courses" --body="Nodejs"'
    // on windows, run 'node --inspect-brk app.js add --title="Courses" --body="Nodejs"'
    // open chrome "chrome://inspect" using the inbuilt v8 debugger
    // if chrome is closed, you can reopen by typing 'debug> restart'
    // debugger

    // if (duplicateNotes.length === 0) {
    if (!duplicateNote) {
        notes.push({
            title: title,
            body: body
        });
    
        saveNotes(notes);
        console.log(chalk.green.inverse('New note added'));
    }
    else {
        console.log(chalk.red.inverse('Note title taken'));
    }  
}

const removeNote = (title) => {
    const notes = loadNotes();
    const notesToKeep = notes.filter((note) => note.title !== title);

    if (notes.length > notesToKeep.length) {
        console.log(chalk.green.inverse('Note removed'));
        saveNotes(notesToKeep);
    }
    else {
        console.log(chalk.red.inverse('No note found'));
    }
}

const listNotes = () => {
    const notes = loadNotes();

    console.log(chalk.inverse('Your Notes'));

    notes.forEach((note) => console.log(note.title));
}

const loadNotes = () => {
    try {
        const dataBuffer = fs.readFileSync('./src/apps/notes/data/notes.json');
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    }
    catch (e) {
        return [];  // empty file
    }
};

const readNote = (title) => {
    const notes = loadNotes();
    const note = notes.find((note) => note.title === title);

    if (note) {
        console.log(chalk.inverse(note.title));
        console.log(note.body);
    }
    else {
        console.log(chalk.red.inverse('Note not found!'));
    }
};

const saveNotes = (notes) => {
    const dataJSON = JSON.stringify(notes);
    fs.writeFileSync('./src/apps/notes/data/notes.json', dataJSON);
};


module.exports = { addNote, removeNote, listNotes, readNote };
