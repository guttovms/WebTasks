// Seleção de elementos do HTML para interação
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterBtn = document.querySelector("#filter-select");

let oldInputValue; // Variável para armazenar o valor antigo ao editar uma tarefa

// Função para adicionar uma nova tarefa na lista
const saveTodo = (text, done = 0, save = 1) => {
  // Cria um novo elemento de tarefa
  const todo = document.createElement("div");
  todo.classList.add("todo");

  // Cria elementos dentro da tarefa para exibir texto, botões de conclusão, edição e remoção
  const todoTitle = document.createElement("h3");
  todoTitle.innerText = text;
  todo.appendChild(todoTitle);

  const doneBtn = document.createElement("button");
  doneBtn.classList.add("finish-todo");
  doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
  todo.appendChild(doneBtn);

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-todo");
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  todo.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("remove-todo");
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  todo.appendChild(deleteBtn);

  // Adiciona a classe "done" se a tarefa estiver concluída
  if (done) {
    todo.classList.add("done");
  }

  // Salva na localStorage se a opção de salvar estiver habilitada
  if (save) {
    saveTodoLocalStorage({ text, done: 0 });
  }

  // Adiciona a nova tarefa à lista na interface
  todoList.appendChild(todo);

  // Limpa o campo de entrada após adicionar a tarefa
  todoInput.value = "";
};

// Função para alternar entre os formulários de adição e edição de tarefas
const toggleForms = () => {
  editForm.classList.toggle("hide");
  todoForm.classList.toggle("hide");
  todoList.classList.toggle("hide");
};

// Função para atualizar o texto de uma tarefa após a edição
const updateTodo = (text) => {
  // Seleciona todas as tarefas
  const todos = document.querySelectorAll(".todo");

  // Itera sobre cada tarefa
  todos.forEach((todo) => {
    let todoTitle = todo.querySelector("h3");

    // Se o texto da tarefa correspondente ao valor antigo, atualiza o texto
    if (todoTitle.innerText === oldInputValue) {
      todoTitle.innerText = text;

      // Atualiza os dados na localStorage
      updateTodoLocalStorage(oldInputValue, text);
    }
  });
};

// Função para exibir apenas as tarefas que correspondem à pesquisa
const getSearchedTodos = (search) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    const todoTitle = todo.querySelector("h3").innerText.toLowerCase();

    todo.style.display = "flex";

    // Oculta a tarefa se o texto não contiver a pesquisa
    if (!todoTitle.includes(search)) {
      todo.style.display = "none";
    }
  });
};

// Função para filtrar as tarefas com base na opção selecionada
const filterTodos = (filterValue) => {
  const todos = document.querySelectorAll(".todo");

  switch (filterValue) {
    case "all":
      // Exibe todas as tarefas
      todos.forEach((todo) => (todo.style.display = "flex"));
      break;

    case "done":
      // Exibe apenas tarefas concluídas
      todos.forEach((todo) =>
        todo.classList.contains("done")
          ? (todo.style.display = "flex")
          : (todo.style.display = "none")
      );
      break;

    case "todo":
      // Exibe apenas tarefas não concluídas
      todos.forEach((todo) =>
        !todo.classList.contains("done")
          ? (todo.style.display = "flex")
          : (todo.style.display = "none")
      );
      break;

    default:
      break;
  }
};

// Eventos

// Evento de envio do formulário para adicionar nova tarefa
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputValue = todoInput.value;

  if (inputValue) {
    saveTodo(inputValue);
  }
});

// Evento de clique global para interação com botões de tarefas
document.addEventListener("click", (e) => {
  const targetEl = e.target;
  const parentEl = targetEl.closest("div");
  let todoTitle;

  // Obtém o título da tarefa relacionada ao botão clicado
  if (parentEl && parentEl.querySelector("h3")) {
    todoTitle = parentEl.querySelector("h3").innerText || "";
  }

  // Ação ao clicar no botão de conclusão de uma tarefa
  if (targetEl.classList.contains("finish-todo")) {
    parentEl.classList.toggle("done");

    // Atualiza o status da tarefa na localStorage
    updateTodoStatusLocalStorage(todoTitle);
  }

  // Ação ao clicar no botão de remoção de uma tarefa
  if (targetEl.classList.contains("remove-todo")) {
    parentEl.remove();

    // Remove a tarefa da localStorage
    removeTodoLocalStorage(todoTitle);
  }

  // Ação ao clicar no botão de edição de uma tarefa
  if (targetEl.classList.contains("edit-todo")) {
    // Exibe o formulário de edição e preenche o campo com o valor atual da tarefa
    toggleForms();
    editInput.value = todoTitle;
    oldInputValue = todoTitle;
  }
});

// Evento de clique no botão de cancelar edição
cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms();
});

// Evento de envio do formulário de edição de tarefa
editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const editInputValue = editInput.value;

  // Atualiza a tarefa com o novo texto
  if (editInputValue) {
    updateTodo(editInputValue);
  }

  // Volta para o formulário de adição de tarefa
  toggleForms();
});

// Evento de tecla solta no campo de pesquisa
searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;

  // Chama a função para exibir apenas as tarefas que correspondem à pesquisa
  getSearchedTodos(search);
});

// Evento de clique no botão de limpar pesquisa
eraseBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Limpa o campo de pesquisa
  searchInput.value = "";

  // Dispara o evento de tecla solta para garantir que as tarefas sejam atualizadas
  searchInput.dispatchEvent(new Event("keyup"));
});

// Evento de alteração na opção de filtro
filterBtn.addEventListener("change", (e) => {
  const filterValue = e.target.value;

  // Chama a função para filtrar as tarefas com base na opção selecionada
  filterTodos(filterValue);
});

// Local Storage

// Função para obter as tarefas salvas na localStorage
const getTodosLocalStorage = () => {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];

  return todos;
};

// Função para carregar as tarefas na lista ao carregar a página
const loadTodos = () => {
  const todos = getTodosLocalStorage();

  // Adiciona cada tarefa à lista na interface
  todos.forEach((todo) => {
    saveTodo(todo.text, todo.done, 0);
  });
};

// Função para salvar uma nova tarefa na localStorage
const saveTodoLocalStorage = (todo) => {
  const todos = getTodosLocalStorage();

  // Adiciona a nova tarefa à lista de tarefas salvas
  todos.push(todo);

  // Atualiza a localStorage com a lista de tarefas atualizada
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Função para remover uma tarefa da localStorage
const removeTodoLocalStorage = (todoText) => {
  const todos = getTodosLocalStorage();

  // Filtra as tarefas, removendo a tarefa com o texto correspondente
  const filteredTodos = todos.filter((todo) => todo.text != todoText);

  // Atualiza a localStorage com a lista de tarefas atualizada
  localStorage.setItem("todos", JSON.stringify(filteredTodos));
};

// Função para atualizar o status de uma tarefa na localStorage
const updateTodoStatusLocalStorage = (todoText) => {
  const todos = getTodosLocalStorage();

  // Atualiza o status da tarefa correspondente na lista de tarefas salvas
  todos.map((todo) =>
    todo.text === todoText ? (todo.done = !todo.done) : null
  );

  // Atualiza a localStorage com a lista de tarefas atualizada
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Função para atualizar o texto de uma tarefa na localStorage
const updateTodoLocalStorage = (todoOldText, todoNewText) => {
  const todos = getTodosLocalStorage();

  // Atualiza o texto da tarefa correspondente na lista de tarefas salvas
  todos.map((todo) =>
    todo.text === todoOldText ? (todo.text = todoNewText) : null
  );

  // Atualiza a localStorage com a lista de tarefas atualizada
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Chama a função para carregar as tarefas ao carregar a página
loadTodos();


