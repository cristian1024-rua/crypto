class ApiService {
  constructor() { this.token = null; }

  setToken(t) { this.token = t; }

  // LOGIN FAKE: siempre devuelve token válido
  async login(email, password) {
    console.log('Payload enviado (fake):', { email, password });
    // Simula delay de red
    await new Promise(r => setTimeout(r, 300));
    return { token: 'fake-jwt-' + Math.random().toString(36).slice(2) };
  }

  // GET fake: siempre devuelve datos de prueba
  async get(url) {
    await new Promise(r => setTimeout(r, 200));
    if (url.includes('reqres.in/api/users/5')) {
      return { data: { id: 5, email: 'fake@reqres.in' } };
    }
    if (url.includes('jsonplaceholder.typicode.com/users/5/posts')) {
      return [{ title: 'bitcoin' }, { title: 'ethereum' }];
    }
    throw new Error('Ruta no mockeada');
  }
}

export default new ApiService();