
document.getElementById('reg-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const form = event.target;
  const data = {
    name: form.name.value,
    contact: form.contact.value
  };
  const response = await fetch('https://script.google.com/macros/s/AKfycbxpsZGc0PWP7MbSCVvqakKrRwtdLwuCDpP0yC_LhsHiCHc0IJUHtvYmckZObVQIh9AE/exec', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  const result = await response.json();
  document.getElementById('status-message').textContent = result.message || 'Готово!';
});

// Простой показ всех fade-in-up при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.fade-in-up');
  elements.forEach(el => el.classList.add('visible'));
});
