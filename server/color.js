let hue = 0;

setInterval(() => {
    hue++;
    const color = `hsl(${hue},100%,60%)`;

    const el = document.getElementById("con");
    el.style.borderColor = color;
    el.style.boxShadow = `0 0 15px ${color}`;
}, 150);