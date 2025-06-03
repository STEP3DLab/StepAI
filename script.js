document.getElementById('reg-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const form = event.target;
  const data = {
    name: form.name.value,
    contact: form.contact.value
  };

  const button = form.querySelector('button');
  button.disabled = true;
  button.textContent = 'Отправка...';

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbxwu5NEwPaILD6zswSwu1JzubAeE_VtP1IEWZ3wbdGGnoC9RApu2gAbZIvz_mnTrYwY/exec', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    document.getElementById('status-message').innerHTML = '? ' + (result.message || 'Вы успешно записались!');
    form.reset();
  } catch (error) {
    document.getElementById('status-message').innerHTML = '? Произошла ошибка. Попробуйте позже.';
  } finally {
    button.disabled = false;
    button.textContent = 'Записаться';
    document.getElementById('status-message').scrollIntoView({ behavior: 'smooth' });
  }
});

// Простой показ всех fade-in-up при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.fade-in-up');
  elements.forEach(el => el.classList.add('visible'));
});