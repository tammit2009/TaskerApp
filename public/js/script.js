
// Navbar menu toggle button control

const menu = document.querySelector('#mobile-menu');
const navMenuAccessGroup = document.querySelector('.nav-menu-access-group');
// const menuLinks = document.querySelector('.nav-menu');
// const accessMenuLinks = document.querySelector('.nav-access');

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    navMenuAccessGroup.classList.toggle('active');
    // menuLinks.classList.toggle('active');
    // accessMenuLinks.classList.toggle('active');
});




