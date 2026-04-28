export const PROVINCES = [
  'Luanda','Huambo','Benguela','Lubango','Malanje','Cabinda',
  'Namibe','Uíge','Kuito','Saurimo','Dundo','Menongue','N\'dalatando'
];

export const BOTIJA_TYPES = [
  { id: 'azul-g', label: 'Azul Grande', color: '#2563EB', size: 'grande', variant: 'azul' },
  { id: 'azul-m', label: 'Azul Média',  color: '#3B82F6', size: 'media',  variant: 'azul' },
  { id: 'azul-p', label: 'Azul Pequena', color: '#60A5FA', size: 'pequena', variant: 'azul' },
  { id: 'lar-g',  label: 'Laranja Grande', color: '#FF5E00', size: 'grande', variant: 'laranja' },
  { id: 'lar-m',  label: 'Laranja Média',  color: '#FF8C3A', size: 'media',  variant: 'laranja' },
  { id: 'lar-p',  label: 'Laranja Pequena', color: '#FFB570', size: 'pequena', variant: 'laranja' },
  { id: 'levita', label: 'LEVITA', color: '#7C3AED', size: 'especial', variant: 'levita' },
];

export const MOCK_VENDORS = [
  {
    id: 1, name: 'Gasóleo Talatona', province: 'Luanda',
    address: 'Rua da Samba, Talatona', tel: '+244 912 345 678',
    lat: -8.917, lng: 13.231,
    status: 'disponivel', rating: 4.8, reviews: 124,
    stock: { 'azul-g': 12, 'azul-m': 8, 'lar-g': 5, 'levita': 3 },
    prices: { 'azul-g': 8500, 'azul-m': 5500, 'lar-g': 8200, 'levita': 11000 },
    avatar: '⛽', hours: '07:00 - 20:00',
  },
  {
    id: 2, name: 'Posto Central GLP', province: 'Luanda',
    address: 'Av. 21 de Janeiro, Ingombota', tel: '+244 923 456 789',
    lat: -8.839, lng: 13.234,
    status: 'disponivel', rating: 4.5, reviews: 89,
    stock: { 'azul-m': 20, 'azul-p': 15, 'lar-m': 10 },
    prices: { 'azul-m': 5300, 'azul-p': 3200, 'lar-m': 5000 },
    avatar: '🏪', hours: '06:00 - 22:00',
  },
  {
    id: 3, name: 'Gás Vivo Kikuxi', province: 'Luanda',
    address: 'Bairro Kikuxi, Viana', tel: '+244 934 567 890',
    lat: -8.976, lng: 13.372,
    status: 'esgotado', rating: 4.2, reviews: 56,
    stock: {},
    prices: { 'azul-g': 8000, 'lar-g': 7800 },
    avatar: '🛢️', hours: '08:00 - 18:00',
  },
  {
    id: 4, name: 'Distribuidora Bengas', province: 'Luanda',
    address: 'Rua Ndunduma, Sambizanga', tel: '+244 945 678 901',
    lat: -8.807, lng: 13.254,
    status: 'disponivel', rating: 4.6, reviews: 201,
    stock: { 'azul-g': 30, 'azul-m': 25, 'azul-p': 40, 'lar-g': 18, 'lar-m': 22, 'lar-p': 35, 'levita': 8 },
    prices: { 'azul-g': 8300, 'azul-m': 5400, 'azul-p': 3100, 'lar-g': 8100, 'lar-m': 5200, 'lar-p': 3000, 'levita': 10500 },
    avatar: '🔥', hours: '24 horas',
  },
  {
    id: 5, name: 'Gás Huambo Center', province: 'Huambo',
    address: 'Rua Comandante Valódia, Huambo', tel: '+244 956 789 012',
    lat: -12.776, lng: 15.739,
    status: 'disponivel', rating: 4.3, reviews: 67,
    stock: { 'azul-g': 8, 'azul-m': 14, 'lar-m': 9 },
    prices: { 'azul-g': 8100, 'azul-m': 5200, 'lar-m': 4900 },
    avatar: '⛽', hours: '07:00 - 19:00',
  },
  {
    id: 6, name: 'GLP Benguela', province: 'Benguela',
    address: 'Av. Norton de Matos, Benguela', tel: '+244 967 890 123',
    lat: -12.578, lng: 13.407,
    status: 'disponivel', rating: 4.7, reviews: 143,
    stock: { 'azul-g': 15, 'lar-g': 12, 'levita': 5 },
    prices: { 'azul-g': 8400, 'lar-g': 8200, 'levita': 10800 },
    avatar: '🏪', hours: '08:00 - 20:00',
  },
];
