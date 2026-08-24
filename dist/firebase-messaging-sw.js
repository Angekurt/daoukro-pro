importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBNsqpE2QPgVzIV_5SjT-70w9aCDYUMMNk",
  authDomain: "daoukro-digital.firebaseapp.com",
  projectId: "daoukro-digital",
  storageBucket: "daoukro-digital.firebasestorage.app",
  messagingSenderId: "1078580649233",
  appId: "1:1078580649233:web:daoukro-digital"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = (payload.notification && payload.notification.title) || (payload.data && payload.data.titre) || 'Daoukro Pro';
  const notificationOptions = {
    body: (payload.notification && payload.notification.body) || (payload.data && payload.data.corps) || '',
    icon: '/icon.png',
    badge: '/icon.png',
    data: payload.data || {}
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
