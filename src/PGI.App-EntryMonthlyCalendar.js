window.onload = async () => {
  const colorMapping = {
    1: '#7DCEA0',
    2: 'linear-gradient(to top, #7DCEA0 50%, rgba(255, 255, 255, 0) 50%)',
    3: 'linear-gradient(45deg, rgba(255, 255, 255, 0) 50%, #7DCEA0 50%)',
    X: '#EC7063',
    L: '#EC7063',
    A: '#85C1E9',
  };

  const currentMonthElement = document.getElementById('currentMonth');
  const currentMonthInput = document.getElementById('currentMonthNum');
  const currentYearElement = document.getElementById('currentYear');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const eventsContainer = document.querySelector('.events');
  let currentDate = new Date();
  let currentMonthPlan = []; // Initialize currentMonthPlan as an empty array

  async function updateCalendar() {
    eventsContainer.innerHTML = '';

    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentMonthNumber = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    currentMonthElement.textContent = currentMonthName;
    currentYearElement.textContent = currentYear;

    if (currentMonthInput) {
      currentMonthInput.value = currentMonthNumber;
    }

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    let offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    let day = 1;
    let currentWeek = 0;

    while (day <= daysInMonth) {
      const weekElement = document.createElement('div');
      weekElement.classList.add('week-row');

      for (let i = 0; i < 7; i++) {
        if (currentWeek === 0 && offset > 0) {
          const emptyDayElement = document.createElement('div');
          emptyDayElement.classList.add('w-layout-vflex', 'moth-plan_day-wrap', 'empty-day');
          emptyDayElement.innerHTML = '&nbsp;';
          weekElement.appendChild(emptyDayElement);
          offset--;
        } else if (day <= daysInMonth) {
          const dayOfWeek = daysOfWeek[i];
          const dayElement = document.createElement('div');
          dayElement.classList.add('w-layout-vflex', 'moth-plan_day-wrap');

          const labelElement = document.createElement('label');
          labelElement.textContent = `${dayOfWeek} ${day}`;
          labelElement.classList.add('field-label');

          const selectElement = document.createElement('select');
          const selectId = `month-plan_day-${day}`;
          const dayAttribute = `monthPlan_dayStatus_${day}`;
          selectElement.id = selectId;
          selectElement.name = `${day}`;
          selectElement.setAttribute('data-name', `${day}`);
          selectElement.setAttribute('wized', dayAttribute);
          selectElement.required = true;
          selectElement.classList.add('input-select', 'is-mothly-plan', 'w-select');

          for (const option of [
            { value: '0', label: '' },
            { value: '1', label: 'Working' },
            { value: '2', label: 'Morning' },
            { value: '3', label: 'Afternoon' },
            { value: 'X', label: 'Not Working' },
            { value: 'L', label: 'Lead' },
            { value: 'A', label: 'On Call' },
          ]) {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            selectElement.appendChild(optionElement);
          }

          const selectStylingElement = document.createElement('div');
          selectStylingElement.classList.add('select-styling');

          dayElement.appendChild(labelElement);
          dayElement.appendChild(selectElement);
          dayElement.appendChild(selectStylingElement);

          weekElement.appendChild(dayElement);
          day++;
        }
      }

      eventsContainer.appendChild(weekElement);
      currentWeek++;
    }
  }

  function handleSelectChange(select, selectStyling, dayNumber) {
    const selectedOption = select.value;
    selectStyling.textContent = select.options[select.selectedIndex].text;
    selectStyling.style.background = colorMapping[selectedOption] || '';

    // Update the currentMonthPlan array with the selected option value for the day
    currentMonthPlan[dayNumber - 1] = selectedOption; // Arrays are zero-indexed

    // Output the update for verification
    console.log(`Updated currentMonthPlan[${dayNumber}] with value ${selectedOption}`);
  }

  function attachSelectListeners() {
    const selectElements = document.querySelectorAll('[id^="month-plan_day-"]');
    const selectStylings = document.querySelectorAll('.select-styling');

    selectElements.forEach((select, index) => {
      const dayNumber = select.getAttribute('data-name');

      select.addEventListener('change', () => {
        handleSelectChange(select, selectStylings[index], dayNumber);
      });

      const wizedAttribute = select.getAttribute('wized');
      select.setAttribute('wized', wizedAttribute);
    });
  }

  async function updateMonth(change) {
    currentDate.setMonth(currentDate.getMonth() + change);

    const currentMonthNumber = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    await Wized.data.setVariable('currentMonth', currentMonthNumber);
    await Wized.data.setVariable('currentYear', currentYear);

    updateCalendar();
    attachSelectListeners();

    // Update the currentMonthPlan array based on the newly updated calendar
    currentMonthPlan = Array.from({ length: daysInMonth }, () => '0');

    console.log('Updated currentMonthPlan for the new month');
  }

  prevBtn.addEventListener('click', () => {
    updateMonth(-1);
  });

  nextBtn.addEventListener('click', () => {
    updateMonth(1);
  });

  updateCalendar();
  attachSelectListeners();

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const initialCurrentMonthPlan = Array.from({ length: daysInMonth }, () => '0');

  try {
    await Wized.data.setVariable('currentMonthPlan', JSON.stringify(initialCurrentMonthPlan));
  } catch (error) {
    console.error('Error initializing currentMonthPlan:', error.message);
  }

  const currentMonthNumber = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  try {
    await Wized.data.setVariable('currentMonth', currentMonthNumber);
    await Wized.data.setVariable('currentYear', currentYear);
  } catch (error) {
    console.error('Error updating currentMonth and currentYear:', error.message);
  }
};
