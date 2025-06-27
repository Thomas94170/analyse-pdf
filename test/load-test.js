// @ts-nocheck
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 1000, // nombre d'utilisateurs virtuels simultanés
  duration: '30s', // durée du test
};

const BASE_URL = 'http://localhost:8000'; // change si déployé ailleurs
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MDkyYWQ5ZC04NTM3LTQyNDItYWFiOS01M2VmMzc1NzJlOGUiLCJpYXQiOjE3NTA4NDQwMjEsImV4cCI6MTc1MDg3MjgyMX0.NMkIsd_WEJl-Dd4wGkKCIZupOgO-uTsGKHIXXcMYCUA'; // 🔒 remplace par ton vrai JWT

export default function () {
  const res = http.get(`${BASE_URL}/documents`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  if (res.status !== 200) {
    console.error(`Erreur: ${res.status} - ${res.body}`);
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
    'body is not empty': (r) => r.body && r.body.length > 0,
  });

  sleep(1); // simulate user "think time"
}
