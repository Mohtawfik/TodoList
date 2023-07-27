function addTodo() {
    const title = todoInput.value.trim();
    if (title === '') return;

    fetch('/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
    })
    .then(response => response.json())
    .then(todo => {
        todoInput.value = '';
        renderTodoItem(todo);
    })
    .catch(error => {
        console.error('Error adding todo:', error);
    });
}

function renderTodoItem(todo, isEdit, editItem) {
    const todoItem = document.createElement('div');
    todoItem.classList.add('todo-item');
    todoItem.dataset.id = todo.id;
    todoItem.innerHTML = `
        <span>${todo.title}</span>
        <span class="created-at">${new Date(todo.created_at).toISOString().split('T')[0].toString()}</span>
        <div class="button-container">
            <button class="edit-button">Edit</button>
            <button class="complete-button">Complete</button>
            <button class="delete-button">Delete</button>
        </div>
    `;
    if(isEdit){
      todoList.insertBefore(todoItem, editItem);
    } else{
      todoList.appendChild(todoItem);
    }
}

function editTodo(todoId) {
    const todoItem = document.querySelector(`[data-id="${todoId}"]`);
    const previousTodoItem = todoItem.cloneNode(true);
    if (!todoItem) return;

    const buttonContainer = todoItem.querySelector('.button-container');
    buttonContainer.remove();

    const span = todoItem.querySelector('span');
    const createdAt =  todoItem.querySelector('.created-at');
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = span.textContent;

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
        const updatedTitle = editInput.value.trim();
        if (updatedTitle === '') return;

        fetch(`/todos/${todoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: updatedTitle }),
        })
        .then(response => response.json())
        .then(updatedTodo => {
            renderTodoItem(updatedTodo, true, todoItem);
            todoItem.remove();
        })
        .catch(error => {
            todoList.appendChild(previousTodoItem);
            console.error('Error updating todo:', error);
        });
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        todoList.insertBefore(previousTodoItem, todoItem);
        todoItem.remove();

        // todoList.appendChild(previousTodoItem);
        // renderTodoItem(previousTodoItem);
    });

    todoItem.removeChild(span);
    todoItem.removeChild(createdAt);
    todoItem.appendChild(editInput);
    todoItem.appendChild(saveButton);
    todoItem.appendChild(cancelButton);
    span.style.display = 'none';
}

function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this ToDo item?')) {
        fetch(`/todos/${todoId}`, {
            method: 'DELETE',
        })
        .then(() => {
            const todoItem = document.querySelector(`[data-id="${todoId}"]`);
            if (todoItem) {
                todoItem.remove();
            }
        })
        .catch(error => {
            console.error('Error deleting todo:', error);
        });
    }
}

function completeTodo(todoId) {
    if (todoId) {
        fetch(`/todos/completed/${todoId}`, {
            method: 'POST',
        })
        .then(() => {
            const todoItem = document.querySelector(`[data-id="${todoId}"]`);
            if (todoItem) {
                todoItem.remove();
            }
        })
        .catch(error => {
            console.error('Error completing todo:', error);
        });
    }
}

function fetchTodos() {
    fetch('/todos')
    .then(response => response.json())
    .then(todos => {
        todos.forEach(todo => {
            renderTodoItem(todo);
        });
        todoList.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('edit-button')) {
                const todoId = parseInt(target.parentNode.parentNode.dataset.id);
                editTodo(todoId);
            } else if (target.classList.contains('delete-button')) {
                const todoId = parseInt(target.parentNode.parentNode.dataset.id);
                deleteTodo(todoId);
            } else if (target.classList.contains('complete-button')) {
                const todoId = parseInt(target.parentNode.parentNode.dataset.id);
                completeTodo(todoId);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching todos:', error);
    });
}

function init() {
  const todoInput = document.getElementById('todoInput');
  const addButton = document.getElementById('addButton');
  const todoList = document.getElementById('todoList');

  addButton.addEventListener('click', addTodo);

  const deletedButton = document.getElementById('deletedButton');
  deletedButton.addEventListener('click', () => {
      window.location.href = '/deleted-items';
  });

  const completedButton = document.getElementById('completedButton');
  completedButton.addEventListener('click', () => {
      window.location.href = '/completed-items';
  });
  fetchTodos();
}

document.addEventListener('DOMContentLoaded', init);
