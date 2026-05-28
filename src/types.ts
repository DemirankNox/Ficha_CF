export interface StudentInfo {
  nombre: string;
  apellidos: string;
  curso: '1 ESO' | '2 ESO' | '3 ESO' | '4 ESO' | '1 BACH';
  letra: 'A' | 'B' | 'C' | 'D';
  email: string;
  genero: 'masculino' | 'femenino' | '';
}

export interface MetricOption {
  value: string;
  points: number;
  label: string;
}

export interface PhysicalTestDef {
  id: string;
  title: string;
  category: 'flexibilidad' | 'salto_vertical' | 'lanzamiento_balon' | 'flexiones' | 'abdominales' | 'cooper' | 'sentadillas' | 'velocidad' | 'salto_horizontal' | 'burpees';
  description: string;
  instructions: string;
  metricType: string;
  options: MetricOption[];
}

export type StudentScores = Record<string, number>; // Maps test defined categories/ids to points (0 to 10)
export type StudentValues = Record<string, string>; // Maps test elements to actual text/selection (e.g., "Los pies", "35 cm")

export const PHYSICAL_TESTS: PhysicalTestDef[] = [
  {
    id: 'flexibilidad',
    title: 'Test de Flexibilidad',
    category: 'flexibilidad',
    description: 'Flexión profunda del tronco intentando alcanzar el suelo con las manos.',
    instructions: 'Desde una posición de pie, flexiona el tronco hacia abajo manteniendo las rodillas estiradas y observa el rango de movimiento hasta detenerte sin rebotar.',
    metricType: 'Me toco...',
    options: [
      { value: 'menos_tobillos', points: 2, label: 'Menos de los tobillos' },
      { value: 'tobillos', points: 5, label: 'Me toco los tobillos' },
      { value: 'pies', points: 7, label: 'Me toco los pies' },
      { value: 'nudillos', points: 9, label: 'Toco el suelo con los nudillos' },
      { value: 'palmas', points: 10, label: 'Toco el suelo con las palmas' }
    ]
  },
  {
    id: 'salto_vertical',
    title: 'Test de Salto Vertical',
    category: 'salto_vertical',
    description: 'Medida de la fuerza explosiva del tren inferior (potencia de las piernas).',
    instructions: 'Estirado al lado de una pared, marca la altura máxima alcanzada con tu brazo extendido de pie. Salta tan alto como puedas y marca el punto álgido del salto. Mide la diferencia en centímetros.',
    metricType: 'He saltado...',
    options: [
      { value: 'menos_20cm', points: 2, label: 'Menos de 20 cm' },
      { value: '20cm', points: 5, label: '20 cm' },
      { value: '30cm', points: 6, label: '30 cm' },
      { value: '35cm', points: 7, label: '35 cm' },
      { value: '40cm', points: 8, label: '40 cm' },
      { value: '50cm', points: 9, label: '50 cm' },
      { value: '60cm', points: 10, label: '60 cm o más' }
    ]
  },
  {
    id: 'lanzamiento_balon',
    title: 'Test de Lanzamiento de Balón (2kg)',
    category: 'lanzamiento_balon',
    description: 'Medida de la fuerza del tren superior mediante el lanzamiento de un balón de 2 kg.',
    instructions: 'Espalda apoyada contra la pared y piernas separadas, toma el balón medicinal de 2 kg con ambas manos sobre el pecho. Lánzalo hacia delante con fuerza sin despegar el tronco de la pared.',
    metricType: 'Capaz de lanzar el balón a...',
    options: [
      { value: 'menos_3.5m', points: 2, label: 'Menos de 3.5 m' },
      { value: '3.5_3.8m', points: 5, label: '3.5 - 3.8 metros' },
      { value: '4_4.2m', points: 6, label: '4.0 - 4.2 metros' },
      { value: '4.5_4.7m', points: 7, label: '4.5 - 4.7 metros' },
      { value: '5_5.2m', points: 8, label: '5.0 - 5.2 metros' },
      { value: '5.5_5.7m', points: 9, label: '5.5 - 5.7 metros' },
      { value: '6_6.2m', points: 10, label: '6.0 - 6.2 metros (o más)' }
    ]
  },
  {
    id: 'flexiones',
    title: 'Test de Flexiones (30")',
    category: 'flexiones',
    description: 'Medida de la fuerza de los brazos y hombros mediante flexiones.',
    instructions: 'Mantén el cuerpo en línea recta desde los hombros hasta los tobillos, baja doblando los codos y vuelve a la posición inicial en 30 segundos.',
    metricType: 'En 30" soy capaz de hacer...',
    options: [
      { value: 'menos_12', points: 2, label: 'Menos de 12 flexiones' },
      { value: '12', points: 5, label: '12 flexiones' },
      { value: '15', points: 6, label: '15 flexiones' },
      { value: '18', points: 7, label: '18 flexiones' },
      { value: '20', points: 8, label: '20 flexiones' },
      { value: '22', points: 9, label: '22 flexiones' },
      { value: '25', points: 10, label: '25 flexiones o más' }
    ]
  },
  {
    id: 'abdominales',
    title: 'Test de Abdominales (30")',
    category: 'abdominales',
    description: 'Medida de la fuerza-resistencia de la musculatura abdominal.',
    instructions: 'Acostado sobre la espalda con rodillas dobladas a 90º y pies fijos. Eleva el tronco hasta tocar las rodillas con los codos y vuelve a bajar. Cuenta las repeticiones en 30 segundos.',
    metricType: 'En 30" soy capaz de hacer...',
    options: [
      { value: 'menos_20', points: 2, label: 'Menos de 20 abdominales' },
      { value: '20', points: 5, label: '20 abdominales' },
      { value: '25', points: 6, label: '25 abdominales' },
      { value: '30', points: 7, label: '30 abdominales' },
      { value: '35', points: 8, label: '35 abdominales' },
      { value: '40', points: 9, label: '40 abdominales' },
      { value: '45', points: 10, label: '45 abdominales o más' }
    ]
  },
  {
    id: 'cooper',
    title: 'Test de Cooper (12\')',
    category: 'cooper',
    description: 'Prueba de resistencia aeróbica midiendo la distancia máxima recorrida en 12 minutos.',
    instructions: 'Corre de manera continua durante 12 minutos a un ritmo constante. Toma nota de la distancia final recorrida en metros.',
    metricType: 'En 12 minutos he sido capaz de recorrer...',
    options: [
      { value: 'menos_1900', points: 2, label: 'Menos de 1900 metros' },
      { value: '1900_2100', points: 5, label: '1900 - 2100 metros' },
      { value: '2000_2200', points: 6, label: '2000 - 2200 metros' },
      { value: '2100_2300', points: 7, label: '2100 - 2300 metros' },
      { value: '2200_2400', points: 8, label: '2200 - 2400 metros' },
      { value: '2300_2500', points: 9, label: '2300 - 2500 metros' },
      { value: 'mas_2400', points: 10, label: 'Más de 2400 - 2600 metros' }
    ]
  },
  {
    id: 'sentadillas',
    title: 'Test de Sentadillas (1\')',
    category: 'sentadillas',
    description: 'Medida de la resistencia muscular en las piernas mediante sentadillas.',
    instructions: 'Pies separados a la anchura de los hombros. Realiza sentadillas completas bajando con la cadera por debajo de las rodillas y extendiendo por completo arriba. Cuenta las repeticiones en 1 minuto.',
    metricType: 'En 1\' soy capaz de hacer...',
    options: [
      { value: 'menos_20', points: 2, label: 'Menos de 20 sentadillas' },
      { value: '20', points: 5, label: '20 sentadillas' },
      { value: '25', points: 6, label: '25 sentadillas' },
      { value: '30', points: 7, label: '30 sentadillas' },
      { value: '35', points: 8, label: '35 sentadillas' },
      { value: '40', points: 9, label: '40 sentadillas' },
      { value: '45', points: 10, label: '45 sentadillas o más' }
    ]
  },
  {
    id: 'velocidad',
    title: 'Test de Velocidad (30m)',
    category: 'velocidad',
    description: 'Medida de la velocidad de desplazamiento recorriendo 30 metros.',
    instructions: 'Colócate detrás de la línea de salida. Corre los 30 metros previstos a la máxima velocidad posible tras recibir la señal. Registra el tiempo en segundos.',
    metricType: 'Capaz de correr 30 metros en...',
    options: [
      { value: 'mas_5.5', points: 2, label: 'Más de 5,5 segundos' },
      { value: '5.5', points: 5, label: '5,5 segundos' },
      { value: '5.2', points: 6, label: '5,2 segundos' },
      { value: '5.0', points: 7, label: '5,0 segundos' },
      { value: '4.8', points: 8, label: '4,8 segundos' },
      { value: '4.5', points: 9, label: '4,5 segundos' },
      { value: 'menos_4.5', points: 10, label: 'Menos de 4,5 segundos' }
    ]
  },
  {
    id: 'salto_horizontal',
    title: 'Test de Salto Horizontal',
    category: 'salto_horizontal',
    description: 'Medida de la fuerza explosiva de las piernas saltando con pies juntos desde parado.',
    instructions: 'Pies juntos detrás de la línea. Flexiona rodillas, balancea brazos y salta la mayor distancia posible hacia delante. Mide la distancia desde la línea hasta el talón de apoyo más cercano.',
    metricType: 'He saltado...',
    options: [
      { value: 'menos_130', points: 2, label: 'Menos de 130 cm' },
      { value: '130', points: 5, label: '130 cm' },
      { value: '145', points: 6, label: '145 cm' },
      { value: '160', points: 7, label: '160 cm' },
      { value: '175', points: 8, label: '175 cm' },
      { value: '190', points: 9, label: '190 cm' },
      { value: 'mas_205', points: 10, label: 'Más de 205 cm' }
    ]
  },
  {
    id: 'burpees',
    title: 'Test de Burpees (1\')',
    category: 'burpees',
    description: 'Resistencia cardiovascular y fuerza general combinada.',
    instructions: 'Comienza de pie, pasa a cuclillas, lanza piernas atrás para una plancha con flexión de pecho, vuelve a cuclillas y haz un salto vertical dando una palmada. Cuenta los burpees válidos en 1 minuto.',
    metricType: 'En 1\' soy capaz de hacer...',
    options: [
      { value: 'menos_8', points: 2, label: 'Menos de 8 burpees' },
      { value: '8', points: 5, label: '8 burpees' },
      { value: '10', points: 6, label: '10 burpees' },
      { value: '15', points: 7, label: '15 burpees' },
      { value: '20', points: 8, label: '20 burpees' },
      { value: '25', points: 9, label: '25 burpees' },
      { value: '30', points: 10, label: '30 burpees o más' }
    ]
  }
];
