const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tammit@kustomlynx.net',  
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`, 
        // html: '<h1>....</h2>'
    });
};

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tammit@kustomlynx.net',  
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`, 
    });
};

const sendDirectEmail = async (email, subject, text) => {
    return await sgMail.send({
        to: email,
        from: 'tammit@kustomlynx.net',  
        subject,
        text 
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail,
    sendDirectEmail
}