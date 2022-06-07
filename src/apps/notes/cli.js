const yargs = require('yargs');
const notes = require('./notes.js');

// Customize yargs
yargs.version('1.1.0');

// Notes App Operations: add, remove, read, list

// Create add command
yargs.command({
    command: 'add',
    builder: {
        title: {                    // i.e. the option
            describe: 'Note title',
            demandOption: true,     // required    
            type: 'string'          // array, boolean (default), count, number, string
        },
        body: {
            describe: 'Note body',
            demandOption: true,
            type: 'string'
        }
    },
    describe: 'Add a new note',
    handler(argv) {
        notes.addNote(argv.title, argv.body)
    }
});

// Create remove command
yargs.command({
    command: 'remove',
    describe: 'Remove the note',
    builder: {
        title: {
            describe: 'Note title',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv) {
        notes.removeNote(argv.title);
    }
});

// List command
yargs.command({
    command: 'list',
    describe: 'List notes',
    handler() {
        notes.listNotes();
    }
});

// Read command
yargs.command({
    command: 'read',
    describe: 'Read the note',
    builder: {
        title: {
            describe: 'Note title',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv) {
        notes.readNote(argv.title)
    }
});

// console.log(yargs.argv)
yargs.parse();

// $ node app.js --help
// $ node app.js --version
// $ node app.js add
// $ node app.js remove
// $ node app.js list
// $ node app.js read

// $ node app.js add --title="This is my title"

// $ node src/apps/notes/cli.js add --title="This is my title" --body="This is the body"

// Using npm script
// $ npm run notes -- --help
// $ npm run notes -- add --title="This is my title4" --body="This is the body4"
// $ npm run notes -- remove --title "This is my title4"
// $ npm run notes -- list
// $ npm run notes read -- --title "This is my title"