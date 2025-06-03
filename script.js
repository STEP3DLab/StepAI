document.getElementById('reg-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const form = event.target;

  // Читаем и кодируем значения полей
  const nameValue = encodeURIComponent(form.name.value.trim());
  const contactValue = encodeURIComponent(form.contact.value.trim());

  // Вот сюда вставляем ваш Web App URL:
  const BASE_URL = 'https://script.google.com/macros/s/AKfycbyw7-aGgJ4Sj1tKBEWBqtEFLPs2BCRK04Xm2GTkFgVUAPK4lFs_ARucFwiK4iRFZTyj/exec';

  // Составляем URL с GET-параметрами
  const requestUrl = `${BASE_URL}?name=${nameValue}&contact=${contactValue}`;

  try {
    // Делаем простой GET (будет без preflight, т. е. без CORS-ошибок)
    const response = await fetch(requestUrl, {
      method: 'GET'
    });

    const result = await response.json();
    if (result.status === 'success') {
      document.getElementById('status-message').textContent = result.message;
      form.name.value = '';
      form.contact.value = '';
    } else {
      document.getElementById('status-message').textContent = 'Ошибка: ' + result.message;
    }
  } catch (err) {
    document.getElementById('status-message').textContent = 'Ошибка при отправке: ' + err.message;
    console.error(err);
  }
});

// Анимации fade-in-up (если нужны)
document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in-up');
  fadeElements.forEach(el => el.classList.add('visible'));
});
