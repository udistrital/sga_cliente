export const students = [
    { name: 'Pedro1', code: 99991, lastname: 'Sánchez1' },
    { name: 'Pedro2', code: 99992, lastname: 'Sánchez2' },
    { name: 'Pedro3', code: 99993, lastname: 'Sánchez3' },
    { name: 'Pedro4', code: 99994, lastname: 'Sánchez4' },
    { name: 'Pedro5', code: 99995, lastname: 'Sánchez5' },
    { name: 'Pedro6', code: 99996, lastname: 'Sánchez6' },
    { name: 'Pedro7', code: 99997, lastname: 'Sánchez7' },
]
export const settings1 = {
    name: 'Corte 1',
    percentage: 35,
    type: 'percentage',
    fields: [
        { placeholder: '% P1', label: 'P1', name: 'p1' },
        { placeholder: '% P2', label: 'P2', name: 'p2' },
        { placeholder: '% P3', label: 'P3', name: 'p3' },
    ]
}

export const notes1 = {
    importantValue: null,
    fields: settings1.fields,
    type: 'notes',
}


export const settings2 = {
    name: 'Corte 2',
    type: 'percentage',
    percentage: 35,
    fields: [
        { placeholder: '% P4', label: 'P4', name: 'p4' },
        { placeholder: '% P5', label: 'P5', name: 'p5' },
        { placeholder: '% P6', label: 'P6', name: 'p6' },
        { placeholder: '% LAB', label: 'LAB', name: 'lab', value: 20 },
    ]
}

export const notes2 = {
    importantValue: null,
    fields: settings2.fields,
    type: 'notes',
}

export const settings3 = {
    name: 'Examen final',
    type: 'percentage',
    percentage: 30,
    fields: [
        { placeholder: '% Exam', label: 'EXAM', name: 'ex', value: 30 },
    ]
}

export const notes3 = {
    importantValue: null,
    fields: settings3.fields.map((f)=>({...f, ...{value: 0}})),
    type: 'notes',
}

export const settings4 = {
    name: 'Habilitación',
    type: 'percentage',
    percentage: 70,
    fields: [
        { placeholder: '% Hab', label: 'HAB', name: 'hab', value: 70 },
    ]
}

export const notes4 = {
    importantValue: null,
    fields: settings4.fields.map((f)=>({...f, ...{value: 0}})),
    type: 'notes',
}

export const notes5 = {
    importantValue: null,
    fields:  [
        { placeholder: '% Hab', label: 'HAB', name: 'hab', value: 70 },
    ],
    type: 'notes',
}

export const data1 = [
    {
        Codigo: "",
        Nombre: "",
        Apellido: "",
        Corte1: { forTitle: true, needEdit: false, canEdit: false, values: [
          {N: "P1", Value: 0, Perc: 10},
          {N: "P2", Value: 0, Perc: 10},
          {N: "P3", Value: 0, Perc: 10}
        ]},
        Corte2: { forTitle: true, needEdit: false, canEdit: false, values: [
          {N: "P4", Value: 0, Perc: 10},
          {N: "P5", Value: 0, Perc: 10},
          {N: "P6", Value: 0, Perc: 10}
        ]},
        LabExamHabAcu: { forTitle: true, needEdit: false, canEdit: false, values: [
          {N: "Lab", Value: 0, Perc: 10},
          {N: "Exam", Value: 0, Perc: 30},
          {N: "Hab", Value: 0, Perc: 70},
          {N: "ACU", Value: 0}
        ]},
        Varios: { forTitle: true, needEdit: false, canEdit: false, values: [
          {N: "Fallas", Value: 0},
          {N: "OBS", Value: 0}
        ]},
        Total: { forTitle: true, needEdit: false, canEdit: false, values: [
          {N: "DEF", Value: 0}
        ]},
      },
    {
    Codigo: "0010",
    Nombre: "Neider Fabian",
    Apellido: "Walteros Pinto",
    Corte1: { needEdit: true, canEdit: true, values: [
      {N: "P1", Value: 4.5, Perc: 10},
      {N: "P2", Value: 3.5, Perc: 10},
      {N: "P3", Value: 4.0, Perc: 10}
    ]},
    Corte2: { needEdit: true, canEdit: true, values: [
      {N: "P4", Value: 4.5, Perc: 10},
      {N: "P5", Value: 3.5, Perc: 10},
      {N: "P6", Value: 4.0, Perc: 10}
    ]},
    LabExamHabAcu: { needEdit: true, canEdit: true, values: [
      {N: "Lab", Value: 4.5, Perc: 10},
      {N: "Exam", Value: 3.5, Perc: 30},
      {N: "Hab", Value: 0, Perc: 70},
      {N: "ACU", Value: 3.9}
    ]},
    Varios: { needEdit: true, canEdit: true, values: [
      {N: "Fallas", Value: 3},
      {N: "OBS", Value: 0}
    ]},
    Total: { needEdit: true, canEdit: true, values: [
      {N: "DEF", Value: 4.0}
    ]},
  },
  {
  Codigo: "0010",
  Nombre: "Neider Fabian",
  Apellido: "Walteros Pinto",
  Corte1: { needEdit: true, canEdit: true, values: [
    {N: "P1", Value: 4.5, Perc: 10},
    {N: "P2", Value: 3.5, Perc: 10},
    {N: "P3", Value: 4.0, Perc: 10}
  ]},
  Corte2: { needEdit: true, canEdit: true, values: [
    {N: "P4", Value: 4.5, Perc: 10},
    {N: "P5", Value: 3.5, Perc: 10},
    {N: "P6", Value: 4.0, Perc: 10}
  ]},
  LabExamHabAcu: { needEdit: true, canEdit: true, values: [
    {N: "Lab", Value: 4.5, Perc: 10},
    {N: "Exam", Value: 3.5, Perc: 30},
    {N: "Hab", Value: 0, Perc: 70},
    {N: "ACU", Value: 3.9}
  ]},
  Varios: { needEdit: true, canEdit: true, values: [
    {N: "Fallas", Value: 3},
    {N: "OBS", Value: 0}
  ]},
  Total: { needEdit: true, canEdit: true, values: [
    {N: "DEF", Value: 4.0}
  ]},
},
{
Codigo: "0010",
Nombre: "Neider Fabian",
Apellido: "Walteros Pinto",
Corte1: { needEdit: true, canEdit: true, values: [
  {N: "P1", Value: 4.5, Perc: 10},
  {N: "P2", Value: 3.5, Perc: 10},
  {N: "P3", Value: 4.0, Perc: 10}
]},
Corte2: { needEdit: true, canEdit: true, values: [
  {N: "P4", Value: 4.5, Perc: 10},
  {N: "P5", Value: 3.5, Perc: 10},
  {N: "P6", Value: 4.0, Perc: 10}
]},
LabExamHabAcu: { needEdit: true, canEdit: true, values: [
  {N: "Lab", Value: 4.5, Perc: 10},
  {N: "Exam", Value: 3.5, Perc: 30},
  {N: "Hab", Value: 0, Perc: 70},
  {N: "ACU", Value: 3.9}
]},
Varios: { needEdit: true, canEdit: true, values: [
  {N: "Fallas", Value: 3},
  {N: "OBS", Value: 0}
]},
Total: { needEdit: true, canEdit: true, values: [
  {N: "DEF", Value: 4.0}
]},
},
{
Codigo: "0010",
Nombre: "Neider Fabian",
Apellido: "Walteros Pinto",
Corte1: { needEdit: true, canEdit: true, values: [
  {N: "P1", Value: 4.5, Perc: 10},
  {N: "P2", Value: 3.5, Perc: 10},
  {N: "P3", Value: 4.0, Perc: 10}
]},
Corte2: { needEdit: true, canEdit: true, values: [
  {N: "P4", Value: 4.5, Perc: 10},
  {N: "P5", Value: 3.5, Perc: 10},
  {N: "P6", Value: 4.0, Perc: 10}
]},
LabExamHabAcu: { needEdit: true, canEdit: true, values: [
  {N: "Lab", Value: 4.5, Perc: 10},
  {N: "Exam", Value: 3.5, Perc: 30},
  {N: "Hab", Value: 0, Perc: 70},
  {N: "ACU", Value: 3.9}
]},
Varios: { needEdit: true, canEdit: true, values: [
  {N: "Fallas", Value: 3},
  {N: "OBS", Value: 0}
]},
Total: { needEdit: true, canEdit: true, values: [
  {N: "DEF", Value: 4.0}
]},
},
{
Codigo: "0010",
Nombre: "Neider Fabian",
Apellido: "Walteros Pinto",
Corte1: { needEdit: true, canEdit: true, values: [
  {N: "P1", Value: 4.5, Perc: 10},
  {N: "P2", Value: 3.5, Perc: 10},
  {N: "P3", Value: 4.0, Perc: 10}
]},
Corte2: { needEdit: true, canEdit: true, values: [
  {N: "P4", Value: 4.5, Perc: 10},
  {N: "P5", Value: 3.5, Perc: 10},
  {N: "P6", Value: 4.0, Perc: 10}
]},
LabExamHabAcu: { needEdit: true, canEdit: true, values: [
  {N: "Lab", Value: 4.5, Perc: 10},
  {N: "Exam", Value: 3.5, Perc: 30},
  {N: "Hab", Value: 0, Perc: 70},
  {N: "ACU", Value: 3.9}
]},
Varios: { needEdit: true, canEdit: true, values: [
  {N: "Fallas", Value: 3},
  {N: "OBS", Value: 0}
]},
Total: { needEdit: true, canEdit: true, values: [
  {N: "DEF", Value: 4.0}
]},
},
{
Codigo: "0010",
Nombre: "Neider Fabian",
Apellido: "Walteros Pinto",
Corte1: { needEdit: true, canEdit: true, values: [
  {N: "P1", Value: 4.5, Perc: 10},
  {N: "P2", Value: 3.5, Perc: 10},
  {N: "P3", Value: 4.0, Perc: 10}
]},
Corte2: { needEdit: true, canEdit: true, values: [
  {N: "P4", Value: 4.5, Perc: 10},
  {N: "P5", Value: 3.5, Perc: 10},
  {N: "P6", Value: 4.0, Perc: 10}
]},
LabExamHabAcu: { needEdit: true, canEdit: true, values: [
  {N: "Lab", Value: 4.5, Perc: 10},
  {N: "Exam", Value: 3.5, Perc: 30},
  {N: "Hab", Value: 0, Perc: 70},
  {N: "ACU", Value: 3.9}
]},
Varios: { needEdit: true, canEdit: true, values: [
  {N: "Fallas", Value: 3},
  {N: "OBS", Value: 0}
]},
Total: { needEdit: true, canEdit: true, values: [
  {N: "DEF", Value: 4.0}
]},
}

];