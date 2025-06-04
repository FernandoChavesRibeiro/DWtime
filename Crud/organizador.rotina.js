document.addEventListener('DOMContentLoaded', function() {
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const activitiesList = document.getElementById('activities-list');
    const selectedDateElement = document.getElementById('selected-date');
    const addActivityBtn = document.getElementById('add-activity-btn');
    const activityModal = document.getElementById('activity-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const cancelActivityBtn = document.getElementById('cancel-activity');
    const activityForm = document.getElementById('activity-form');
    const deleteActivityBtn = document.getElementById('delete-activity');
    const modalTitle = document.getElementById('modal-title');

    let currentDate = new Date();
    let selectedDate = null;
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    let editingActivityId = null;

    renderCalendar();
    updateSelectedDateDisplay();

    prevMonthBtn.addEventListener('click', goToPreviousMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);
    addActivityBtn.addEventListener('click', openAddActivityModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelActivityBtn.addEventListener('click', closeModal);
    activityForm.addEventListener('submit', handleActivityFormSubmit);
    deleteActivityBtn.addEventListener('click', deleteActivity);

    function renderCalendar() {
        calendarDays.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthElement.textContent = new Date(year, month, 1).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
        }).replace(/^./, (match) => match.toUpperCase());
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInLastMonth = new Date(year, month, 0).getDate();
        
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            day.textContent = daysInLastMonth - i;
            calendarDays.appendChild(day);
        }
        
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            
            if (month === today.getMonth() && year === today.getFullYear() && i === today.getDate()) {
                day.classList.add('today');
            }
            
            const dayDate = new Date(year, month, i);
            if (selectedDate && isSameDate(dayDate, selectedDate)) {
                day.classList.add('selected');
            }
            
            day.addEventListener('click', () => selectDate(dayDate));
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = i;
            day.appendChild(dayNumber);
            
            const dayActivities = getActivitiesForDate(dayDate);
            if (dayActivities.length > 0) {
                const activityCount = document.createElement('div');
                activityCount.className = 'activity-count';
                activityCount.textContent = dayActivities.length;
                day.appendChild(activityCount);
            }
            
            calendarDays.appendChild(day);
        }
        
        const totalDaysShown = firstDayOfMonth + daysInMonth;
        const remainingDays = 7 - (totalDaysShown % 7);
        if (remainingDays < 7) {
            for (let i = 1; i <= remainingDays; i++) {
                const day = document.createElement('div');
                day.className = 'day other-month';
                day.textContent = i;
                calendarDays.appendChild(day);
            }
        }
    }
    
    function goToPreviousMonth() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }
    
    function goToNextMonth() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    }
    
    function selectDate(date) {
        selectedDate = date;
        renderCalendar();
        renderActivitiesList();
        updateSelectedDateDisplay();
    }
    
    function isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    function updateSelectedDateDisplay() {
        if (selectedDate) {
            selectedDateElement.textContent = selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).replace(/^./, (match) => match.toUpperCase());
        } else {
            selectedDateElement.textContent = 'Selecione uma data';
        }
    }

    function getActivitiesForDate(date) {
        return activities.filter(activity => {
            const activityDate = new Date(activity.date);
            return isSameDate(activityDate, date);
        }).sort((a, b) => a.time.localeCompare(b.time));
    }
    
    function renderActivitiesList() {
        activitiesList.innerHTML = '';
        
        if (!selectedDate) {
            return;
        }
        
        const dayActivities = getActivitiesForDate(selectedDate);
        
        if (dayActivities.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Nenhuma atividade para este dia.';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#666';
            activitiesList.appendChild(emptyMessage);
            return;
        }
        
        dayActivities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = `activity-item ${activity.priority}-priority`;
            activityItem.innerHTML = `
                <div class="activity-time">${formatTime(activity.time)}</div>
                <div class="activity-title">${activity.title}</div>
                ${activity.description ? `<div class="activity-description">${activity.description}</div>` : ''}
            `;
            activityItem.addEventListener('click', () => editActivity(activity.id));
            activitiesList.appendChild(activityItem);
        });
    }
    
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    }
    
    function openAddActivityModal() {
        if (!selectedDate) {
            alert('Por favor, selecione uma data primeiro.');
            return;
        }
        
        editingActivityId = null;
        modalTitle.textContent = 'Adicionar Nova Atividade';
        deleteActivityBtn.style.display = 'none';
        
        activityForm.reset();
        document.getElementById('activity-time').value = '08:00';
        
        activityModal.style.display = 'block';
    }
    
    function closeModal() {
        activityModal.style.display = 'none';
    }
    
    function editActivity(activityId) {
        const activity = activities.find(a => a.id === activityId);
        if (!activity) return;
        
        editingActivityId = activityId;
        modalTitle.textContent = 'Editar Atividade';
        deleteActivityBtn.style.display = 'inline-block';
        
        document.getElementById('activity-id').value = activity.id;
        document.getElementById('activity-title').value = activity.title;
        document.getElementById('activity-time').value = activity.time;
        document.getElementById('activity-description').value = activity.description || '';
        document.getElementById('activity-priority').value = activity.priority;
        
        activityModal.style.display = 'block';
    }
    
    function handleActivityFormSubmit(e) {
        e.preventDefault();
        
        if (!selectedDate) {
            alert('Por favor, selecione uma data primeiro.');
            return;
        }
        
        const formData = {
            id: editingActivityId || Date.now().toString(),
            title: document.getElementById('activity-title').value.trim(),
            time: document.getElementById('activity-time').value,
            description: document.getElementById('activity-description').value.trim(),
            priority: document.getElementById('activity-priority').value,
            date: selectedDate.toISOString()
        };
        
        if (!formData.title) {
            alert('Por favor, insira um título para a atividade.');
            return;
        }
        
        if (editingActivityId) {
            const index = activities.findIndex(a => a.id === editingActivityId);
            if (index !== -1) {
                activities[index] = formData;
            }
        } else {
            activities.push(formData);
        }
        
        saveActivities();
        closeModal();
        renderCalendar();
        renderActivitiesList();
    }
    
    function deleteActivity() {
        if (!editingActivityId) return;
        
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            activities = activities.filter(a => a.id !== editingActivityId);
            saveActivities();
            closeModal();
            renderCalendar();
            renderActivitiesList();
        }
    }
    
    function saveActivities() {
        localStorage.setItem('activities', JSON.stringify(activities));
    }

    window.addEventListener('click', (e) => {
        if (e.target === activityModal) {
            closeModal();
        }
    });
});
