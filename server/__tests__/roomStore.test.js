import { RoomStore } from '../src/roomStore.js';

test('RoomStore basic ops', () => {
  const s = new RoomStore(2);
  s.ensureRoom('alpha');
  expect(s.listRooms()[0].name).toBe('alpha');

  s.addUser('alpha', 'sock1', { name: 'A' });
  s.addUser('alpha', 'sock2', { name: 'B' });
  expect(s.getUsers('alpha').length).toBe(2);

  s.addMessage('alpha', { text: 'hi1' });
  s.addMessage('alpha', { text: 'hi2' });
  s.addMessage('alpha', { text: 'hi3' });
  const msgs = s.getMessages('alpha');
  expect(msgs.length).toBe(2);
  expect(msgs[0].text).toBe('hi2');

  s.removeUser('alpha', 'sock1');
  expect(s.getUsers('alpha').length).toBe(1);
});
