
/*======== Config Variables ========*/
const nav = document.getElementById("nav-bar");
const menu = document.getElementById("menu");
const CardsContent = document.querySelector(".wrap-quiz-card");

/*======= Nav Mobile ========*/
function NavMobile(){
    let list = document.querySelector('.bi-list');
    let x = document.querySelector('.bi-x-lg');

    list.classList.toggle("disabled");
    x.classList.toggle("disabled");
    nav.classList.toggle("disabled")
}

menu.addEventListener('click',()=>{
    NavMobile();
});


document.getElementById("year").textContent=`${new Date().getFullYear()}`

async function CarregarCards(){
    const data =  await Loader("../config/log.json")

    let dados = (data.card);

    dados.forEach((item,i) => {
        try {
          const card = document.createElement("div");
        card.className='wrap-card';

        const imgdiv = document.createElement("div");
        imgdiv.className='img-quiz';

        const img = document.createElement("img");
        img.src=item.scripts;

        const p = document.createElement("p");
        p.textContent=item.parag;

        const h2 = document.createElement("h2");
        h2.textContent=item.title;


        imgdiv.appendChild(img);
        card.appendChild(imgdiv);
        card.appendChild(h2);
        card.appendChild(p);

        card.addEventListener("click",()=>{
            window.location.href=`../auths/quiz.html?disciplina=${item.disciplina}`
        });

        CardsContent.appendChild(card);
        } catch (error) {
            console.log("Erro no codigo : ",error);
        }
    });
}


document.addEventListener("DOMContentLoaded", CarregarCards);

const inputFilter = document.getElementById("filter");

const msgNotFound = document.createElement("p");
msgNotFound.textContent = "Nenhuma disciplina encontrada.";
msgNotFound.style.display = "none";
msgNotFound.style.marginTop = "20px";
msgNotFound.style.textAlign = "center";


CardsContent.appendChild(msgNotFound);

inputFilter.addEventListener("input", () => {
    const value = inputFilter.value.toLowerCase();
    const cards = document.querySelectorAll(".wrap-card");
    let encontrou = false;

    cards.forEach(card => {
        const title = card.querySelector("h2").textContent.toLowerCase();
        const parag = card.querySelector("p").textContent.toLowerCase();

        if (title.includes(value) || parag.includes(value)) {
            card.style.display = "block";
            encontrou = true;
        } else {
            card.style.display = "none";
        }
    });

    msgNotFound.style.display = encontrou ? "none" : "block";
});
