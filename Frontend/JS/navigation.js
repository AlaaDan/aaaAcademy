function toggleMenu() {
    let hamburgers = document.querySelector(".text_center-h1");
    let menus = document.querySelectorAll('.site_nav_ul');

    hamburgers.forEach(hamburger => {
        hamburger.classList.toggle('active');
    });

    menus.forEach(menu => {
        menu.classList.toggle('active');
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

export { toggleMenu };