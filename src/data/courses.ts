export type TeeColor = 'blanco' | 'amarillo' | 'azul' | 'rojo' | 'negro' | 'naranja'
export type TeeGender = 'hombres' | 'mujeres' | 'mixto'

export interface CourseTee {
  color: TeeColor
  gender: TeeGender
  /** Course Rating */
  cr: number
  /** Slope Rating */
  slope: number
  par: number
}

export interface GolfCourse {
  id: string
  name: string
  location: string
  tees: CourseTee[]
}

// Seed data: real Spanish golf courses with published Course Rating / Slope Rating
// per tee, used to replicate the AfterGolf course database without a backend.
export const COURSES: GolfCourse[] = [
  {
    id: "la-canada-golf",
    name: "La Cañada Golf",
    location: "Guadiaro",
    tees: [
      { color: 'amarillo', gender: 'hombres', cr: 70.3, slope: 130, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-la-herreria",
    name: "Real Club de Golf La Herrería",
    location: "Madrid",
    tees: [
      { color: 'rojo', gender: 'mujeres', cr: 77.7, slope: 143, par: 71 },
      { color: 'blanco', gender: 'hombres', cr: 72, slope: 142, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 71.2, slope: 142, par: 71 },
    ],
  },
  {
    id: "el-encin-golf",
    name: "El Encin Golf",
    location: "Madrid",
    tees: [
      { color: 'amarillo', gender: 'hombres', cr: 71.7, slope: 131, par: 72 },
      { color: 'blanco', gender: 'hombres', cr: 75.1, slope: 137, par: 72 },
      { color: 'negro', gender: 'hombres', cr: 77.8, slope: 141, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-lomas-bosque",
    name: "Real Club de Golf Lomas-Bosque",
    location: "Madrid",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 73.5, slope: 143, par: 72 },
      { color: 'blanco', gender: 'hombres', cr: 72, slope: 143, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 69.2, slope: 133, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 68.1, slope: 129, par: 72 },
    ],
  },
  {
    id: "golf-santander",
    name: "Golf Santander",
    location: "Madrid",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 76.6, slope: 147, par: 72 },
      { color: 'blanco', gender: 'hombres', cr: 75.2, slope: 145, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.3, slope: 140, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 66, slope: 123, par: 72 },
      { color: 'azul', gender: 'mujeres', cr: 73.2, slope: 144, par: 72 },
    ],
  },
  {
    id: "real-sociedad-hipica-espanola-club-de-campo-sur",
    name: "Real Sociedad Hipica Española Club de Campo - Sur",
    location: "Madrid",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.7, slope: 140, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.8, slope: 139, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 76.3, slope: 149, par: 72 },
      { color: 'naranja', gender: 'mujeres', cr: 73.1, slope: 143, par: 72 },
    ],
  },
  {
    id: "real-sociedad-hipica-espanola-club-de-campo-norte",
    name: "Real Sociedad Hipica Española Club de Campo - Norte",
    location: "Madrid",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 74.9, slope: 145, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 72.7, slope: 142, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.6, slope: 137, par: 60 },
      { color: 'naranja', gender: 'mujeres', cr: 70.3, slope: 131, par: 72 },
    ],
  },
  {
    id: "real-novo-sancti-petri",
    name: "Real Novo Sancti Petri",
    location: "Chiclana de la Frontera, Cádiz",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 74, slope: 139, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.8, slope: 133, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73.3, slope: 135, par: 72 },
    ],
  },
  {
    id: "montecastillo-golf-resort",
    name: "Montecastillo Golf Resort",
    location: "Jerez de la Frontera, Cádiz",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.8, slope: 140, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.5, slope: 134, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73, slope: 136, par: 72 },
    ],
  },
  {
    id: "la-reserva-de-sotogrande",
    name: "La Reserva de Sotogrande",
    location: "Sotogrande, Cádiz",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 76, slope: 146, par: 72 },
      { color: 'blanco', gender: 'hombres', cr: 74, slope: 141, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.8, slope: 135, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73.3, slope: 137, par: 72 },
    ],
  },
  {
    id: "mijas-golf-los-lagos",
    name: "Mijas Golf - Los Lagos",
    location: "Fuengirola, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73, slope: 136, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 70.8, slope: 130, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 72.3, slope: 132, par: 71 },
    ],
  },
  {
    id: "san-roque-club-new",
    name: "San Roque Club - New",
    location: "San Roque, Cádiz",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.5, slope: 138, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.2, slope: 132, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.8, slope: 134, par: 72 },
    ],
  },
  {
    id: "mijas-golf-los-olivos",
    name: "Mijas Golf - Los Olivos",
    location: "Fuengirola, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.5, slope: 134, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.3, slope: 128, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 71.8, slope: 130, par: 72 },
    ],
  },
  {
    id: "villa-padierna-golf-club-flamingos",
    name: "Villa Padierna Golf Club - Flamingos",
    location: "Marbella, Málaga",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 74.5, slope: 141, par: 71 },
      { color: 'blanco', gender: 'hombres', cr: 72.5, slope: 136, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 70.3, slope: 130, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 71.8, slope: 132, par: 71 },
    ],
  },
  {
    id: "san-roque-club-old",
    name: "San Roque Club - Old",
    location: "San Roque, Cádiz",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 74.2, slope: 141, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 72, slope: 135, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73.5, slope: 137, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-el-prat",
    name: "Real Club de Golf El Prat",
    location: "Barcelona, Cataluña",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 75.2, slope: 142, par: 72 },
      { color: 'blanco', gender: 'hombres', cr: 73.1, slope: 137, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71, slope: 131, par: 72 },
      { color: 'azul', gender: 'mujeres', cr: 74.5, slope: 135, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 71.2, slope: 126, par: 72 },
    ],
  },
  {
    id: "pga-catalunya-resort-stadium",
    name: "PGA Catalunya Resort - Stadium",
    location: "Caldes de Malavella, Girona",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 75.6, slope: 145, par: 72 },
      { color: 'blanco', gender: 'hombres', cr: 73.2, slope: 140, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.8, slope: 134, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.1, slope: 132, par: 72 },
    ],
  },
  {
    id: "guadalmina-golf-club-sur",
    name: "Guadalmina Golf Club - Sur",
    location: "San Pedro de Alcántara, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.8, slope: 139, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.5, slope: 133, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73, slope: 135, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-de-tenerife",
    name: "Real Club de Golf de Tenerife",
    location: "El Peñón, Tacoronte",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 71, slope: 128, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 69.2, slope: 122, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 70.5, slope: 125, par: 71 },
    ],
  },
  {
    id: "real-club-valderrama",
    name: "Real Club Valderrama",
    location: "San Roque, Cádiz",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 76.1, slope: 147, par: 71 },
      { color: 'blanco', gender: 'hombres', cr: 74.3, slope: 143, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 72.1, slope: 138, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 73.5, slope: 140, par: 71 },
    ],
  },
  {
    id: "real-sociedad-de-golf-de-neguri",
    name: "Real Sociedad de Golf de Neguri",
    location: "Getxo, Vizcaya",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.2, slope: 136, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71, slope: 130, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.5, slope: 132, par: 72 },
    ],
  },
  {
    id: "la-cala-golf-resort-europa",
    name: "La Cala Golf Resort - Europa",
    location: "Mijas, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.8, slope: 135, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 70.5, slope: 129, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 72, slope: 131, par: 71 },
    ],
  },
  {
    id: "club-de-golf-la-moraleja-ii",
    name: "Club de Golf La Moraleja II",
    location: "Madrid",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.2, slope: 136, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71, slope: 130, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.5, slope: 132, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-de-las-palmas",
    name: "Real Club de Golf de Las Palmas",
    location: "Santa Brígida, Gran Canaria",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72, slope: 131, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 70, slope: 125, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 71.5, slope: 128, par: 71 },
    ],
  },
  {
    id: "golf-de-pals",
    name: "Golf de Pals",
    location: "Pals, Girona",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.5, slope: 137, par: 73 },
      { color: 'amarillo', gender: 'hombres', cr: 71.2, slope: 131, par: 73 },
      { color: 'rojo', gender: 'mujeres', cr: 72.8, slope: 133, par: 73 },
    ],
  },
  {
    id: "golf-son-servera",
    name: "Golf Son Servera",
    location: "Son Servera, Mallorca",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72, slope: 132, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70, slope: 126, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 71.5, slope: 128, par: 72 },
    ],
  },
  {
    id: "son-gual-golf",
    name: "Son Gual Golf",
    location: "Palma de Mallorca, Baleares",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 75, slope: 143, par: 72 },
      { color: 'blanco', gender: 'hombres', cr: 73, slope: 138, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.8, slope: 132, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.5, slope: 134, par: 72 },
    ],
  },
  {
    id: "la-manga-club-sur",
    name: "La Manga Club - Sur",
    location: "Cartagena, Murcia",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.5, slope: 137, par: 73 },
      { color: 'amarillo', gender: 'hombres', cr: 71.2, slope: 131, par: 73 },
      { color: 'rojo', gender: 'mujeres', cr: 72.8, slope: 133, par: 73 },
    ],
  },
  {
    id: "la-manga-club-oeste",
    name: "La Manga Club - Oeste",
    location: "Cartagena, Murcia",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 71.5, slope: 130, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 69.3, slope: 124, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 70.8, slope: 126, par: 71 },
    ],
  },
  {
    id: "real-club-pedrena",
    name: "Real Club Pedreña",
    location: "Pedreña, Cantabria",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.8, slope: 133, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.6, slope: 127, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.1, slope: 129, par: 72 },
    ],
  },
  {
    id: "club-de-golf-finca-cortesin",
    name: "Club de Golf Finca Cortesín",
    location: "Casares, Málaga",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 75.8, slope: 144, par: 72 },
      { color: 'blanco', gender: 'hombres', cr: 73.5, slope: 139, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.2, slope: 133, par: 72 },
      { color: 'azul', gender: 'mujeres', cr: 73.8, slope: 136, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 70.5, slope: 128, par: 72 },
    ],
  },
  {
    id: "emporda-golf-resort-links",
    name: "Empordà Golf Resort - Links",
    location: "Gualta, Girona",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.8, slope: 140, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.5, slope: 134, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73, slope: 136, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-guadalmina-norte",
    name: "Real Club de Golf Guadalmina - Norte",
    location: "San Pedro de Alcántara, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72, slope: 131, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70, slope: 125, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 71.5, slope: 127, par: 72 },
    ],
  },
  {
    id: "aloha-golf-club",
    name: "Aloha Golf Club",
    location: "Marbella, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.5, slope: 138, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.2, slope: 132, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.8, slope: 134, par: 72 },
    ],
  },
  {
    id: "real-club-de-la-puerta-de-hierro-abajo",
    name: "Real Club de la Puerta de Hierro - Abajo",
    location: "Madrid",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72, slope: 132, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 70.2, slope: 127, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 71.5, slope: 129, par: 71 },
    ],
  },
  {
    id: "real-aero-club-de-santiago",
    name: "Real Aero Club de Santiago",
    location: "Santiago de Compostela, A Coruña",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 71.5, slope: 130, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 69.5, slope: 124, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 71, slope: 127, par: 71 },
    ],
  },
  {
    id: "la-cala-golf-resort-america",
    name: "La Cala Golf Resort - América",
    location: "Mijas, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.2, slope: 137, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71, slope: 131, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.5, slope: 133, par: 72 },
    ],
  },
  {
    id: "club-de-campo-villa-de-madrid",
    name: "Club de Campo Villa de Madrid",
    location: "Madrid",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 74, slope: 139, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.8, slope: 133, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73.5, slope: 135, par: 72 },
    ],
  },
  {
    id: "club-de-golf-escorpion",
    name: "Club de Golf Escorpión",
    location: "Bétera, Valencia",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73, slope: 136, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.8, slope: 130, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.3, slope: 132, par: 72 },
    ],
  },
  {
    id: "club-de-golf-alcanada",
    name: "Club de Golf Alcanada",
    location: "Puerto de Alcudia, Mallorca",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.8, slope: 139, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.5, slope: 133, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73, slope: 135, par: 72 },
    ],
  },
  {
    id: "costa-adeje-golf",
    name: "Costa Adeje Golf",
    location: "Adeje, Tenerife",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.8, slope: 138, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.5, slope: 132, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73, slope: 134, par: 72 },
    ],
  },
  {
    id: "el-bosque-golf",
    name: "El Bosque Golf",
    location: "Chiva, Valencia",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.5, slope: 134, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.3, slope: 128, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 71.8, slope: 130, par: 72 },
    ],
  },
  {
    id: "real-club-de-la-puerta-de-hierro-arriba",
    name: "Real Club de la Puerta de Hierro - Arriba",
    location: "Madrid",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.5, slope: 138, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.3, slope: 132, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73, slope: 134, par: 72 },
    ],
  },
  {
    id: "la-manga-club-norte",
    name: "La Manga Club - Norte",
    location: "Cartagena, Murcia",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.8, slope: 133, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.5, slope: 127, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72, slope: 129, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-de-san-sebastian",
    name: "Real Club de Golf de San Sebastián",
    location: "Hondarribia, Guipúzcoa",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.5, slope: 134, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.3, slope: 128, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 71.8, slope: 130, par: 72 },
    ],
  },
  {
    id: "club-de-golf-costa-brava",
    name: "Club de Golf Costa Brava",
    location: "Santa Cristina d'Aro, Girona",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.2, slope: 133, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 70, slope: 127, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 71.5, slope: 129, par: 71 },
    ],
  },
  {
    id: "marbella-golf-country-club",
    name: "Marbella Golf Country Club",
    location: "Marbella, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.2, slope: 133, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70, slope: 127, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 71.5, slope: 129, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-el-saler",
    name: "Real Club de Golf El Saler",
    location: "Valencia",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 75.5, slope: 144, par: 72 },
      { color: 'blanco', gender: 'hombres', cr: 73.2, slope: 139, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71, slope: 133, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.8, slope: 135, par: 72 },
    ],
  },
  {
    id: "los-naranjos-golf-club",
    name: "Los Naranjos Golf Club",
    location: "Marbella, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73, slope: 136, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.8, slope: 130, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.3, slope: 132, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-sotogrande",
    name: "Real Club de Golf Sotogrande",
    location: "San Roque, Cádiz",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 74.5, slope: 140, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 72.3, slope: 135, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 73, slope: 133, par: 72 },
    ],
  },
  {
    id: "real-club-de-golf-de-sevilla",
    name: "Real Club de Golf de Sevilla",
    location: "Sevilla, Andalucía",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73, slope: 135, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.2, slope: 130, par: 72 },
      { color: 'azul', gender: 'mujeres', cr: 73.2, slope: 131, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 70.8, slope: 125, par: 72 },
    ],
  },
  {
    id: "club-de-golf-la-moraleja-i",
    name: "Club de Golf La Moraleja I",
    location: "Madrid",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.8, slope: 134, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 70.5, slope: 128, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.2, slope: 130, par: 72 },
    ],
  },
  {
    id: "las-colinas-golf-country-club",
    name: "Las Colinas Golf & Country Club",
    location: "San Miguel de Salinas, Alicante",
    tees: [
      { color: 'negro', gender: 'hombres', cr: 74.8, slope: 141, par: 71 },
      { color: 'blanco', gender: 'hombres', cr: 72.5, slope: 136, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 70.3, slope: 130, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 71.8, slope: 128, par: 71 },
    ],
  },
  {
    id: "la-quinta-golf-country-club",
    name: "La Quinta Golf & Country Club",
    location: "Marbella, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 72.5, slope: 135, par: 71 },
      { color: 'amarillo', gender: 'hombres', cr: 70.3, slope: 129, par: 71 },
      { color: 'rojo', gender: 'mujeres', cr: 71.8, slope: 131, par: 71 },
    ],
  },
  {
    id: "la-cala-golf-resort-asia",
    name: "La Cala Golf Resort - Asia",
    location: "Mijas, Málaga",
    tees: [
      { color: 'blanco', gender: 'hombres', cr: 73.5, slope: 138, par: 72 },
      { color: 'amarillo', gender: 'hombres', cr: 71.2, slope: 132, par: 72 },
      { color: 'rojo', gender: 'mujeres', cr: 72.8, slope: 134, par: 72 },
    ],
  },
]
