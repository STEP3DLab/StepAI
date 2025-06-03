document.getElementById('reg-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const form = event.target;

  const name = encodeURIComponent(form.name.value.trim());
  const contact = encodeURIComponent(form.contact.value.trim());

  const scriptURL = 'https://script.google.com/macros/s/AKfycbxpsZGc0PWP7MbSCVvqakKrRwtdLwuCDpP0yC_LhsHiCHc0IJUHtvYmckZObVQIh9AE/exec';
  const requestURL = `${scriptURL}?name=${name}&contact=${contact}`;

  try {
    const response = await fetch(requestURL, { method: 'GET' });
    const result = await response.json();

    if (result.status === 'success') {
      document.getElementById('status-message').textContent = result.message;
      form.name.value = '';
      form.contact.value = '';
    } else {
      document.getElementById('status-message').textContent = 'Ошибка: ' + result.message;
    }
  } catch (error) {
    document.getElementById('status-message').textContent = 'Ошибка соединения: ' + error.message;
    console.error(error);
  }
});
