let quotes = [];

function saveQuotes(){
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes(){
    const saved = localStorage.getItem('quotes');
    if(saved){
        quotes = JSON.parse(saved);
    }
}

function renderQuotes(){
    let list = document.getElementById("quotesList");
    let html = "";

    quotes.forEach((quote, index) => {
        html += `
            <div class="quote-card">
                <div class="quote-text"> ${quote.textInput}</div>
                <div class="quote-author"> ${quote.authorInput}</div>
                <button class="delete-btn" data-index="${index}"> Удалить </button>
            </div>
        `;
    });
    list.innerHTML = html;

    document.querySelectorAll(".delete-btn").forEach(btn => { 
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            quotes.splice(index, 1);
            saveQuotes();
            renderQuotes();
        }); 
    });
}

function addQuote(){
    const text = document.getElementById('quoteText');
    const author = document.getElementById('quoteAuthor');

    const textInput = text.value;
    const authorInput = author.value;

    console.log(textInput);
    console.log(authorInput);

    quotes.push({textInput, authorInput})
    saveQuotes();
    renderQuotes();

    text.value = '';
    author.value = '';
}

document.getElementById('addBtn').addEventListener('click', addQuote);


loadQuotes();
renderQuotes();