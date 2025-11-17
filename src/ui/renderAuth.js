export default function renderAuth(onLogin) {
  const t = document.getElementById('auth-template').content.cloneNode(true);
  const form = t.querySelector('form');
  const emailInput = t.querySelector('#email');
  const passInput = t.querySelector('#password');

  form.addEventListener('submit', e => {
    e.preventDefault();
    onLogin(emailInput.value, passInput.value);
  });
  return t;
}