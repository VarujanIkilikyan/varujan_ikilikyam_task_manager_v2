if (!localStorage.getItem('token')) {
    window.location.href = '/users/login';
}

(async () => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/users/profile', {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
            },
        });

        const result = await response.json();

        if (!response.ok) {
            alert('Invalid token!');
            window.location.href = '/users/login';
        }

        localStorage.setItem('userDate', JSON.stringify(result.user));
    } catch (error) {
        alert('Invalid token!');
        window.location.href = '/users/login';
    }
})();

const token = localStorage.getItem('token');

document.getElementById('inputForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const simpleData = Object.fromEntries(new FormData(this));
    const data ={
        "title": simpleData.title,
        "description": simpleData.description,
        "taskDate": simpleData.taskDate,

        "details": {
            "priority": simpleData.priority||"medium",
            "location": simpleData.location ||null,
            "notes": simpleData.notes || null,
        }
    }
    try {
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Не удалось саздать');

        const result = await response.json();

        console.log(result);
    }catch (error) {
        console.log(error);
    }

});

const moreandless = document.getElementById('moreBtn')
moreandless.addEventListener('click', addFieldWithRemove)
const addedGroups = [];

function addFieldWithRemove() {

    const container = document.getElementById('inputForm');
    const button = document.getElementById('moreBtn');


    if (addedGroups.length > 0) {
        const lastGroup = addedGroups.pop();
        lastGroup.remove();

        if (addedGroups.length === 0) {
            moreandless.textContent = 'больше';
        }
        return;
    }

    moreandless.textContent = 'меньше';

    const groupDiv = document.createElement('div');
    groupDiv.className = 'form-group-fields';


    const fieldsConfig = [
        {
            name: 'priority',
            type: 'select',
            options: [
                { value: 'low', text: 'Low' },
                { value: 'medium', text: 'Medium' },
                { value: 'high', text: 'High' }
            ]
        },
        { name: 'location', placeholder: 'Местоположение', type: 'text' },
        { name: 'notes', placeholder: 'Заметки и комментарии', type: 'textarea' }
    ];

    fieldsConfig.forEach(field => {
        const fieldContainer = document.createElement('div');

        if (field.type === 'select') {

            const select = document.createElement('select');
            select.name = field.name;


            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                select.appendChild(option);
            });

            fieldContainer.appendChild(select);
        } else if (field.type === 'textarea') {
            const textarea = document.createElement('textarea');
            textarea.name = field.name;
            textarea.placeholder = field.placeholder;
            fieldContainer.appendChild(textarea);
        } else {
            const input = document.createElement('input');
            input.type = field.type;
            input.name = field.name;
            input.placeholder = field.placeholder;
            fieldContainer.appendChild(input);
        }

        groupDiv.appendChild(fieldContainer);
    });

    container.insertBefore(groupDiv, button);
    addedGroups.push(groupDiv);
}


function createTaskElement(taskData) {

    const taskDiv = document.createElement('div');
    taskDiv.className = 'taskdiv';


    const titleEl = document.createElement('h2');
    titleEl.className = 'title';
    titleEl.textContent = taskData.title;

    // Описание
    const descriptionEl = document.createElement('p');
    descriptionEl.className = 'description';
    descriptionEl.textContent = taskData.description;


    const dateEl = document.createElement('p');
    dateEl.className = 'taskDate';
    const formattedDate = new Date(taskData.task_date).toLocaleString('ru-RU');
    dateEl.textContent = `Дата: ${formattedDate}`;


    const notesEl = document.createElement('p');
    notesEl.className = 'notes';
    notesEl.textContent = `Заметки: ${taskData.notes}`;


    const locationEl = document.createElement('p');
    locationEl.className = 'location';
    locationEl.textContent = `Местоположение: ${taskData.location}`;


    const priorityEl = document.createElement('p');
    priorityEl.className = 'priority';
    priorityEl.textContent = `Приоритет: ${taskData.priority}`;


    const editBtn = document.createElement('button');
    editBtn.className = 'edit';
    editBtn.textContent = 'edit';


    const completeBtn = document.createElement('input');
    completeBtn.className = 'iscomplited';
    completeBtn.textContent = 'x';
    completeBtn.type = 'checkbox';


    completeBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`/tasks/${taskData.task_id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed: taskData.completed ? 0 : 1
                })
            });

            if (response.ok) {

                taskData.completed = taskData.completed ? 0 : 1;
                completeBtn.textContent = taskData.completed ? '✓' : 'x';
            }
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
        }
    });


    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.textContent = 'delete';


    deleteBtn.addEventListener('click', async () => {
        if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;

        try {
            const response = await fetch(`/api/tasks/${taskData.task_id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                taskDiv.remove();
            } else {
                alert('Ошибка при удалении задачи');
            }
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Не удалось удалить задачу');
        }
    });


    taskDiv.appendChild(titleEl);
    taskDiv.appendChild(descriptionEl);
    taskDiv.appendChild(dateEl);
    taskDiv.appendChild(notesEl);
    taskDiv.appendChild(locationEl);
    taskDiv.appendChild(priorityEl);
    taskDiv.appendChild(editBtn);
    taskDiv.appendChild(completeBtn);
    taskDiv.appendChild(deleteBtn);

    return taskDiv;
}

async function createTaskBord() {
    try {
        const queryData = new URLSearchParams(location.search);
        const page = queryData.get('page')|| 1;
        const limit = 2

        const response = await fetch(`/tasks?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`
            }
        });

        if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);

        const result = await response.json();
        const data = result.task?.tasks;



        const container = document.createElement('div');
        container.id = 'tasksContainer';

        if (!data || !Array.isArray(data)) {
            container.innerHTML = '<p>Задач пока нет</p>';
            return container;
        }

        const fragment = document.createDocumentFragment();
        data.forEach(task => {
            const taskElement = createTaskElement(task);
            if (taskElement instanceof Node) {
                fragment.appendChild(taskElement);
            }
        });

        container.appendChild(fragment);
        return container;
    } catch (error) {
        console.error('Ошибка в createTaskBord:', error);
        const errorContainer = document.createElement('div');
        errorContainer.innerHTML = `<p style="color: red;">Ошибка: ${error.message}</p>`;
        return errorContainer;
    }
}
async function renderTasks() {
    const tasksElement = await createTaskBord();
    const app = document.getElementById('taskbox');
    app.innerHTML = '';
    app.appendChild(tasksElement);
}
await renderTasks();

// function createPagention