
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


async function CarregarCards(){
    const res = await fetch("../config/log.json");
    if(!res.ok) throw new Error("Erro ao carregar os dados");
    const data =  await res.json();
    console.log(data);

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

console.log(CarregarCards());
