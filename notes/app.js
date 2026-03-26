const stats = document.getElementById("stats");
const notes_conteiner = document.getElementById("content");

let notes = [];

async function loadNotes() {
  try {
    const res = await fetch("api/notes");
    notes = await res.json();
    if(notes.length === 0){
      stats.innerText = "У вас нет заметок. Создайте свою первую заметку! \n\n";
    }
    else{
      stats.innerText = `Заметок ${notes.length}`;
    }
  } catch (error) {
    console.log("Ощибка", error);
    stats.innerText = `Информации о заметках нет`;
  }
}

async function addNote() {
  const title = prompt("Введите название ");
  const content = prompt("Введите содержание ");
  if(title === null ||content === null){
    alert("Заметка не может содержать пустое название или содержание!");
    return;
  }
  try {
    await fetch("api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    await showNotes();
  } catch (error) {
    console.log("ERROR", error.message);
  }
}

async function showNotes(){
    await loadNotes();
    if(notes.length === 0){
       notes_conteiner.innerHTML = '<h2> Пока у вас нет заметок! </h2>';
    }
    let html = '<h2> --- Заметки --- </h2>';
    notes.forEach((note) => {
        html += `
          <div style=" background-color: #008f88; color: #03381f; ">
              <small> [ ${note.id} ] ${note.date}:   </small>
              <strong> ${note.title} </strong>
              <strong> ${note.content} </strong>
          </div>
        `;
    });
    notes_conteiner.innerHTML = html;
    
}


async function editNote(){
  await loadNotes();

  if(notes.length === 0){
    alert("Нет заметок для редактирования!");
    return;
  }

  let list = notes.map(note => ` [${note.id}] ${note.title} `).join('\n');
  const input = prompt(`Введите номер заметки:\n\n${list}`);

  if(!input) return;

  const id = parseInt(input);
  const note = notes.find(n => n.id === id);

  if(!note){
    alert("Заметка не найдена!");
    return;
  }

  const newTitle = prompt("Новое название:", note.title);
  const newContent = prompt("Новое содержание:", note.content);

  if(newTitle === null || newContent === null){
    alert("Отмена редактирования!");
    return;
  }

  console.log("Редактируем:", id);

  const res = await fetch(`api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newTitle,
      content: newContent
    })
  });

  if(res.ok){
    await showNotes();
  } else {
    alert("Ошибка обновления!");
  }
}
async function deleteNote(){
  await loadNotes();

  if(notes.length === 0){
    alert("Пока нечего удалить! Заметок нет!");
    return;
  }

  let list = notes.map(note => ` [${note.id}] ${note.title} `).join('\n');
  const input = prompt(`Введите номер заметки для удаления: \n\n${list}`);

  if(!input) return;

  const id = parseInt(input);
  const note = notes.find(n => n.id === id);

  if(!note){
    alert("Неверный ID");
    return;
  }
  const res = await fetch(`api/notes/${id}`, {
    method: "DELETE"
  });

  if(res.ok){
    alert("Заметка удалена!");
    await showNotes();
  } else {
    alert("Ошибка удаления!");
  }
}

showNotes();