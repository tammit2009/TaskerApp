// Clear global notification/alert 

document.querySelectorAll('.alert .close').forEach(alertBtnEl => {
    alertBtnEl.addEventListener('click', () => alertBtnEl.parentElement.classList.remove('alert-show'));
});


// Show Error Message
function showError(input, message) {
    const validationGroup = input.parentElement;
    validationGroup.className = 'validation-group error';

    const errorMessage = validationGroup.querySelector('p');
    errorMessage.innerText = message;
}

// Show Valid Message
function showValid(input) {
    const validationGroup = input.parentElement;
    validationGroup.className = 'validation-group valid'; 
}

// Check Required Fields
function checkRequired(inputArr) {
    let valid = true;

    inputArr.forEach(function(input) {
        if (input.value.trim() === '') {
            showError(input, `${getFieldName(input)} is required`);
            valid = false;
        }
        else {
            showValid(input);
        }
    });

    return valid;
}

// Check Input Length
function checkLength(input, min, max) {
    if (input.value.length < min) {
        showError(input, `${getFieldName(input)} must be at least ${min} characters`);
    }
    else if (input.value.length > max) {
        showError(input, `${getFieldName(input)} must be at most ${max} characters`);
    }
    else {
        showValid(input);
    }
}

// Check Passwords Match
function passwordMatch(input1, input2) {
    if (input1.value !== input2.value) {
        showError(input2, 'Passwords do not match');
    }
}

// Get fieldname
function getFieldName(input) {
    return input.name.charAt(0).toUpperCase() + input.name.slice(1);
}

// Login Form Validation

const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('email');
const loginPassword = document.getElementById('password');

// Login Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        if (!checkRequired([ loginEmail, loginPassword ])) {
            e.preventDefault();
        }
    });
}

// Registration Form Validation

const registerForm = document.getElementById('register-form');
const registerName = document.getElementById('name');
const registerEmail = document.getElementById('email');
const registerPassword = document.getElementById('password');
const registerPasswordConf = document.getElementById('confirmPassword');

// Register Event Listeners
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        if (

            !checkRequired([ registerName, registerEmail, registerPassword, registerPasswordConf ])
            // && checkLength(registerName, 3, 30)
            // && checkLength(password, 8, 25)
            // && checkLength(passwordConfirm, 8, 25)
            // && passwordMatch(password, passwordConfirm)

        ) e.preventDefault();  
    });
}

