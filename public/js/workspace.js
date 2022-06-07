
// Start with sidebar expanded

window.addEventListener('DOMContentLoaded', e => {
    sidebar.classList.toggle("active");
});


// Toggle Collapsible Menu

const linkCollapse = document.getElementsByClassName('collapse_link');

let i;
for (i=0; i<linkCollapse.length; i++) {
    linkCollapse[i].addEventListener('click', function() {

        const collapseMenu = this.parentElement.nextElementSibling;
        let expanded = collapseMenu.classList.contains("show-collapse");
        // collapseMenu.classList.toggle('show-collapse');
        // this.classList.toggle('rotate');

        collapseSubLinks();
        
        if (expanded) {
            collapseMenu.classList.remove('show-collapse');
            this.classList.remove('rotate');
        }
        else {
            collapseMenu.classList.add('show-collapse');
            this.classList.add('rotate');
        }
    });
}

function collapseSubLinks() {
    let i;
    for (i=0; i<linkCollapse.length; i++) {
        const menuCollapse = linkCollapse[i].parentElement.nextElementSibling;
        menuCollapse.classList.remove('show-collapse');
        linkCollapse[i].classList.remove('rotate');
    }
}

// Toggle the sidebar

let btn = document.querySelector("#btn");
let sidebar = document.querySelector(".sidebar");

btn.onclick = function() {
    if (sidebar.classList.contains("active") !== -1) {
        collapseSubLinks();
    }
    sidebar.classList.toggle("active");
}


// Search Button related
// let searchBtn = document.querySelector(".bx-search");
// searchBtn.onclick = function() {
//     sidebar.classList.toggle("active");
// }


