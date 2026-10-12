/**
 * Catalogo editable GCP Portal — datos de demostracion.
 * Titulos / URL de fotografias: portafolio publico GCPEASA.
 * Ubicaciones y anos: ILUSTRATIVOS (no representan datos contractuales).
 * Para usar video, cambiar media.type a 'video', y completar media.src/poster.
 * El fallback se extrae de la maqueta visual aportada por el usuario y NO es foto oficial.
 */
const photo = (name) => `https://static.wixstatic.com/media/${name}`;
const preview = (n) => `./assets/preview/catalogo-referencia-${String(n).padStart(2,'0')}.webp`;

export const projects = [
  {id:'sumitomo',name:'Sumitomo',section:'industrial',category:'INDUSTRIAL',location:'Silao, Gto.',year:2022,
    media:{type:'image',src:photo('2fda0f_54820d43f5a0458a90a07e787a86bf84~mv2.jpeg'),fallback:preview(6),position:'center center'}},
  {id:'donaldson',name:'Donaldson',section:'industrial',category:'INDUSTRIAL',location:'Aguascalientes, Ags.',year:2019,
    media:{type:'image',src:photo('2fda0f_a50b800912854816b74e7b3a35405c2f~mv2.jpeg'),fallback:preview(7),position:'center center'}},
  {id:'santa-fe',name:'Santa Fe TechnoPark',section:'industrial',category:'CORPORATIVO',location:'Jesús María, Ags.',year:2023,
    media:{type:'image',src:photo('2fda0f_fbdc1084598d4f68abf076f1220b9af7~mv2.jpeg'),fallback:preview(5),position:'center center'}},
  {id:'puente-bicentenario',name:'Puente Bicentenario',section:'industrial',category:'INFRAESTRUCTURA',location:'Aguascalientes, Ags.',year:2016,
    media:{type:'image',src:photo('2fda0f_9251a026a2154eafaff30d2670484f16~mv2.jpeg'),fallback:preview(2),position:'center center'}},
  {id:'setex',name:'Setex Automotive',section:'industrial',category:'INDUSTRIAL',location:'San Francisco de los Romo, Ags.',year:2020,
    media:{type:'image',src:photo('2fda0f_1d9d8f4f963941f7b728f0487f2112d4~mv2.jpeg'),fallback:preview(1),position:'center center'}},
  {id:'advanced',name:'Advanced Composites',section:'industrial',category:'INDUSTRIAL',location:'Lagos de Moreno, Jal.',year:2018,
    media:{type:'image',src:photo('2fda0f_abd10759b05a4e9496f321da13dec121~mv2.jpeg'),fallback:preview(3),position:'center center'}},
  {id:'viscofan',name:'Viscofan',section:'industrial',category:'INDUSTRIAL',location:'Aguascalientes, Ags.',year:2024,
    media:{type:'image',src:photo('2fda0f_a89d377acf4b45edb1b36aaedcc78c35~mv2.jpeg'),fallback:preview(4),position:'center center'}},
  {id:'gestamp',name:'Gestamp Puebla',section:'industrial',category:'INDUSTRIAL',location:'Puebla, Pue.',year:2017,
    media:{type:'image',src:photo('2fda0f_8f3f644d76d04d0cb5eb8c09feae495d~mv2.jpeg'),fallback:preview(8),position:'center center'}},
  {id:'ntn',name:'NTN Manufacturing',section:'industrial',category:'INDUSTRIAL',location:'Rincón de Romos, Ags.',year:2021,
    media:{type:'image',src:photo('2fda0f_60a17988796c436ab23c5dd5883ce281~mv2.jpg'),fallback:preview(6),position:'center center'}},

  {id:'tramonto',name:'Tramonto Suites & Lofts',section:'habitat',category:'HÁBITAT',location:'Jesús María, Ags.',year:2022,
    media:{type:'image',src:photo('2fda0f_245611dac24f421b909c2389d3815750~mv2.jpeg'),fallback:preview(8),position:'center center'}},
  {id:'san-telmo-sky',name:'San Telmo Sky Residence',section:'habitat',category:'HÁBITAT',location:'Aguascalientes, Ags.',year:2024,
    media:{type:'image',src:photo('2fda0f_47f29732657e4c9ea73e316c960d6661~mv2.jpeg'),fallback:preview(5),position:'center center'}},
  {id:'business-towers',name:'San Telmo Business Towers',section:'habitat',category:'CORPORATIVO',location:'Aguascalientes, Ags.',year:2018,
    media:{type:'image',src:photo('2fda0f_98ae55b0f52e4134a78d3bdc74927270~mv2.jpeg'),fallback:preview(5),position:'center center'}}
];

export const getProjects=(section)=>projects.filter(p=>p.section===section);
