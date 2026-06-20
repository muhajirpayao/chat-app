export const currentUser = {
  id: 'me',
  name: 'You',
  avatarUrl: 'https://i.pravatar.cc/150?img=12',
};

const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000);
const hoursAgo = (n) => new Date(Date.now() - n * 60 * 60 * 1000);
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export const initialConversations = [
  {
    id: 'c1',
    participant: { id: 'u1', name: 'Maya Chen', avatarUrl: 'https://i.pravatar.cc/150?img=47', status: 'online' },
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey! Did you get a chance to look at the designs?', createdAt: hoursAgo(3), seen: true },
      { id: 'm2', senderId: 'me', text: 'Yes, loving the new sidebar direction.', createdAt: hoursAgo(3), seen: true },
      { id: 'm3', senderId: 'u1', text: 'The gradient on the sent bubbles is doing a lot of work 👀', createdAt: minutesAgo(40), seen: true },
      { id: 'm4', senderId: 'me', text: 'Right? Wanted it to feel alive without being loud.', createdAt: minutesAgo(38), seen: true },
    ],
  },
  {
    id: 'c2',
    participant: { id: 'u2', name: 'Diego Alvarez', avatarUrl: 'https://i.pravatar.cc/150?img=14', status: 'away' },
    unreadCount: 2,
    messages: [
      { id: 'm5', senderId: 'u2', text: 'Standup moved to 10am tomorrow.', createdAt: hoursAgo(20), seen: true },
      { id: 'm6', senderId: 'u2', text: 'Also, can you review my PR before then?', createdAt: minutesAgo(12), seen: false },
      { id: 'm7', senderId: 'u2', text: "No rush if you're slammed though!", createdAt: minutesAgo(11), seen: false },
    ],
  },
  {
    id: 'c3',
    participant: { id: 'u3', name: 'Priya Nair', avatarUrl: 'https://i.pravatar.cc/150?img=32', status: 'offline' },
    unreadCount: 0,
    messages: [
      { id: 'm8', senderId: 'me', text: 'Thanks again for the intro to the design team!', createdAt: daysAgo(2), seen: true },
      { id: 'm9', senderId: 'u3', text: 'Of course, anytime 🙂', createdAt: daysAgo(2), seen: true },
    ],
  },
  {
    id: 'c4',
    participant: { id: 'u4', name: 'Sam Okafor', avatarUrl: 'https://i.pravatar.cc/150?img=8', status: 'online' },
    unreadCount: 0,
    messages: [
      { id: 'm10', senderId: 'u4', text: 'Lunch tomorrow?', createdAt: daysAgo(5), seen: true },
      { id: 'm11', senderId: 'me', text: 'Count me in.', createdAt: daysAgo(5), seen: true },
    ],
  },
];