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

async function loadUser() {
    try {
        const response = await fetch('/users/profile', {
        method: 'get',
        headers: {
            'Authorization': `${token}`
        },
    });
        if (!response.ok) throw new Error('Не удалось загрузить');

        const result = await response.json();
        const userinfo= document.getElementById('userinfo');
        const name =document.createElement('h1');
        name.textContent = `Name:${result.newUserData.userName}`
        name.className = 'user-name';

        const email =document.createElement('h2');
        email.textContent = `Email:${result.newUserData.userEmail}`
        email.className = 'user-email';

        const age =document.createElement('h3');
        age.textContent = `Age:${result.newUserData.userAge}`
        age.className = 'user-userAge';

        const userid =document.createElement('p');
        userid.textContent = `ID:${result.newUserData.userId}`
        userid.className = 'user-userId';


        userinfo.appendChild(name);
        userinfo.appendChild(email);
        userinfo.appendChild(age);
        userinfo.appendChild(userid);
        console.log(result);
    }catch (error) {
        console.error(error);
    }



}
await loadUser();

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
        await renderTasks();
        createPagination(pagination);
    }catch (error) {
        console.log(error);
    }

});

const moreandless = document.getElementById('moreBtn')
moreandless.addEventListener('click', addFieldWithRemove)
const addedGroups = [];
let pagination ={};

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

    const infokDiv = document.createElement('div');
    infokDiv.className = 'info';

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';


    const titleEl = document.createElement('h2');
    titleEl.className = 'title';
    titleEl.textContent = taskData.title;


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
    editBtn.dataset.taskId = taskData.task_id;


    editBtn.addEventListener('click', async function() {
        const taskId = this.dataset.taskId;

        let titleInput, descriptionInput, taskDateInput, notesInput, locationInput, priorityLabelInput;

        if (this.textContent === 'edit') {

            this.textContent = 'update';
            this.classList.add('update-mode');
            console.log('Переключено в режим обновления для задачи:', taskId);

            const taskDiv = this.closest('.taskdiv');
            const infoDiv = taskDiv.querySelector('.info');
            infoDiv.innerHTML = '';


            const titleLabel = document.createElement('label');
            titleLabel.htmlFor = 'titleUp';
            titleLabel.textContent = 'Title:';
            infoDiv.appendChild(titleLabel);

            titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.id = 'titleUp';
            titleInput.name = 'titleUp';
            titleInput.value = taskData.title;
            infoDiv.appendChild(titleInput);


            const descriptionLabel = document.createElement('label');
            descriptionLabel.htmlFor = 'descriptionUp';
            descriptionLabel.textContent = 'Description:';
            infoDiv.appendChild(descriptionLabel);

            descriptionInput = document.createElement('textarea');
            descriptionInput.id = 'descriptionUp';
            descriptionInput.name = 'descriptionUp';
            descriptionInput.value = taskData.description;
            infoDiv.appendChild(descriptionInput);


            const taskDateLabel = document.createElement('label');
            taskDateLabel.htmlFor = 'taskDateUp';
            taskDateLabel.textContent = 'Date:';
            infoDiv.appendChild(taskDateLabel);

            taskDateInput = document.createElement('input');
            taskDateInput.type = 'date';
            taskDateInput.id = 'taskDateUp';
            taskDateInput.name = 'taskDateUp';
            const dateOnly = taskData.task_date.split('T')[0];
            taskDateInput.value = dateOnly;
            infoDiv.appendChild(taskDateInput);


            const notesLabel = document.createElement('label');
            notesLabel.htmlFor = 'notesUp';
            notesLabel.textContent = 'Notes:';
            infoDiv.appendChild(notesLabel);

            notesInput = document.createElement('input');
            notesInput.type = 'text';
            notesInput.id = 'notesUp';
            notesInput.name = 'notesUp';
            notesInput.value = taskData.notes ;
            notesInput.className = 'form-control';
            infoDiv.appendChild(notesInput);


            const locationLabel = document.createElement('label');
            locationLabel.htmlFor = 'locationUp';
            locationLabel.textContent = 'Location:';
            infoDiv.appendChild(locationLabel);

            locationInput = document.createElement('input');
            locationInput.type = 'text';
            locationInput.id = 'locationUp';
            locationInput.name = 'locationUp';
            locationInput.value = taskData.location ;
            locationInput.className = 'form-control';
            infoDiv.appendChild(locationInput);


            const priorityLabel = document.createElement('label');
            priorityLabel.htmlFor = 'priorityUp';
            priorityLabel.textContent = 'Priority:';
            infoDiv.appendChild(priorityLabel);

            priorityLabelInput = document.createElement('select');
            priorityLabelInput.id = 'priorityUp';
            priorityLabelInput.name = 'priorityUp';

            const options = [
                { value: 'low', text: 'Low' },
                { value: 'medium', text: 'Medium' },
                { value: 'high', text: 'High' }
            ];

            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                priorityLabelInput.appendChild(optionElement);
            });

            priorityLabelInput.value = taskData.priority || 'medium';
            infoDiv.appendChild(priorityLabelInput);
        } else {

            const taskDiv = this.closest('.taskdiv');
            const infoDiv = taskDiv.querySelector('.info');

            titleInput = infoDiv.querySelector('input[name="titleUp"]');
            descriptionInput = infoDiv.querySelector('textarea[name="descriptionUp"]');
            taskDateInput = infoDiv.querySelector('input[name="taskDateUp"]');
            notesInput = infoDiv.querySelector('input[name="notesUp"]');
            locationInput = infoDiv.querySelector('input[name="locationUp"]');
            priorityLabelInput = infoDiv.querySelector('select[name="priorityUp"]');

            try {
                const response = await fetch(`/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({
                        title: titleInput.value,
                        description: descriptionInput.value,
                        task_date: taskDateInput.value,
                        details: {
                            notes: notesInput.value,
                            location: locationInput.value,
                            priority: priorityLabelInput.value
                        }
                    })
                });

                if (response.ok) {
                    this.textContent = 'edit';
                    this.classList.remove('update-mode');
                    console.log('Задача обновлена успешно');
                    await renderTasks();
                }
            } catch (error) {
                console.error('Ошибка при обновлении:', error);
            }
        }
    });


    const completeBtn = document.createElement('input');
    completeBtn.className = 'iscomplited';
    completeBtn.textContent = 'x';
    completeBtn.type = 'checkbox';
    completeBtn.checked = taskData.completed;
    completeBtn.dataset.taskId = taskData.task_id;


    completeBtn.addEventListener('click', async function() {
        try {
            const taskId = this.dataset.taskId;
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed: completeBtn.checked
                })
            });

            if (response.ok) {
                console.log(await response.json());
            }
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
        }
    });


    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.textContent = 'delete';
    deleteBtn.dataset.taskId = taskData.task_id;



    deleteBtn.addEventListener('click', async function(event) {
        if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;

        try {
            const taskId = this.dataset.taskId;
            if (!taskId) {
                console.error('ID задачи не найден');
                alert('Не удалось определить ID задачи');
                return;
            }

            console.log('Удалён щалача с ID:', taskId);

            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (response.ok) {
                if (taskDiv) {
                    taskDiv.remove();
                } else {
                    console.warn('Элемент taskDiv не найден');
                }
            } else {
                alert('Ошибка при удалении задачи');
            }
            await renderTasks();
            createPagination(pagination);
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Не удалось удалить задачу');
        }
    });


    taskDiv.appendChild(infokDiv);
    taskDiv.appendChild(actionsDiv);
    infokDiv.appendChild(titleEl);
    infokDiv.appendChild(descriptionEl);
    infokDiv.appendChild(dateEl);
    infokDiv.appendChild(notesEl);
    infokDiv.appendChild(locationEl);
    infokDiv.appendChild(priorityEl);
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(completeBtn);
    actionsDiv.appendChild(deleteBtn);

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
        pagination = result.task.pagination;

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


function createPagination(pagination) {

    const paginationBox = document.getElementById('pagenationbox');
    paginationBox.innerHTML = '';
    const fragment = document.createDocumentFragment();


    for (let i = 1; i <= pagination.totalPages; i++) {
        const link = document.createElement('a');
        link.href = `/?page=${i}`;
        link.textContent = i;
        link.classList.add('pagination-link');

        if (pagination.currentPage === i) {
            link.classList.add('active');
        }
        fragment.appendChild(link);
    }

    paginationBox.appendChild(fragment);
}

await renderTasks();
createPagination(pagination);